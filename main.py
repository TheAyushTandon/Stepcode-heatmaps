import json
import os
from typing import List

import httpx
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

load_dotenv()

import sqlite3
from datetime import datetime, timedelta

# Try importing psycopg2 for Postgres support (Render database addon)
try:
    import psycopg2
    HAS_POSTGRES = True
except ImportError:
    HAS_POSTGRES = False

DATABASE_URL = os.getenv("DATABASE_URL", "")
USE_POSTGRES = HAS_POSTGRES and DATABASE_URL.startswith("postgres")

DB_FILE = "cache.db"

def get_db_connection():
    if USE_POSTGRES:
        try:
            return psycopg2.connect(DATABASE_URL)
        except Exception as e:
            print(f"Failed to connect to Postgres, falling back to SQLite: {e}")
    return sqlite3.connect(DB_FILE)

def init_db():
    conn = get_db_connection()
    cursor = conn.cursor()
    if USE_POSTGRES and DATABASE_URL.startswith("postgres"):
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS activity_cache (
                username VARCHAR(100),
                platform VARCHAR(50),
                year_val INTEGER,
                data TEXT,
                last_synced TIMESTAMP,
                PRIMARY KEY (username, platform, year_val)
            )
        """)
    else:
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS activity_cache (
                username TEXT,
                platform TEXT,
                year_val INTEGER,
                data TEXT,
                last_synced TIMESTAMP,
                PRIMARY KEY (username, platform, year_val)
            )
        """)
    conn.commit()
    conn.close()

def get_cached_data(username: str, platform: str, year: int = None, ttl_hours: int = 24):
    try:
        username_clean = username.strip().lower()
        year_key = year if year is not None else 0
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute(
            "SELECT data, last_synced FROM activity_cache WHERE username = %s AND platform = %s AND year_val = %s"
            if USE_POSTGRES else
            "SELECT data, last_synced FROM activity_cache WHERE username = ? AND platform = ? AND year_val = ?",
            (username_clean, platform, year_key)
        )
        row = cursor.fetchone()
        conn.close()
        
        if row:
            data_str, last_synced_val = row
            if isinstance(last_synced_val, str):
                last_synced = datetime.fromisoformat(last_synced_val)
            else:
                last_synced = last_synced_val
                
            if last_synced.tzinfo is not None:
                last_synced = last_synced.replace(tzinfo=None)
                
            if datetime.utcnow() - last_synced < timedelta(hours=ttl_hours):
                return json.loads(data_str)
    except Exception as e:
        print(f"Cache read error: {e}")
    return None

def set_cached_data(username: str, platform: str, year: int, data: dict):
    try:
        username_clean = username.strip().lower()
        year_key = year if year is not None else 0
        conn = get_db_connection()
        cursor = conn.cursor()
        data_str = json.dumps(data)
        now_str = datetime.utcnow().isoformat()
        
        if USE_POSTGRES:
            cursor.execute(
                """
                INSERT INTO activity_cache (username, platform, year_val, data, last_synced)
                VALUES (%s, %s, %s, %s, %s)
                ON CONFLICT (username, platform, year_val)
                DO UPDATE SET data = EXCLUDED.data, last_synced = EXCLUDED.last_synced
                """,
                (username_clean, platform, year_key, data_str, datetime.utcnow())
            )
        else:
            cursor.execute(
                """
                INSERT OR REPLACE INTO activity_cache (username, platform, year_val, data, last_synced)
                VALUES (?, ?, ?, ?, ?)
                """,
                (username_clean, platform, year_key, data_str, now_str)
            )
        conn.commit()
        conn.close()
    except Exception as e:
        print(f"Cache write error: {e}")

app = FastAPI()

@app.on_event("startup")
def startup_event():
    init_db()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Restrict in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

TOKEN = os.getenv("GITHUB_TOKEN", "")

if not TOKEN:
    print("WARNING: GITHUB_TOKEN not found in environment variables. GitHub API calls will return a configuration error.")

GENERIC_ERROR_MESSAGE = "Something went wrong."
GITHUB_GRAPHQL_URL = "https://api.github.com/graphql"
LEETCODE_GRAPHQL_URL = "https://leetcode.com/graphql"


# pydantic models
class ContributionDay(BaseModel):
    date: str
    count: int
    level: str


class ContributionWeek(BaseModel):
    contributionDays: List[ContributionDay]


class GithubHeatmapResponse(BaseModel):
    totalContributions: int
    weeks: List[ContributionWeek]


