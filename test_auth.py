#!/usr/bin/env python
"""
Simple script to test signup and login endpoints.
"""
import subprocess
import time
import json
import sys
from threading import Thread
from urllib.request import Request, urlopen
from urllib.error import URLError, HTTPError

try:
    import requests  # type: ignore
except Exception:
    requests = None


def http_post_json(url: str, payload: dict, timeout: int = 5):
    if requests is not None:
        resp = requests.post(url, json=payload, timeout=timeout)
        return resp.status_code, resp.json()

    data = json.dumps(payload).encode("utf-8")
    req = Request(url, data=data, headers={"Content-Type": "application/json"}, method="POST")
    try:
        with urlopen(req, timeout=timeout) as resp:
            body = resp.read().decode("utf-8")
            return resp.status, json.loads(body) if body else {}
    except HTTPError as e:
        body = e.read().decode("utf-8") if hasattr(e, "read") else ""
        try:
            return e.code, json.loads(body) if body else {"detail": body}
        except Exception:
            return e.code, {"detail": body}
    except URLError as e:
        raise RuntimeError(str(e))

def run_server():
    """Run uvicorn server"""
    import os
    os.chdir(r'D:\KhetBox\backend')
    subprocess.run([sys.executable, '-m', 'uvicorn', 'server:app', '--host', '127.0.0.1', '--port', '8000'])

# Start server in background thread
server_thread = Thread(target=run_server, daemon=True)
server_thread.start()

# Wait for server to start
time.sleep(4)

# Test signup
email = 'narendra@gmail.com'
signup_data = {
    'name': 'Narendra',
    'email': email,
    'password': 'password123'
}

print(f"\n=== Testing Signup for {email} ===")
try:
    status, body = http_post_json('http://127.0.0.1:8000/api/auth/signup', signup_data, timeout=5)
    print(f"Status: {status}")
    print(f"Response: {json.dumps(body, indent=2)}")
except Exception as e:
    print(f"Signup error: {e}")

# Test login
login_data = {
    'email': email,
    'password': 'password123'
}

print(f"\n=== Testing Login for {email} ===")
try:
    status, body = http_post_json('http://127.0.0.1:8000/api/auth/login', login_data, timeout=5)
    print(f"Status: {status}")
    print(f"Response: {json.dumps(body, indent=2)}")
except Exception as e:
    print(f"Login error: {e}")

# Check MongoDB
print(f"\n=== Checking MongoDB for {email} ===")
try:
    import subprocess
    result = subprocess.run(
        [sys.executable, r'D:\KhetBox\check_mongo_user.py', email],
        capture_output=True,
        text=True,
        timeout=5
    )
    print(result.stdout)
    if result.stderr:
        print("Errors:", result.stderr)
except Exception as e:
    print(f"MongoDB check error: {e}")

time.sleep(1)
