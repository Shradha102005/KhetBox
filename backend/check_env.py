import sys
import os

print(f"Working directory: {os.getcwd()}")
print(f"Python path: {sys.path[:3]}")
print(f"Backend folder exists: {os.path.exists('D:\\KhetBox\\backend')}")
print(f"server.py exists: {os.path.exists('D:\\KhetBox\\backend\\server.py')}")
print(f"Current files in cwd: {os.listdir('.')}")
