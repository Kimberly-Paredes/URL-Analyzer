import os
import requests

GOOGLE_KEY = os.getenv("GOOGLE_SAFE_BROWSING_KEY")
SAFE_BROWSING_URL = f"https://safebrowsing.googleapis.com/v4/threatMatches:find?key={GOOGLE_KEY}"

def check_safe_browsing(url: str) -> dict:
    payload = {
        "client": {"clientId": "url-analyzer", "clientVersion": "1.0"},
        "threatInfo": {
            "threatTypes": ["MALWARE", "SOCIAL_ENGINEERING", "UNWANTED_SOFTWARE"],
            "platformTypes": ["ANY_PLATFORM"],
            "threatEntryTypes": ["URL"],
            "threatEntries": [{"url": url}],
        },
    }

    response = requests.post(SAFE_BROWSING_URL, json=payload)
    response.raise_for_status()
    data = response.json()

    if "matches" in data:
        return {"flagged": True, "detail": data["matches"][0]["threatType"]}
    return {"flagged": False, "detail": "clean"}