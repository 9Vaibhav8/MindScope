def combine_sentiment(text_sentiment=None, image_sentiments=None, audio_sentiment=None):

   
    text_weight = 0.3
    image_weight = 0.2         
    audio_weight = 0.5
    sentiments = []
    confidences = []

    emotion_scores = {}
    
    
    if image_sentiments:
        for img in image_sentiments:
            
            if isinstance(img, list) and len(img) > 0:
               
                img_data = img[0]
                label = img_data['label'].lower()
                score = img_data['score']
            else:
               
                label = img['label'].lower()
                score = img['score']
                
            emotion_scores[label] = emotion_scores.get(label, 0) + score
   
        total_img_score = sum(emotion_scores.values())
        if total_img_score > 0:
            for k in emotion_scores:
                emotion_scores[k] = (emotion_scores[k] / image_weight*total_img_score) 

    
    if text_sentiment:
        label = text_sentiment['label'].lower()
        emotion_scores[label] = emotion_scores.get(label, 0) +  text_weight*text_sentiment['score']

   
    if audio_sentiment:
    
        if isinstance(audio_sentiment, dict):
            label = audio_sentiment['label'].lower()
            emotion_scores[label] = emotion_scores.get(label, 0) +  audio_weight*audio_sentiment['score']
        
        
        elif isinstance(audio_sentiment, list):
            for audio_result in audio_sentiment:
                label = audio_result['label'].lower()
                emotion_scores[label] = emotion_scores.get(label, 0) +  audio_result['score']

    
    total = sum(emotion_scores.values())
    if total > 0:
        for k in emotion_scores:
            emotion_scores[k] /= total

   
    final_sentiment = max(emotion_scores, key=emotion_scores.get)

    return {
        "final_sentiment": final_sentiment,
        "confidence": emotion_scores[final_sentiment],
        "distribution": emotion_scores
    }