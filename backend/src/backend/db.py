from typing import Annotated

from fastapi import Depends
from sqlmodel import Session, create_engine

from backend.config import settings

engine = create_engine(settings.database_url, echo=True)

def get_session():
    with Session(engine) as session:
        yield session

SessionDependency = Annotated[Session, Depends(get_session)]
