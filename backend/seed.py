"""
Food in Forest - Standalone Database Seed Script
Uploads all categories, foods, offers, hotel details, sample users, and sample orders to Firebase Realtime Database.
"""

import os
import sys
import json
import requests

# Fix Windows console UTF-8 printing
if sys.platform.startswith('win'):
    sys.stdout.reconfigure(encoding='utf-8')

DEFAULT_DB_URL = "https://food-in-forest-default-rtdb.firebaseio.com"

def seed():
    db_url = os.environ.get("FIREBASE_DATABASE_URL", DEFAULT_DB_URL).rstrip('/')
    seed_path = os.path.join(os.path.dirname(__file__), '..', 'firebase', 'seed-data.json')
    
    if not os.path.exists(seed_path):
        print(f"[Error] seed-data.json not found at {seed_path}")
        sys.exit(1)
        
    print(f"[Food in Forest] Reading seed data from {seed_path}...")
    with open(seed_path, 'r', encoding='utf-8') as f:
        data = json.load(f)
        
    print(f"[Food in Forest] Seeding to Firebase RTDB at {db_url}...")
    
    for node, payload in data.items():
        url = f"{db_url}/{node}.json"
        print(f"  -> Uploading node: /{node}...")
        try:
            resp = requests.put(url, json=payload, timeout=12)
            if resp.status_code == 200:
                print(f"     [OK] /{node} written successfully.")
            else:
                print(f"     [WARN] /{node} returned status {resp.status_code}: {resp.text}")
        except Exception as e:
            print(f"     [FAIL] Failed to write /{node}: {e}")
            
    print("\n[Complete] Database seeding completed!")

if __name__ == '__main__':
    seed()

