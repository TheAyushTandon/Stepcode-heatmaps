import json
import os
from typing import List

import httpx
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

load_dotenv()

app = FastAPI()

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

    weeks = [
        ContributionWeek(
            contributionDays=[
                ContributionDay(
                    date=day["date"],
                    count=day["contributionCount"],
                    level=day["contributionLevel"]
                )
                for day in week["contributionDays"]
            ]
        )
        for week in calendar["weeks"]
    ]

    return GithubHeatmapResponse(
        totalContributions=calendar["totalContributions"],
        weeks=weeks
    )


@app.get(
    "/api/leetcode/heatmap/{username}",
    response_model=LeetCodeHeatmapResponse
)
async def get_leetcode_heatmap(
    username: str,
    year: int = None
) -> LeetCodeHeatmapResponse:

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

    return LeetCodeHeatmapResponse(
        username=username,
        submission_calendar=calendar_dict
    )