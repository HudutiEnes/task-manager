#!/usr/bin/env python3
import os
import requests
from dotenv import load_dotenv

load_dotenv()

port = os.getenv("PORT");

url = f"http://localhost:{port}/api/v1"

app_config = {
    "project_name": "task-manager-api",
    "version": "1.0.0",
    "env": "local",
    "url": url,
    "root_path": "../",
}

endpoints = ["/", "/tasks", "/non-existent"]


def auditor(url, route):
    full_path = f"{url}{route}"
    # In future i add 'requests.get()' call
    print(f"Checking: {full_path}")

    if route == "/":
        return {"route": route, "status": "SUCCESS"}
    else:
        return {"route": route, "status": "FAIL"}


report_summary = []

for route in endpoints:
    result = auditor(app_config["url"], route)
    report_summary.append(result)


print("--- TASK MANAGER API HEALTH REPORT ---")


for result in report_summary:
    route_name = result["route"]
    status_val = result["status"]

    print(f"Route is: {route_name}")

    if status_val == "SUCCESS":
        print(f"PASS: {route_name} is active.")
    else:
        print(f"FAIL: {route_name} is pending or missing.")
