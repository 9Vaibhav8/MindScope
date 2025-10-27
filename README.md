# MindScope 🧠✨

Encouraging proactive mental health care through AI-powered emotional insights.

MindScope is a multimodal system designed to understand and support mental well-being by analyzing text, voice, and facial expressions. By combining cutting-edge AI with an accessible, digital-first approach, MindScope helps users recognize emotional patterns and take proactive steps toward mental health care.

# Features

# Text Analysis (Core Module)

Model: DistilBERT-base-uncased (lightweight transformer from Hugging Face)
Task: Sentiment and emotion classification on user’s transcribed speech

# Audio Emotion Recognition 

Model: openai-whisper-large-v3 <br>
Task: Detects emotions from speech using vocal tone, pitch, pace, and energy

# Image Emotion Recognition

Model : dima806/facial_emotions_image_detection

# Video Emotion Recognition 


Model: DeepFace or FER+ for facial emotion recognition <br>
Task: Real-time detection of facial expressions <br>

# Tech Stack

NLP: Hugging Face Transformers (DistilBERT) <br>
Audio Processing: Wav2Vec2 <br>
Computer Vision: DeepFace, FER+ <br>
Frameworks: PyTorch, TensorFlow, OpenCV <br>
Frontend : React.js , Tailwind CSS , Javascript <br>
Backend : Node.js , Express.js , MongoDB , RestfulAPI , FastAPI , 

# Pipeline <br>
<img width="518" height="299" alt="Screenshot 2025-10-21 211622" src="https://github.com/user-attachments/assets/67b2c090-8d0b-40b9-ab39-5d9943ef9cd5" />

# Running the Web App
## Fork the repo 

### Change directory to frontend
```bash
cd frontend

# install dependencies 
$ npm install 

cd backend

$ pip install -r requirements.txt
