from models.text_model import analyze_text_sentiment
from models.video_model import extract_frames, extract_audio
from models.image_model import analyze_image_emotion
from models.combine_sentiment import combine_sentiment
from models.open_ai_whisper import predict_emotion
from transformers import AutoModelForAudioClassification, AutoFeatureExtractor
import numpy as np
from typing import Optional, Dict, List
import os
import google.generativeai as genai
from dotenv import load_dotenv
from collections import defaultdict
import json
import uuid

load_dotenv()
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

model_id = "firdhokk/speech-emotion-recognition-with-openai-whisper-large-v3"
model = AutoModelForAudioClassification.from_pretrained(model_id)
feature_extractor = AutoFeatureExtractor.from_pretrained(model_id, do_normalize=True)
id2label = model.config.id2label

gemini_chat_sessions = defaultdict(lambda: None)
user_assessment_states = defaultdict(dict)


MENTAL_HEALTH_QUESTIONS = [
    "How have you been sleeping lately? Have you noticed any changes in your sleep patterns?",
    "What's your energy level been like recently? Have you felt more tired or fatigued than usual?",
    "How is your appetite? Have there been any significant changes in your eating habits?",
    "Have you been able to enjoy activities that usually bring you pleasure?",
    "How have you been coping with stress recently? What helps you feel better when you're struggling?"
]

def process_multimodal_input(text=None, image_paths=None, audio_path=None, video_path=None, user_context=None, session_id=None, is_assessment_mode=False):
   

    if is_assessment_mode is None:
        is_assessment_mode = False
    elif isinstance(is_assessment_mode, str):
        is_assessment_mode = is_assessment_mode.lower() == 'true'
   
    if session_id is None:
        session_id = str(uuid.uuid4())
        print(f"Generated new session ID: {session_id}")
    else:
        print(f"Using provided session ID: {session_id}")
    
    
    initialize_session_state(session_id, is_assessment_mode)
    
    text_sentiment = None
    image_sentiments = []
    audio_sentiment = None
   
    input_sources = []  
       
    if text:
        input_sources.append("text")
    if image_paths:
        input_sources.append("images")
    if audio_path:
        input_sources.append("audio")
    if video_path:
        input_sources.append("video")

    if text:
        text_sentiment = analyze_text_sentiment(text)

    if audio_path:
        audio_sentiment = predict_emotion(audio_path, model, feature_extractor, id2label)
        
    if video_path:      
        audio_path_from_video = extract_audio(video_path, "temp_video_audio.wav")
    
        if audio_path_from_video:
            audio_sentiment = predict_emotion(audio_path_from_video, model, feature_extractor, id2label)
        else:
            audio_sentiment = None
            print("No audio in video, skipping audio analysis")
            
            frames = extract_frames(video_path)
            for frame in frames:
                emotion_result = analyze_image_emotion(frame)
                image_sentiments.append(emotion_result)

    elif image_paths:
        for img in image_paths:
            emotion_result = analyze_image_emotion(img)
            image_sentiments.append(emotion_result)

    if text_sentiment or image_sentiments or audio_sentiment:
        combined = combine_sentiment(text_sentiment, image_sentiments, audio_sentiment)
    else:
        combined = {"final_sentiment": "neutral", "confidence": 0.0}

    llm_response = generate_mental_health_response(
        user_input=text or "",
        sentiment_data=combined,
        input_sources=input_sources,
        user_context=user_context,
        session_id=session_id,
        is_assessment_mode=is_assessment_mode
    )

    return {
        "session_id": session_id,
        "text_sentiment": text_sentiment,
        "image_sentiments": image_sentiments,
        "audio_sentiment": audio_sentiment,
        "combined_sentiment": combined,
        "llm_response": llm_response,
        "assessment_progress": get_assessment_progress(session_id)
    }

