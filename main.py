import httpx
from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime
import os
from dotenv import load_dotenv
import json
from pydantic import BaseModel

load_dotenv()
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # to be adjusted in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


TOKEN = os.getenv("GITHUB_TOKEN")
GENERIC_ERROR_MESSAGE = "Something went wrong."
LEETCODE_GRAPHQL_URL = "https://leetcode.com/graphql"

GRAPHQL_QUERY = """
query($username: String!) {
  user(login: $username) {
    contributionsCollection {
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

@app.get("/api/github/heatmap/{username}")
async def get_clean_heatmap(username: str):
    headers = {
        "Authorization": f"Bearer {TOKEN}",
        "User-Agent": "FastAPI-Heatmap"
    }
    
    async with httpx.AsyncClient() as client:
        response = await client.post(
            "https://api.github.com/graphql",
            headers=headers,
            timeout=10.0,
            json={"query": GRAPHQL_QUERY, "variables": {"username": username},}
        )
        
        if response.status_code != 200:
            raise HTTPException(status_code=response.status_code, detail="GitHub API Error")
            
        raw_data = response.json()
        
        if "errors" in raw_data:
            raise HTTPException(
            status_code=404,
            detail=GENERIC_ERROR_MESSAGE
)
        
        user = raw_data.get("data", {}).get("user")
        if not user:
            raise HTTPException(
                status_code=404,
                detail=GENERIC_ERROR_MESSAGE
            )   
        calendar = raw_data["data"]["user"]["contributionsCollection"]["contributionCalendar"]
        
        formatted_weeks = []
        for week in calendar["weeks"]:
            days = []
            for day in week["contributionDays"]:
                days.append({
                    "date": day["date"],
                    "count": day["contributionCount"],
                    "level": day["contributionLevel"]  # NONE, FIRST_QUARTILE, etc.
                })
            formatted_weeks.append({"contributionDays": days})
            
        return {
            "totalContributions": calendar["totalContributions"],
            "weeks": formatted_weeks
        }
    
class HeatmapResponse(BaseModel):
    username: str
    submission_calendar: dict[str, int]

@app.get("/api/leetcode/heatmap/{username}", response_model=HeatmapResponse)
async def get_leetcode_heatmap(username: str):
    """
    Fetches the submission calendar for a specific LeetCode user.
    Returns a dictionary where keys are Unix timestamps (seconds) and values are submission counts.
    """
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
        "variables": {"username": username}
    }

    # leetcode needs valid headers otherwise block kardeta hai
    headers = {
        "Content-Type": "application/json",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Referer": f"https://leetcode.com/{username}/"
    }

    async with httpx.AsyncClient() as client:
        try:
            response = await client.post(LEETCODE_GRAPHQL_URL, json=graphql_query, headers=headers, timeout=10.0)
            
            if response.status_code != 200:
                raise HTTPException(
                    status_code=status.HTTP_502_BAD_GATEWAY, 
                    detail=GENERIC_ERROR_MESSAGE
                )
                
            data = response.json()
            
        except httpx.RequestError as exc:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail=GENERIC_ERROR_MESSAGE
            )

    matched_user = data.get("data", {}).get("matchedUser")
    if not matched_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="LeetCode user not found or profile is private."
        )

    calendar_str = matched_user.get("userCalendar", {}).get("submissionCalendar", "{}")
    
    try:
        calendar_dict = json.loads(calendar_str)
    except (json.JSONDecodeError, TypeError):
        calendar_dict = {}

    return {
        "username": username,
        "submission_calendar": calendar_dict
    }