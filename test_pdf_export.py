"""
Test PDF export endpoint.
"""
import subprocess
import time
import requests
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

# Test PDF export
print("\n=== Testing PDF Export ===")
try:
    resp = requests.get('http://127.0.0.1:8000/api/reports/export-pdf', timeout=10)
    print(f"Status: {resp.status_code}")
    
    if resp.status_code == 200:
        # Save the PDF to file
        with open('D:\\KhetBox\\test-report.pdf', 'wb') as f:
            f.write(resp.content)
        print(f"PDF generated successfully! ({len(resp.content)} bytes)")
        print(f"Saved to: D:\\KhetBox\\test-report.pdf")
    else:
        print(f"Error: {resp.text}")
except Exception as e:
    print(f"Failed: {e}")

time.sleep(1)
