import cv2
from moviepy.editor import VideoFileClip
import os

def extract_audio(video_path, audio_output):
    
    try:
        clip = VideoFileClip(video_path)
        if clip.audio is None:  
            print(f"Warning: No audio track found in {video_path}")
            return None
        clip.audio.write_audiofile(audio_output, verbose=False, logger=None)
        clip.close()
        return audio_output
    except Exception as e:
        print(f"Error extracting audio: {e}")
        return None

def extract_frames(video_path, frame_output_dir="frames", frame_rate=1):
    
    os.makedirs(frame_output_dir, exist_ok=True)
    vidcap = cv2.VideoCapture(video_path)
    fps = int(vidcap.get(cv2.CAP_PROP_FPS))
    frame_interval = max(1, fps // frame_rate)

    count = 0
    saved_frames = []

    while True:
        success, frame = vidcap.read()
        if not success:
            break
        if count % frame_interval == 0:
            frame_path = os.path.join(frame_output_dir, f"frame_{count}.jpg")
            cv2.imwrite(frame_path, frame)
            saved_frames.append(frame_path)
        count += 1

    vidcap.release()
    return saved_frames
