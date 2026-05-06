import os
import sys
import json
from pymongo import MongoClient


def main() -> int:
    if len(sys.argv) < 2:
        print("Usage: python check_mongo_user.py <email>")
        print("Env: MONGO_URL, DB_NAME")
        return 2

    email = sys.argv[1]
    mongo_url = os.getenv("MONGO_URL", "mongodb://localhost:27017")
    db_name = os.getenv("DB_NAME", "test_database")

    client = MongoClient(mongo_url, serverSelectionTimeoutMS=5000)
    # Force a round-trip so auth errors show immediately.
    client.admin.command("ping")

    db = client[db_name]
    user = db.users.find_one({"email": email})
    print(json.dumps(user, default=str))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
