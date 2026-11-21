#!/usr/bin/env python3
import os
import requests
from dotenv import load_dotenv

load_dotenv()

port = os.getenv("PORT")

try:
    url = f"http://localhost:{port}/health"

    print(f"Checking API health at: {url}...")
    response = requests.get(url, timeout=5)

    if response.status_code == 200:
        print("SUCCESS: API is reachable and healthy.")
    else:
        print(f"WARNING: API returned status code {response.status_code}")
except FileNotFoundError:
    print("CRITICAL: .env not found.")
except requests.exceptions.ConnectionError:
    print("CRITICAL: Could not connect to server. Is Node.js running?")
except Exception as e:
    print(f"ANOMALY: An unexpected error occurred: {e}")
finally:
    print("--- System Check Finished ---")
