from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Optional, Dict, Any
from pydantic import BaseModel
import shutil
import os
import uuid
import json
from models.multimodal import process_multimodal_input

os.environ["TRANSFORMERS_CACHE"] = os.path.join(os.path.dirname(__file__), "hf_cache")

app = FastAPI(title="Multimodal Mental Health API")

UPLOAD_DIR = "temp_uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def save_file(file: UploadFile) -> str:
    ext = os.path.splitext(file.filename)[1].lower()
    unique_filename = f"{uuid.uuid4()}{ext}"
    path = os.path.join(UPLOAD_DIR, unique_filename)

    try:
        with open(path, "wb") as f:
            shutil.copyfileobj(file.file, f)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error saving file: {str(e)}")

    return path

def cleanup_files(file_paths: List[str]) -> None:
    for path in file_paths:
        if path and os.path.exists(path):
            try:
                os.remove(path)
            except Exception as e:
                print(f"Error removing {path}: {e}")

class UserContext(BaseModel):
    user_id: Optional[str] = None
    conversation_history: Optional[List[Dict[str, Any]]] = None
    preferences: Optional[Dict[str, Any]] = None
    mental_health_history: Optional[Dict[str, Any]] = None
    demographics: Optional[Dict[str, Any]] = None

@app.post("/analyze")
async def analyze(
    text: Optional[str] = Form(None),
    images: Optional[List[UploadFile]] = File(None),
    audio: Optional[UploadFile] = File(None),
    video: Optional[UploadFile] = File(None),
    user_context_json: Optional[str] = Form(None),
    session_id: Optional[str] = Form(None),
    is_assessment_mode: Optional[str] = Form("false")
):
    image_paths = []
    audio_path = None
    video_path = None
    user_context = None

    try:
        # Convert string to boolean for is_assessment_mode
        assessment_mode = is_assessment_mode.lower() == 'true'
        print(f"Assessment mode: {assessment_mode} for session: {session_id}")

        if not session_id:
            session_id = str(uuid.uuid4())
            print(f"Generated new session ID: {session_id}")
       
        if user_context_json:
            try:
                user_context_data = json.loads(user_context_json)
                user_context = UserContext(**user_context_data)
            except json.JSONDecodeError as e:
                print(f"Error parsing user context JSON: {e}")
            except Exception as e:
                print(f"Error creating user context: {e}")
       
        if images:
            for img in images:
                if img.filename:
                    image_paths.append(save_file(img))

        if audio and audio.filename:
            audio_path = save_file(audio)

        if video and video.filename:
            video_path = save_file(video)

        result = process_multimodal_input(
            text=text,
            image_paths=image_paths if image_paths else None,
            audio_path=audio_path,
            video_path=video_path,
            user_context=user_context.dict() if user_context else None,
            session_id=session_id,
            is_assessment_mode=assessment_mode  # Fixed variable name
        )

        return result

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Processing error: {str(e)}")

    finally:
        all_paths = image_paths + [audio_path, video_path]
        cleanup_files([p for p in all_paths if p is not None])

@app.get("/")
async def root():
    return {"status": "healthy", "service": "Multimodal Mental Health API"}