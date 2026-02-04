"""
Test backend endpoints to confirm data is being read from MongoDB.
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
print("Starting backend server...")
server_thread = Thread(target=run_server, daemon=True)
server_thread.start()

# Wait for server to start
time.sleep(5)

# Base URL
base_url = 'http://127.0.0.1:8000/api'

endpoints = [
    ('/status', 'Status'),
    ('/storage', 'Storage'),
    ('/alerts', 'Alerts'),
    ('/reports/daily', 'Daily Reports'),
    ('/cctv/streams', 'CCTV Streams'),
]

print("\n" + "="*60)
print("Testing Backend Endpoints (Reading from MongoDB)")
print("="*60)

for endpoint, name in endpoints:
    print(f"\n--- {name} ({endpoint}) ---")
    try:
        resp = requests.get(f'{base_url}{endpoint}', timeout=5)
        print(f"Status: {resp.status_code}")
        data = resp.json()
        print(f"Response preview:")
        print(json.dumps(data, indent=2, default=str)[:300] + "...")
    except Exception as e:
        print(f"Error: {e}")

print("\n" + "="*60)
print("✓ Test complete!")
time.sleep(1)
