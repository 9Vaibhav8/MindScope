from transformers import AutoModelForAudioClassification, AutoFeatureExtractor
import librosa
import torch
import numpy as np

model_id = "firdhokk/speech-emotion-recognition-with-openai-whisper-large-v3"
model = AutoModelForAudioClassification.from_pretrained(model_id)

feature_extractor = AutoFeatureExtractor.from_pretrained(model_id, do_normalize=True)
id2label = model.config.id2label

def preprocess_audio(audio_path, feature_extractor, max_duration=30.0):
   
    if isinstance(audio_path, str) and audio_path.startswith(('http://', 'https://')):
        import requests
        from io import BytesIO
        
        response = requests.get(audio_path)
        response.raise_for_status()
        
        
        audio_array, sampling_rate = librosa.load(BytesIO(response.content), sr=feature_extractor.sampling_rate)
    
    
    else:
        audio_array, sampling_rate = librosa.load(audio_path, sr=feature_extractor.sampling_rate)
    
    max_length = int(feature_extractor.sampling_rate * max_duration)
    if len(audio_array) > max_length:
        audio_array = audio_array[:max_length]
    else:
        audio_array = np.pad(audio_array, (0, max_length - len(audio_array)))

    inputs = feature_extractor(
        audio_array,
        sampling_rate=feature_extractor.sampling_rate,
        max_length=max_length,
        truncation=True,
        return_tensors="pt",
    )
    return inputs

def predict_emotion(audio_path, model, feature_extractor, id2label, max_duration=30.0):
   
    if isinstance(audio_path, str):
        inputs = preprocess_audio(audio_path, feature_extractor, max_duration)
        
        device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        model = model.to(device)
        inputs = {key: value.to(device) for key, value in inputs.items()}

        with torch.no_grad():
            outputs = model(**inputs)

        logits = outputs.logits
        probabilities = torch.softmax(logits, dim=-1)
        
        predicted_id = torch.argmax(logits, dim=-1).item()
        predicted_label = id2label[predicted_id]
        confidence = probabilities[0][predicted_id].item()
        
        return {'label': predicted_label, 'score': confidence}
    
   
    elif isinstance(audio_path, list):
        results = []
        for audio_file in audio_path:
            result = predict_emotion(audio_file, model, feature_extractor, id2label, max_duration)
            results.append(result)
        return results