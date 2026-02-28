from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes.bloodRoutes import router

app = FastAPI(title="Blood Service")

# Allow CORS so the React frontend can call this service from the browser
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # for development; tighten in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router, prefix="/blood")

@app.get("/health")
async def health():
    return {"status": "Blood Service running"}

if __name__ == "__main__":
    import uvicorn, os
    uvicorn.run(app, host="0.0.0.0", port=int(os.getenv("PORT", 5003)))