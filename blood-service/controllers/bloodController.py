from fastapi import HTTPException
from services.bloodService import add_subscription, get_subscriptions, add_blood_inventory, get_blood_inventory
from bson import ObjectId

async def create_subscription(subscription):
    await add_subscription(subscription)
    return {"message": "Subscription added"}

async def list_subscriptions(user_id):
    subscriptions = await get_subscriptions(user_id)  

    for sub in subscriptions:
        sub["_id"] = str(sub["_id"])

    return subscriptions

async def create_blood_inventory(blood):
    await add_blood_inventory(blood)
    return {"message": "Blood inventory added/updated"}

async def list_blood_inventory():
    inventories = await get_blood_inventory()  

    
    for item in inventories:
        item["_id"] = str(item["_id"])

    return inventories