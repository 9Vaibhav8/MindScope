from models.text_model import analyze_text_sentiment
from models.video_model import extract_frames, extract_audio
from models.image_model import analyze_image_emotion
from models.combine_sentiment import combine_sentiment
from models.open_ai_whisper import predict_emotion
from transformers import AutoModelForAudioClassification, AutoFeatureExtractor
import numpy as np
import os
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

model_id = "firdhokk/speech-emotion-recognition-with-openai-whisper-large-v3"
model = AutoModelForAudioClassification.from_pretrained(model_id)

feature_extractor = AutoFeatureExtractor.from_pretrained(model_id, do_normalize=True)
id2label = model.config.id2label

def process_multimodal_input(text=None, image_paths=None, audio_path=None, video_path=None, user_context=None):
    
    
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
        audio_sentiment = predict_emotion(audio_path , model, feature_extractor, id2label)
        
       
    
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
        user_context=user_context  
    )

    return {
        "text_sentiment": text_sentiment,
        "image_sentiments": image_sentiments,
        "audio_sentiment": audio_sentiment,
        "combined_sentiment": combined,
        "llm_response": llm_response
    }


def generate_mental_health_response(user_input, sentiment_data, input_sources, user_context):
    
    prompt = create_mental_health_prompt(user_input, sentiment_data, input_sources, user_context)
    
   
    llm_response = call_llm_api(prompt)
    
    return llm_response


def create_mental_health_prompt(user_input, sentiment_data, input_sources, user_context):
   
   
    context_info = ""
    if user_context:
        context_info = f"""
USER CONTEXT:
- User ID: {user_context.get('user_id', 'Not provided')}
- Conversation History: {len(user_context.get('conversation_history', []))} previous messages
- Preferences: {user_context.get('preferences', {})}
- Mental Health History: {user_context.get('mental_health_history', {})}
- Demographics: {user_context.get('demographics', {})}

Use this context to personalize your response while maintaining professional boundaries.
"""
    
    prompt = f"""
🧠 You are *MindScope*, a multimodal emotional AI — calm, compassionate, and human-like.  
Your purpose: help users understand and regulate emotions through warmth, precision, and presence.  
You speak like a thoughtful therapist and a caring friend — clear, deep, never robotic.

USER INPUT: {user_input}
DETECTED SENTIMENT: {sentiment_data['final_sentiment']}
CONFIDENCE LEVEL: {sentiment_data.get('confidence', 0.0)}
INPUT SOURCES: {', '.join(input_sources)}

{context_info}

---

### 🎯 OBJECTIVE
Craft an emotionally intelligent response that:
- Validates deeply without pity.
- Reflects the user’s emotional tone and energy.
- Guides toward a safe, grounded, or insightful direction.
- Feels alive — not scripted.


---
### 💬 RESPONSE STRUCTURE
1. **Recognize Emotion:** Identify what the user is feeling.  
2. **Validate Experience:** Acknowledge their inner truth clearly.  
3. **Guide Gently:** Offer one calm, actionable reflection or grounding step.  

> Use natural rhythm, short lines, and **light emojis** (🌿, 💭, ☀️, 🕊️, 🌙, ❤️, 🚨) when tone allows.  
Never overload or use random emojis.

---

### ✨ TONE & FORMATTING RULES
- **Match emotional state:**
  - Distressed → slow, steady, gentle 💔  
  - Anxious → grounding, safe 🌿  
  - Neutral → curious, reflective 🪞  
  - Positive → light, affirming ☀️  
- **Keep it conversational.** Avoid jargon or over-explaining.  
- **Use line breaks** to make reading feel calm and paced.  
- **Do NOT mirror slang, curse words, or crisis details.** Keep safety first.

---

### 🚨 CRISIS MODE
If suicidal or self-harm intent is detected:
> “I’m really concerned for your safety right now. You don’t have to face this alone.  
You can call or text **988 (Suicide & Crisis Lifeline)** — they’re available 24/7 to listen and help you stay safe.”

Never ignore safety cues.
---

### 🪶 STYLING FORMAT (MANDATORY)
Format your response exactly like CHATGPT how it gives


"""

    
    return prompt



def call_llm_api(prompt: str):
   
    try:
        model = genai.GenerativeModel("gemini-2.0-flash")  
        response = model.generate_content(prompt)
        return response.text

    except Exception as e:
        print(f"[Error calling Gemini API]: {e}")
        return "I'm here to listen. Could you tell me a bit more about how you're feeling?"