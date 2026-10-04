import os
import requests
import json
from typing import Dict, Any, Optional

DEFAULT_DB_URL = "https://food-in-forest-default-rtdb.firebaseio.com"

class FirebaseService:
    def __init__(self, db_url: Optional[str] = None):
        self.db_url = (db_url or os.environ.get("FIREBASE_DATABASE_URL", DEFAULT_DB_URL)).rstrip('/')

    def _url(self, path: str) -> str:
        clean_path = path.strip('/')
        return f"{self.db_url}/{clean_path}.json"

    def get(self, path: str) -> Optional[Any]:
        try:
            resp = requests.get(self._url(path), timeout=8)
            if resp.status_code == 200:
                return resp.json()
            return None
        except Exception as e:
            print(f"[FirebaseService] Error in GET {path}: {e}")
            return None

    def set(self, path: str, data: Any) -> bool:
        try:
            resp = requests.put(self._url(path), json=data, timeout=8)
            return resp.status_code == 200
        except Exception as e:
            print(f"[FirebaseService] Error in PUT {path}: {e}")
            return False

    def update(self, path: str, data: Dict[str, Any]) -> bool:
        try:
            resp = requests.patch(self._url(path), json=data, timeout=8)
            return resp.status_code == 200
        except Exception as e:
            print(f"[FirebaseService] Error in PATCH {path}: {e}")
            return False

    def delete(self, path: str) -> bool:
        try:
            resp = requests.delete(self._url(path), timeout=8)
            return resp.status_code == 200
        except Exception as e:
            print(f"[FirebaseService] Error in DELETE {path}: {e}")
            return False

    def push(self, path: str, data: Any) -> Optional[str]:
        try:
            resp = requests.post(self._url(path), json=data, timeout=8)
            if resp.status_code == 200:
                res = resp.json()
                return res.get('name')
            return None
        except Exception as e:
            print(f"[FirebaseService] Error in POST {path}: {e}")
            return None

firebase_service = FirebaseService()
