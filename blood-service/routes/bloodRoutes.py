from fastapi import APIRouter, Depends, Header, HTTPException
from controllers.bloodController import (
    create_subscription,
    list_subscriptions,
    create_blood_inventory,
    list_blood_inventory,
    create_blood_demand,
    list_blood_demands,
)

router = APIRouter()

def get_current_user(x_user_id: str = Header(...), x_role: str = Header(...)):
    if not x_user_id:
        raise HTTPException(status_code=401, detail="Unauthorized")
    return {"user_id": x_user_id, "role": x_role}

@router.get("/user/availability")
async def availability(user=Depends(get_current_user)):
    return await list_blood_inventory()

@router.get("/user/demands")
async def demands(user=Depends(get_current_user)):
    return await list_blood_demands()

@router.post("/user/subscribe")
async def subscribe(subscription: dict, user=Depends(get_current_user)):
    subscription["user_id"] = user["user_id"]
    return await create_subscription(subscription)

@router.get("/user/subscriptions")
async def subscriptions(user=Depends(get_current_user)):
    return await list_subscriptions(user["user_id"])

@router.post("/admin/blood")
async def add_blood(blood: dict, user=Depends(get_current_user)):
    if user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Access denied")
    return await create_blood_inventory(blood)

@router.get("/admin/blood")
async def blood_inventory(user=Depends(get_current_user)):
    if user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Access denied")
    return await list_blood_inventory()

@router.post("/admin/demand")
async def add_demand(demand: dict, user=Depends(get_current_user)):
    if user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Access denied")
    return await create_blood_demand(demand)

@router.get("/admin/demands")
async def admin_demands(user=Depends(get_current_user)):
    if user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Access denied")
    return await list_blood_demands()