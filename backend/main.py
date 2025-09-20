from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import create_engine, Column, Integer, String, ForeignKey
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
from pydantic import BaseModel
from passlib.context import CryptContext
from jose import JWTError, jwt
from datetime import datetime, timedelta
from typing import Optional
import os

# Quick and dirty SQLite setup - good enough for development
# Would switch to PostgreSQL in production, but this works for now
DATABASE_URL = "sqlite:///./todo.db"
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# Database models - keeping it simple but functional


class User(Base):
    """Basic user info - nothing fancy here"""
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)  # emails need to be unique
    hashed_password = Column(String)  # never store plain passwords


class Board(Base):
    """Boards for organizing tasks - like Trello but simpler"""
    __tablename__ = "boards"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    # each board belongs to a user
    user_id = Column(Integer, ForeignKey("users.id"))


class Task(Base):
    """The actual tasks - what everything revolves around"""
    __tablename__ = "tasks"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)  # searchable titles
    description = Column(String)
    # status flow: todo -> in-progress -> done
    status = Column(String, default="todo")
    board_id = Column(Integer, ForeignKey("boards.id"))  # belongs to a board


# Create tables if they don't exist - first run setup
Base.metadata.create_all(bind=engine)

# API data models - keeping the frontend happy


class UserCreate(BaseModel):
    """Schema for registering a new user."""
    email: str
    password: str  # Will be hashed before saving


class BoardCreate(BaseModel):
    """Schema for creating a board."""
    title: str


class TaskCreate(BaseModel):
    """Schema for creating a task."""
    title: str
    description: str = ""  # Optional field
    board_id: int


class TaskUpdate(BaseModel):
    """Schema for updating a task. All fields are optional."""
    title: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = None


# Security configuration - in production, use environment variables
SECRET_KEY = "your-secret-key"  # TODO: move to .env
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

# Password hashing setup
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

# Initialize FastAPI application
app = FastAPI()

# CORS setup - allows frontend to communicate with backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000",
                   "https://your-todo-app.vercel.app"],  # Frontend domains
    # Allow cookies and tokens
    allow_credentials=True,
    # Allow all HTTP methods
    allow_methods=["*"],
    allow_headers=["*"],                                  # Accept all headers
)


# Database dependency - provides database sessions
def get_db():
    """Provides a database session and ensures proper cleanup."""
    db = SessionLocal()
    try:
        yield db  # Provide the session
    finally:
        db.close()  # Always clean up


# Password utilities - keeping passwords safe
def verify_password(plain_password, hashed_password):
    """Check if password matches the hash."""
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password):
    """Turn password into a hash for storage."""
    return pwd_context.hash(password)


# JWT token stuff - making login sessions work
def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    """Make a token that expires after a while."""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)  # short default
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


def get_user(db: Session, email: str):
    """Grab user by email from database."""
    return db.query(User).filter(User.email == email).first()


def authenticate_user(db: Session, email: str, password: str):
    """Check if login credentials are valid."""
    user = get_user(db, email)
    if not user:
        return False
    if not verify_password(password, user.hashed_password):
        return False
    return user


def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    """Figure out who the current user is from their token."""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: Optional[str] = payload.get("sub")
        if email is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    user = get_user(db, email)
    if user is None:
        raise credentials_exception
    return user

# API endpoints - where the magic happens


# User registration - getting new people onboard
@app.post("/register")
def register(user: UserCreate, db: Session = Depends(get_db)):
    """Let new users sign up."""
    db_user = get_user(db, user.email)
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    hashed_password = get_password_hash(user.password)
    db_user = User(email=user.email, hashed_password=hashed_password)
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return {"message": "User created"}


@app.post("/token")  # Login endpoint
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    """Log users in and give them a token."""
    user = authenticate_user(db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.email}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}


@app.post("/boards")  # Create new board
def create_board(board: BoardCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Make a new board for organizing tasks."""
    db_board = Board(title=board.title, user_id=current_user.id)
    db.add(db_board)
    db.commit()
    db.refresh(db_board)
    return db_board


# Get all boards for current user
@app.get("/boards")
def get_boards(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Show all the boards that belong to this user."""
    return db.query(Board).filter(Board.user_id == current_user.id).all()


# Update board title
@app.put("/boards/{board_id}")
def update_board(board_id: int, board: BoardCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Change the name of a board."""
    db_board = db.query(Board).filter(Board.id == board_id,
                                      Board.user_id == current_user.id).first()
    if not db_board:
        raise HTTPException(status_code=404, detail="Board not found")
    db_board.title = board.title
    db.commit()
    return db_board


# Create new task
@app.post("/tasks")
def create_task(task: TaskCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Add a new task to a board."""
    # Make sure the board actually belongs to this user
    board = db.query(Board).filter(Board.id == task.board_id,
                                   Board.user_id == current_user.id).first()
    if not board:
        raise HTTPException(status_code=404, detail="Board not found")
    db_task = Task(title=task.title, description=task.description,
                   board_id=task.board_id)
    db.add(db_task)
    db.commit()
    db.refresh(db_task)
    return db_task


@app.get("/tasks")  # Get tasks
def get_tasks(board_id: Optional[int] = None, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Get tasks, maybe just from one board."""
    query = db.query(Task).join(Board).filter(Board.user_id == current_user.id)
    if board_id:
        query = query.filter(Task.board_id == board_id)
    return query.all()


@app.put("/tasks/{task_id}")  # Update task
def update_task(task_id: int, task_update: TaskUpdate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Modify an existing task."""
    task = db.query(Task).join(Board).filter(
        Task.id == task_id, Board.user_id == current_user.id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    if task_update.title is not None:
        task.title = task_update.title
    if task_update.description is not None:
        task.description = task_update.description
    if task_update.status is not None:
        task.status = task_update.status
    db.commit()
    return task


@app.delete("/tasks/{task_id}")  # Delete task
def delete_task(task_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Remove a task completely."""
    task = db.query(Task).join(Board).filter(
        Task.id == task_id, Board.user_id == current_user.id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    db.delete(task)
    db.commit()
    return {"message": "Task deleted"}


# Delete board and all its tasks
@app.delete("/boards/{board_id}")
def delete_board(board_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Delete a whole board and everything in it."""
    board = db.query(Board).filter(Board.id == board_id,
                                   Board.user_id == current_user.id).first()
    if not board:
        raise HTTPException(status_code=404, detail="Board not found")
    # Get rid of all tasks first
    db.query(Task).filter(Task.board_id == board_id).delete()
    db.delete(board)
    db.commit()
    return {"message": "Board and its tasks deleted"}


# Fire it up
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8006)
