from datetime import datetime
import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from server.app.audio import routes as audio_router
from server.app.auth import routes as auth_router

app = FastAPI()

origins = [
    "http://localhost",
    "http://localhost:3000",
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
app.include_router(auth_router.router)


if __name__ == '__main__':
    uvicorn.run("main:app", host="localhost", port=8008, reload=True)