class LeetCodeHeatmapResponse(BaseModel):
    username: str
    submission_calendar: dict[str, int]


GITHUB_QUERY = """
query($username: String!, $from: DateTime, $to: DateTime) {
  user(login: $username) {
    contributionsCollection(from: $from, to: $to) {
      contributionCalendar {
        totalContributions
        weeks {
          contributionDays {
            date
            contributionCount
            contributionLevel
          }
        }
      }
    }
  }
}
"""

@app.get(
    "/api/github/heatmap/{username}",
    response_model=GithubHeatmapResponse
)
async def get_github_heatmap(username: str, year: int = None) -> GithubHeatmapResponse:
    # Check cache first
    cached = get_cached_data(username, "github", year)
    if cached:
        return GithubHeatmapResponse(**cached)

    if not TOKEN:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="GitHub Token is not configured on the backend. Please add GITHUB_TOKEN to your .env file."
        )

    headers = {
        "Authorization": f"Bearer {TOKEN}",
        "User-Agent": "FastAPI-Heatmap"
    }

    variables = {"username": username}
    if year is not None:
        variables["from"] = f"{year}-01-01T00:00:00Z"
        variables["to"] = f"{year}-12-31T23:59:59Z"

    async with httpx.AsyncClient() as client:
        try:
            response = await client.post(
                GITHUB_GRAPHQL_URL,
                headers=headers,
                json={
                    "query": GITHUB_QUERY,
                    "variables": variables
                },
                timeout=10.0
            )

        except httpx.RequestError:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail=GENERIC_ERROR_MESSAGE
            )

    if response.status_code != 200:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="GitHub API Error"
        )

    data = response.json()

    if "errors" in data:
        print("GitHub API returned errors:", data["errors"])
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=GENERIC_ERROR_MESSAGE
        )

    user = data.get("data", {}).get("user")

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="GitHub user not found."
        )

    calendar = (
        user["contributionsCollection"]
        ["contributionCalendar"]
    )

    response_data = {
        "totalContributions": calendar["totalContributions"],
        "weeks": [
            {
                "contributionDays": [
                    {
                        "date": day["date"],
                        "count": day["contributionCount"],
                        "level": day["contributionLevel"]
                    }
                    for day in week["contributionDays"]
                ]
            }
            for week in calendar["weeks"]
        ]
    }

    set_cached_data(username, "github", year, response_data)

    return GithubHeatmapResponse(**response_data)


@app.get(
    "/api/leetcode/heatmap/{username}",
    response_model=LeetCodeHeatmapResponse
)
async def get_leetcode_heatmap(
    username: str,
    year: int = None
) -> LeetCodeHeatmapResponse:
    # Check cache first
    cached = get_cached_data(username, "leetcode", year)
    if cached:
        return LeetCodeHeatmapResponse(**cached)

    graphql_query = {
        "query": """
        query userProfileCalendar($username: String!, $year: Int) {
            matchedUser(username: $username) {
                userCalendar(year: $year) {
                    submissionCalendar
                }
            }
        }
        """,
        "variables": {
            "username": username,
            "year": year
        }
    }

    headers = {
        "Content-Type": "application/json",
        "User-Agent": (
            "Mozilla/5.0 "
            "(Windows NT 10.0; Win64; x64) "
            "AppleWebKit/537.36 "
            "(KHTML, like Gecko) "
            "Chrome/120.0.0.0 Safari/537.36"
        ),
        "Referer": f"https://leetcode.com/{username}/",
        "Origin": "https://leetcode.com"
    }

    async with httpx.AsyncClient() as client:
        try:
            response = await client.post(
                LEETCODE_GRAPHQL_URL,
                json=graphql_query,
                headers=headers,
                timeout=10.0
            )

        except httpx.RequestError:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail=GENERIC_ERROR_MESSAGE
            )

    if response.status_code != 200:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=GENERIC_ERROR_MESSAGE
        )

    data = response.json()

    matched_user = data.get("data", {}).get("matchedUser")

    if not matched_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="LeetCode user not found or profile is private."
        )

    user_calendar = matched_user.get("userCalendar") or {}

    calendar_str = user_calendar.get(
        "submissionCalendar",
        "{}"
    )

    try:
        calendar_dict = json.loads(calendar_str)
    except (json.JSONDecodeError, TypeError):
        calendar_dict = {}

    response_data = {
        "username": username,
        "submission_calendar": calendar_dict
    }

    set_cached_data(username, "leetcode", year, response_data)

    return LeetCodeHeatmapResponse(**response_data)