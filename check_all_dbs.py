import asyncio
import os
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
from pathlib import Path

# Load env from backend folder
load_dotenv(Path(__file__).parent / 'backend' / '.env')

async def check_all_dbs():
    mongo_url = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
    
    client = AsyncIOMotorClient(mongo_url, serverSelectionTimeoutMS=5000)
    
    # Get admin database to list all databases
    admin_db = client['admin']
    
    try:
        # List all databases
        result = await admin_db.command('listDatabases')
        databases = result.get('databases', [])
        
        print(f"\n=== All Databases on {mongo_url} ===")
        for db_info in databases:
            db_name = db_info['name']
            print(f"\nDatabase: {db_name}")
            
            # Skip admin, config, local
            if db_name in ['admin', 'config', 'local']:
                print("  (system database)")
                continue
            
            db = client[db_name]
            colls = await db.list_collection_names()
            
            if colls:
                print(f"  Collections: {colls}")
                for coll_name in colls:
                    count = await db[coll_name].count_documents({})
                    print(f"    - {coll_name}: {count} documents")
            else:
                print("  (no collections)")
    
    except Exception as e:
        print(f"Error: {e}")
    
    client.close()

if __name__ == '__main__':
    asyncio.run(check_all_dbs())