def initialize_session_state(session_id, is_assessment_mode):
  
    if session_id not in user_assessment_states:
        user_assessment_states[session_id] = {
            "is_assessment_mode": is_assessment_mode,
            "assessment_phase": "initial" if is_assessment_mode else "none",
            "questions_asked": 0,
            "user_responses": [],
            "current_question_index": 0,
            "assessment_complete": False,
            "is_first_interaction": True
        }
        print(f"Initialized session {session_id} with assessment_mode: {is_assessment_mode}")
    else:
       
        current_state = user_assessment_states[session_id]
        if current_state["is_assessment_mode"] != is_assessment_mode:
           
            if is_assessment_mode:
                current_state.update({
                    "is_assessment_mode": True,
                    "assessment_phase": "initial",
                    "questions_asked": 0,
                    "user_responses": [],
                    "current_question_index": 0,
                    "assessment_complete": False,
                    "is_first_interaction": True
                })
            else:
                current_state.update({
                    "is_assessment_mode": False,
                    "assessment_phase": "none",
                    "questions_asked": 0,
                    "user_responses": [],
                    "current_question_index": 0,
                    "assessment_complete": True,  
                    "is_first_interaction": True
                })
            print(f"Updated session {session_id} to assessment_mode: {is_assessment_mode}")

def generate_mental_health_response(user_input, sentiment_data, input_sources, user_context, session_id=None, is_assessment_mode=False):
   
    assessment_state = update_assessment_state(session_id, user_input, is_assessment_mode)
    
    
    if not assessment_state["is_assessment_mode"]:
        return generate_regular_chat_response(user_input, sentiment_data, input_sources, user_context, session_id)
    
    prompt = create_mental_health_prompt(
        user_input=user_input,
        sentiment_data=sentiment_data,
        input_sources=input_sources,
        user_context=user_context,
        assessment_state=assessment_state
    )
    
    llm_response = call_llm_api(prompt, session_id, assessment_state)
    
    return llm_response

def generate_regular_chat_response(user_input, sentiment_data, input_sources, user_context, session_id):
   
    prompt = f"""
You are MindScope, a calm and compassionate AI that helps users understand and regulate emotions.  
Speak naturally, like a thoughtful therapist and caring friend.

User input: {user_input.strip() if user_input else '(No text input)'}
Detected sentiment: {sentiment_data['final_sentiment']} (confidence: {sentiment_data.get('confidence', 0.0)})
Input sources: {', '.join(input_sources)}

This is a regular chat conversation (not mental health assessment mode). 

Respond naturally to the user's input as a supportive AI companion. Provide helpful, empathetic responses without initiating any structured assessment questions.

Guidelines:
- Be warm, empathetic, and supportive
- Respond directly to what the user is sharing
- Don't ask assessment questions unless the user specifically requests it
- Keep responses conversational and natural

Respond below:
"""
    
    return call_llm_api(prompt, session_id, None)

def update_assessment_state(session_id, user_input, is_assessment_mode):
    
    if not session_id:
        session_id = "default_session"
    
    if session_id not in user_assessment_states:
        initialize_session_state(session_id, is_assessment_mode)
    
    current_state = user_assessment_states[session_id]
    
   
    if not current_state["is_assessment_mode"]:
        return current_state
    
    
    user_input = user_input.strip() if user_input else ""
    

    if user_input and not current_state["assessment_complete"]:
        current_state["user_responses"].append(user_input)
        current_state["questions_asked"] = len(current_state["user_responses"])
        
        if current_state["questions_asked"] >= len(MENTAL_HEALTH_QUESTIONS):
            current_state["assessment_complete"] = True
            current_state["assessment_phase"] = "complete"
            print(f"Assessment complete for session: {session_id}")
        else:
            current_state["current_question_index"] = current_state["questions_asked"]
            print(f"Progressed to question {current_state['current_question_index'] + 1} for session: {session_id}")
    
    current_state["is_first_interaction"] = False
    
    return user_assessment_states[session_id]

