import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import os
from dotenv import load_dotenv
from pathlib import Path

load_dotenv(Path(__file__).parent / 'backend' / '.env')

mongo_url = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
db_name = os.environ.get('DB_NAME', 'test_database')

async def check_db():
    client = AsyncIOMotorClient(mongo_url, serverSelectionTimeoutMS=5000)
    db = client[db_name]
    
    print(f"\n=== Database: {db_name} ===")
    
    # List all collections
    collections = await db.list_collection_names()
    print(f"\nCollections: {collections}")
    
    if not collections:
        print("  (No collections found)")
    
    # Check each collection
    for collection_name in collections:
        collection = db[collection_name]
        count = await collection.count_documents({})
        print(f"\n--- Collection: {collection_name} ({count} documents) ---")
        
        # Show first 3 documents
        docs = await collection.find({}).limit(3).to_list(length=3)
        for doc in docs:
            # Remove _id for cleaner display
            display_doc = {k: v for k, v in doc.items() if k != '_id'}
            print(f"  {display_doc}")
    
    client.close()

asyncio.run(check_db())
