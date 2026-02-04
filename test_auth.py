#!/usr/bin/env python
"""
Simple script to test signup and login endpoints.
"""
import subprocess
import time
import requests
import json
import sys
from threading import Thread

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
    resp = requests.post(
        'http://127.0.0.1:8000/api/auth/signup',
        json=signup_data,
        timeout=5
    )
    print(f"Status: {resp.status_code}")
    print(f"Response: {json.dumps(resp.json(), indent=2)}")
except Exception as e:
    print(f"Signup error: {e}")

# Test login
login_data = {
    'email': email,
    'password': 'password123'
}

print(f"\n=== Testing Login for {email} ===")
try:
    resp = requests.post(
        'http://127.0.0.1:8000/api/auth/login',
        json=login_data,
        timeout=5
    )
    print(f"Status: {resp.status_code}")
    print(f"Response: {json.dumps(resp.json(), indent=2)}")
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
