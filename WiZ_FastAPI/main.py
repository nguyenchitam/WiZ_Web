import os
from fastapi import FastAPI, HTTPException, status, Response, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from fastapi.requests import Request
import uvicorn
from sqlalchemy.orm import Session

import db
import models
import repo
import wiz
from schemas import BulbInput

app = FastAPI()

models.Base.metadata.create_all(bind=db.engine)

origins = [
    "http://localhost:3000",
    "localhost:3000"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

build_path = '../wiz-react/build'
if os.path.exists('../wiz-react/build'):
    templates = Jinja2Templates(directory=build_path)
    app.mount('/static', StaticFiles(directory=f"{build_path}/static"), 'static')


@app.get("/wiz/scan")
async def scan_bulbs(db: Session = Depends(db.get_db)):
    try:
        bulbs = await wiz.scan(db)
        print(f'scan: {bulbs}')
        return {'bulbs': bulbs}
    except Exception as error:
        return {'error': f"Scan error: {error}"}


@app.get("/wiz/on/{ip_or_name}")
async def switch_on_bulb(ip_or_name: str, db: Session = Depends(db.get_db)):
    try:
        bulbs = []
        db_bulbs = repo.get_online_bulbs(db) if ip_or_name == 'all' else repo.get_bulbs(db, ip_or_name)
        for bulb in db_bulbs:
            bulbs.append(await wiz.on(bulb.ip, db))

        print(f'on: {bulbs}')
        return {'bulbs': bulbs}
    except Exception as error:
        return {'error': f"Cannot on '{ip_or_name}': {error}"}


@app.get("/wiz/off/{ip_or_name}")
async def switch_off_bulb(ip_or_name: str, db: Session = Depends(db.get_db)):
    try:
        bulbs = []
        db_bulbs = repo.get_online_bulbs(db) if ip_or_name == 'all' else repo.get_bulbs(db, ip_or_name)
        for bulb in db_bulbs:
            bulbs.append(await wiz.off(bulb.ip, db))

        print(f'off: {bulbs}')
        return {'bulbs': bulbs}
    except Exception as error:
        return {'error': f"Cannot off '{ip_or_name}': {error}"}


@app.get("/wiz/scene/{ip_or_name}/{scene_id}")
async def change_bulb_scene(ip_or_name: str, scene_id: int, db: Session = Depends(db.get_db)):
    try:
        bulbs = []
        db_bulbs = repo.get_online_bulbs(db) if ip_or_name == 'all' else repo.get_bulbs(db, ip_or_name)
        for bulb in db_bulbs:
            bulbs.append(await wiz.scene(bulb.ip, scene_id, db))

        print(f'scene: {bulbs}')
        return {'bulbs': bulbs}
    except Exception as error:
        return {'error': f"Cannot change scene '{ip_or_name}': {error}"}


@app.get("/wiz/toggle/{ip_or_name}/{scene_id}")
async def toggle_bulb_scene(ip_or_name: str, scene_id: int, db: Session = Depends(db.get_db)):
    try:
        bulbs = []
        db_bulbs = repo.get_online_bulbs(db) if ip_or_name == 'all' else repo.get_bulbs(db, ip_or_name)
        for bulb in db_bulbs:
            if bulb.state == 0 or bulb.scene_id != scene_id:
                bulbs.append(await wiz.scene(bulb.ip, scene_id, db))
            else:
                bulbs.append(await wiz.off(bulb.ip, db))

        print(f'toggle: {bulbs}')
        return {'bulbs': bulbs}
    except Exception as error:
        return {'error': f"Cannot toggle scene '{ip_or_name}': {error}"}


@app.get("/crud/bulbs")
def get_all_bulbs(db: Session = Depends(db.get_db)):
    bulbs = repo.get_all_bulbs(db)
    return {'bulbs': bulbs}


@app.get("/crud/bulbs/{ip}")
def get_bulb(ip: str, db: Session = Depends(db.get_db)):
    bulb = repo.get_bulb(db, ip)
    if not bulb:
        return Response(status_code=status.HTTP_404_NOT_FOUND)
    return bulb


@app.put("/crud/bulbs/{ip}")
def edit_bulb(ip: str, bulb_input: BulbInput, db: Session = Depends(db.get_db)):
    bulb = repo.get_bulb(db, ip)
    if not bulb:
        return Response(status_code=status.HTTP_404_NOT_FOUND)
    repo.edit_bulb(db, ip, bulb_input.name)
    return {'bulbs': [bulb]}


@app.delete("/crud/bulbs/{ip}")
def delete_bulb(ip: str, db: Session = Depends(db.get_db)):
    bulb = repo.get_bulb(db, ip)
    if not bulb:
        return Response(status_code=status.HTTP_404_NOT_FOUND)
    repo.delete_bulb(db, ip)
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@app.get("/{rest_of_path:path}")
async def react_app(req: Request, rest_of_path: str):
    return templates.TemplateResponse('index.html', {'request': req})


if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8001, reload=True, log_level="info")
