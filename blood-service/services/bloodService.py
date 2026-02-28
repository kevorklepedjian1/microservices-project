from config.db import db

async def add_subscription(subscription):
    await db.subscriptions.insert_one(subscription)

async def get_subscriptions(user_id):
    return await db.subscriptions.find({"user_id": user_id}).to_list(100)

async def add_blood_inventory(blood):
    existing = await db.blood_inventory.find_one({
        "blood_type": blood["blood_type"], "location": blood["location"]
    })
    if existing:
        update = {"quantity": blood["quantity"]}
        if "region_name" in blood:
            update["region_name"] = blood["region_name"]
        await db.blood_inventory.update_one(
            {"_id": existing["_id"]},
            {"$set": update}
        )
    else:
        await db.blood_inventory.insert_one(blood)

async def get_blood_inventory():
    return await db.blood_inventory.find({}).to_list(100)

async def add_blood_demand(demand):
    demand["created_at"] = __import__("datetime").datetime.utcnow().isoformat()
    await db.blood_demands.insert_one(demand)

async def get_blood_demands():
    return await db.blood_demands.find({}).sort("created_at", -1).to_list(100)