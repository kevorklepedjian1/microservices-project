from fastapi import FastAPI
from routes.bloodRoutes import router

app = FastAPI(title="Blood Service")

app.include_router(router, prefix="/blood")

@app.get("/health")
async def health():
    return {"status": "Blood Service running"}

if __name__ == "__main__":
    import uvicorn, os
    uvicorn.run(app, host="0.0.0.0", port=int(os.getenv("PORT", 5003)))