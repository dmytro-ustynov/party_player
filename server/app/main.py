from datetime import datetime
import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from server.app.audio import routes as audio_router
from server.app.users import routes as user_router
from server.app.image_service import routes as img_router
from decouple import config as env

app = FastAPI()

origins = [
    env('HOST_ADDRESS', "http://localhost"),
    "http://localhost:3000"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
async def root():
    return {"result": True, "details": f"running {datetime.now().strftime('%Y-%m-%d %H:%M:%S.%f')}"}


app.include_router(audio_router.router)
app.include_router(user_router.router)
app.include_router(img_router.router)


if __name__ == "__main__":
    host = env("API_HOST", "localhost")
    port = env("API_PORT", cast=int, default=5000)
    uvicorn.run("main:app", host=host, port=port, reload=True, reload_excludes="data")
