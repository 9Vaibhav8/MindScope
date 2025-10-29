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
Audio Processing: openai-whisper-large-v3
 <br>
Computer Vision: DeepFace, FER+ <br>
Frameworks: PyTorch, TensorFlow, OpenCV <br>
Frontend : React.js , Tailwind CSS , Javascript <br>
Backend : Node.js , Express.js , MongoDB , RestfulAPI , FastAPI , 

# Pipeline <br>
<img width="546" height="287" alt="image" src="https://github.com/user-attachments/assets/711665c2-a5ad-4945-8a2c-3fb800aa4d8f" />


# Installation and Setup 
```bash
Backend Setup

In the terminal 

cd backend
npm install

# first move requirements.txt in backend folder 
$ pip install -r requirements.txt

mkdir .env

Add these code in  .env
PORT=5000                   
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/<dbname>
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_CLIENT_EMAIL=your_firebase_client_email
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY\n-----END PRIVATE KEY-----\n"

For Firebase Configuration

 1. Go to Firebase Console
 Visit https://console.firebase.google.com
Log in with your Google account.
2-Create or Select a Firebase Project
3- Go to Project Overview -> Project Settings
4- Go to Service Accounts
5 - Generate new Private Key
6-  From the downloaded JSON file copy the values of asked field in the env and paste there respectively

' If importing module error shows in moviepy.editor  then :-'
Go to multimodal.py
Remove .editor  in import logic ( from moviepy.editor import VideoClip)

For Running Backend -

Run these commands in seperate terminal
cd backend
$ npm run dev
python main.py 

Frontend Setup

cd frontend
mkdir .env
.env

VITE_FIREBASE_API_KEY=your_firebase_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_project_auth_domain_here
VITE_FIREBASE_PROJECT_ID=your_project_id_here
VITE_FIREBASE_APP_ID=your_firebase_app_id_here

For Vite_Firebase
1-  Step 1: Go to Firebase Console
 https://console.firebase.google.com
2- Go to your project
3- Click Add App and choose web or </>
4-Firebase will now show you your web app’s config
5- Copy and Pase reuired config settings in you frontend .env

npm install

Running Frontend
npm run dev 










