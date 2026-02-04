import sys, json
from pymongo import MongoClient

if len(sys.argv) < 2:
    print("Usage: python check_mongo_user.py <email>")
    sys.exit(2)

email = sys.argv[1]
client = MongoClient("mongodb://localhost:27017")
db = client["test_database"]
user = db.users.find_one({"email": email})
print(json.dumps(user, default=str))
