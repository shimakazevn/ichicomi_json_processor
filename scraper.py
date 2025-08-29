import requests
from bs4 import BeautifulSoup
import html
import json

def get_episode_json(url):
    headers = {
        "User-Agent": (
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
            "AppleWebKit/537.36 (KHTML, like Gecko) "
            "Chrome/127.0.0.0 Safari/537.36"
        )
    }

    r = requests.get(url, headers=headers)
    r.raise_for_status()
    html_doc = r.text

    soup = BeautifulSoup(html_doc, "html.parser")
    body = soup.find("body", {"id": "page-viewer"})
    if not body:
        raise ValueError("No <body id='page-viewer'> found on page")

    script = body.find("script", {"id": "episode-json"})
    if not script or "data-value" not in script.attrs:
        raise ValueError("No <script id='episode-json'> found")

    raw = script["data-value"]
    decoded = html.unescape(raw)
    data = json.loads(decoded)
    return data