def create_mental_health_prompt(user_input, sentiment_data, input_sources, user_context, assessment_state):
    base_prompt = f"""
You are MindScope, a calm and compassionate AI that helps users understand and regulate emotions.  
Speak naturally, like a thoughtful therapist and caring friend.

User input: {user_input.strip() if user_input else '(No text input)'}
Detected sentiment: {sentiment_data['final_sentiment']} (confidence: {sentiment_data.get('confidence', 0.0)})
Input sources: {', '.join(input_sources)}

ASSESSMENT PHASE: {assessment_state['assessment_phase']}
Questions asked so far: {assessment_state['questions_asked']} out of {len(MENTAL_HEALTH_QUESTIONS)}
Assessment complete: {assessment_state['assessment_complete']}

"""
    
    if assessment_state["is_first_interaction"]:
        prompt = base_prompt + f"""
This is our first interaction. Start the mental health assessment.

YOUR TASK:
1. Briefly introduce yourself as MindScope  
2. Ask the first assessment question naturally

FIRST QUESTION: {MENTAL_HEALTH_QUESTIONS[0]}

Keep your response to 2-3 sentences max. Just ask the question.
"""
    
    elif not assessment_state["assessment_complete"]:
        current_question_index = assessment_state["current_question_index"]
        current_question = MENTAL_HEALTH_QUESTIONS[current_question_index]
        
        prompt = base_prompt + f"""
Continue the mental health assessment. Ask the next question.

NEXT QUESTION ({current_question_index + 1}/{len(MENTAL_HEALTH_QUESTIONS)}): {current_question}

Keep your response to 1-2 sentences. Just ask the question naturally.
"""
    
    else:
        prompt = base_prompt + f"""
Assessment complete. Provide a concise summary and supportive response.

Key points: {get_assessment_summary(assessment_state)}

Provide a warm, supportive summary in 3-4 sentences. Offer 1-2 practical suggestions.
"""

    return prompt

def get_previous_qa_summary(assessment_state):
    
    summary = []
    for i in range(assessment_state["questions_asked"]):
        if i < len(assessment_state["user_responses"]):
            summary.append(f"Q{i+1}: {MENTAL_HEALTH_QUESTIONS[i]}")
            summary.append(f"A{i+1}: {assessment_state['user_responses'][i][:100]}...")  
    return "\n".join(summary) if summary else "No previous responses yet."

def get_assessment_summary(assessment_state):
    """Create a concise summary"""
    return f"Completed {len(assessment_state['user_responses'])} questions in mental health assessment."
    

def get_assessment_progress(session_id):
    
    if session_id in user_assessment_states:
        state = user_assessment_states[session_id]
        return {
            "questions_asked": state["questions_asked"],
            "total_questions": len(MENTAL_HEALTH_QUESTIONS),
            "assessment_complete": state["assessment_complete"],
            "current_phase": state["assessment_phase"]
        }
    return {"questions_asked": 0, "total_questions": len(MENTAL_HEALTH_QUESTIONS), "assessment_complete": False, "current_phase": "initial"}


def call_llm_api(prompt: str, session_id: Optional[str] = None, assessment_state: Optional[Dict] = None):
    
    try:
        if not session_id:
            session_id = "default_session"
            
        if gemini_chat_sessions[session_id]:
            chat = gemini_chat_sessions[session_id]
            response = chat.send_message(prompt)
            print(f"Continuing existing chat session: {session_id}")
        else:
            model = genai.GenerativeModel("gemini-2.0-flash")
            chat = model.start_chat(history=[])
            response = chat.send_message(prompt)
            gemini_chat_sessions[session_id] = chat
            print(f"Started new chat session: {session_id}")
        
        return response.text

    except Exception as e:
        print(f"[Error calling Gemini API]: {e}")
        
        
        if assessment_state and assessment_state.get("is_assessment_mode", False) and not assessment_state["assessment_complete"]:
            current_question_index = assessment_state["current_question_index"]
            current_question = MENTAL_HEALTH_QUESTIONS[current_question_index]
            return f"I'm here to listen and support you. {current_question}"
        else:
            return "I'm here to listen. Could you tell me a bit more about how you've been feeling lately?"