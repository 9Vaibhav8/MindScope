from transformers import pipeline

text_sentiment = pipeline("text-classification", model="distilbert/distilbert-base-uncased-finetuned-sst-2-english")
def analyze_text_sentiment(text: str):
    
    result = text_sentiment(text)[0]
    
    return result

