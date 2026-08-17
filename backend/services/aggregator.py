from services.safe_browsing import check_safe_browsing
from services.virustotal import check_virustotal

def analyze_url(url: str) -> dict:
    sb_result = check_safe_browsing(url)
    vt_result = check_virustotal(url)

    if sb_result["flagged"] or vt_result["flagged"]:
        verdict = "malicious"
    else:
        verdict = "safe"

    return {
        "url": url,
        "verdict": verdict,
        "sources": {
            "google_safe_browsing": sb_result["detail"],
            "virustotal": vt_result["detail"],
        },
    }