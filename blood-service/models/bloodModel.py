from pydantic import BaseModel, Field
from typing import Optional

class BloodSubscription(BaseModel):
    user_id: str
    blood_type: str
    location: str

class BloodInventory(BaseModel):
    blood_type: str
    quantity: int
    location: str