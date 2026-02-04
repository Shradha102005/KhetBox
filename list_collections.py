import asyncio
import os
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
from pathlib import Path

# Load env from backend folder
load_dotenv(Path(__file__).parent / 'backend' / '.env')

async def check_db():
    mongo_url = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
    db_name = os.environ.get('DB_NAME', 'test_database')
    
    client = AsyncIOMotorClient(mongo_url, serverSelectionTimeoutMS=5000)
    db = client[db_name]
    
    print(f"\n=== Database: {db_name} ===")
    colls = await db.list_collection_names()
    print(f"Collections: {colls}")
    
    for coll_name in colls:
        count = await db[coll_name].count_documents({})
        print(f"  {coll_name}: {count} documents")
    
    client.close()

if __name__ == '__main__':
    asyncio.run(check_db())
