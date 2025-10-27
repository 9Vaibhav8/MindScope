from transformers import pipeline
import requests
from PIL import Image
import tempfile
import os

emotion_classifier = pipeline(
    task="image-classification",
    model="dima806/facial_emotions_image_detection"
)

def analyze_image_emotion(image_input):
  
    try:
        
        if isinstance(image_input, str) and image_input.startswith(('http://', 'https://')):
            
            response = requests.get(image_input, timeout=10)
            response.raise_for_status()
            
           
            with tempfile.NamedTemporaryFile(delete=False, suffix='.jpg') as tmp_file:
                tmp_file.write(response.content)
                temp_path = tmp_file.name
            
            results = emotion_classifier(temp_path)
        
       
            os.unlink(temp_path)
            
            return results
        
       
        else:
            results = emotion_classifier(image_input)
            return results
            
    except Exception as e:
        print(f"Error in image emotion analysis: {e}")
        return {"error": str(e), "emotion": "unknown"}
