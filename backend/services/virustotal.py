import os
import base64
import time
import requests

VT_KEY = os.getenv("VIRUSTOTAL_KEY")
HEADERS = {"x-apikey": VT_KEY}

def _url_to_id(url: str) -> str:
    return base64.urlsafe_b64encode(url.encode()).decode().strip("=")

def check_virustotal(url: str) -> dict:
    url_id = _url_to_id(url)

    # Try to get an existing scan result first
    response = requests.get(f"https://www.virustotal.com/api/v3/urls/{url_id}", headers=HEADERS)

    if response.status_code == 404:
        # Not scanned before — submit it
        submit = requests.post("https://www.virustotal.com/api/v3/urls", headers=HEADERS, data={"url": url})
        submit.raise_for_status()
        analysis_id = submit.json()["data"]["id"]

        # Poll briefly until the analysis finishes
        for _ in range(5):
            time.sleep(2)
            check = requests.get(f"https://www.virustotal.com/api/v3/analyses/{analysis_id}", headers=HEADERS)
            check.raise_for_status()
            status = check.json()["data"]["attributes"]["status"]
            if status == "completed":
                stats = check.json()["data"]["attributes"]["stats"]
                break
        else:
            return {"flagged": None, "detail": "analysis timed out"}
    else:
        response.raise_for_status()
        stats = response.json()["data"]["attributes"]["last_analysis_stats"]

    malicious = stats.get("malicious", 0)
    total = sum(stats.values())
    return {"flagged": malicious > 0, "detail": f"{malicious}/{total} engines flagged"}