from sqlalchemy.orm import Session

import models


def add_bulb(db, ip):
    bulb = get_bulb(db, ip)
    if not bulb:
        new_bulb = models.Bulb(ip=ip, name=ip, state=0, scene_id=0, scene="")
        db.add(new_bulb)
        db.commit()
        db.refresh(new_bulb)
    #     return new_bulb
    # return bulb


def get_all_bulbs(db):
    return db.query(models.Bulb).order_by(models.Bulb.name).all()


def get_online_bulbs(db):
    return db.query(models.Bulb).filter(models.Bulb.state >= 0).order_by(models.Bulb.name).all()


def get_bulbs(db, ip_or_name):
    return db.query(models.Bulb).filter((models.Bulb.ip == ip_or_name) | (models.Bulb.name == ip_or_name)).order_by(
        models.Bulb.name).all()


def get_bulb(db, ip):
    return db.query(models.Bulb).filter(models.Bulb.ip == ip).first()


def edit_bulb(db, ip, name):
    db.query(models.Bulb).filter(models.Bulb.ip == ip).update({models.Bulb.name: name})
    db.commit()


def update_bulb_state(db, ip, state, scene_id, scene):
    db.query(models.Bulb).filter(models.Bulb.ip == ip).update(
        {models.Bulb.state: state, models.Bulb.scene_id: scene_id, models.Bulb.scene: scene})
    db.commit()


def update_bulb_down(db, ip):
    db.query(models.Bulb).filter(models.Bulb.ip == ip).update({models.Bulb.state: -1})
    db.commit()


def delete_bulb(db, ip):
    bulb = db.query(models.Bulb).filter_by(ip=ip).first()
    # if not bulb:
    db.delete(bulb)
    db.commit()
