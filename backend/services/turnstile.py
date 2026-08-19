import os
import requests

TURNSTILE_SECRET = os.getenv("TURNSTILE_SECRET_KEY")

def verify_turnstile(token: str) -> bool:
    response = requests.post(
        "https://challenges.cloudflare.com/turnstile/v0/siteverify",
        data={"secret": TURNSTILE_SECRET, "response": token},
    )
    result = response.json()
    return result.get("success", False)