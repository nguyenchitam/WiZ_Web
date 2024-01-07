from pydantic import BaseModel


class BulbInput(BaseModel):
    name: str