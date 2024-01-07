from sqlalchemy import Column, ForeignKey, Integer, String, Float

from db import Base


class Bulb(Base):
    __tablename__ = "bulbs"

    ip = Column(String(16), primary_key=True, index=True)
    name = Column(String(32), nullable=False)
    state = Column(Integer, nullable=False, default=-1)
    scene_id = Column(Integer, nullable=False, default=0)
    scene = Column(String(32), nullable=True)

    def __repr__(self):
        return f'Bulb(ip={self.ip}, name={self.name}, state={self.state}, scene_id={self.scene_id}, scene={self.scene})'
