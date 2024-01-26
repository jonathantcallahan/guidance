import requests
import json
import elevenlabs
from openai import OpenAI
import time
import numpy
import uuid
import matplotlib.pyplot as plt
from PIL import Image
from moviepy.video.fx.resize import resize
from moviepy.editor import VideoFileClip
import subprocess
import sys
import os
import glob
import subprocess
from SadTalker import inference
import src

with open('../credentials.json', 'r') as file:
    cred = json.load(file)

elevenlabs.set_api_key(cred["elevenlabs_api_key"])
client = OpenAI(api_key=cred["openai_api_key"])

assistant_id = "asst_nv9sFR2LXHefrpwws4EUT6xU"
voice_id = "vDxT1hhO5CjgzUI7e2vF"

my_assistant = client.beta.assistants.retrieve(assistant_id)

new_thread = client.beta.threads.create()

print(sys.executable)
python_interpreter = sys.executable
'''
def video_generation(audio_path, audio_id):
    
    !python ./SadTalker/inference.py \
      --driven_audio test.wav \
      --source_image ./SadTalker/example_img.jpg \
      --result_dir ./results/
'''

#inference.main(driven_audio=)

def video_generation(audio_path, audio_id):
    command = [
        'python', './SadTalker/inference.py',
        '--driven_audio', audio_path,
        '--source_image', './SadTalker/example_img.jpg',
        '--result_dir', './results/'
    ]

    # Run the command
    print('subprocess running')
    subprocess.run(command, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)

def new_question(question_text):
  message_request = client.beta.threads.messages.create(
      thread_id = new_thread.id,
      role = "user",
      content = "In 30 words or less (important). " + question_text
  )

  run = client.beta.threads.runs.create(
    thread_id = message_request.thread_id,
    assistant_id = my_assistant.id
  )

  run = client.beta.threads.runs.retrieve(
    thread_id = message_request.thread_id,
    run_id = run.id
  )

  def wait_for_completed():
      while True:
          response = client.beta.threads.runs.retrieve(thread_id = new_thread.id, run_id = run.id)
          if response.status == "completed":
              return response
          time.sleep(1)

  run_return = wait_for_completed()

  messages = client.beta.threads.messages.list(
    thread_id = message_request.thread_id
  )

  audio = elevenlabs.generate(
      text = messages.data[0].content[0].text.value,
          voice = voice_id
  )

  audio_id = uuid.uuid4()
  print('updated script')
  elevenlabs.save(audio, "test.wav")
  elevenlabs.play(audio)

  #video_generation("test.wav", audio_id)
  
  inference.main(driven_audio="test.wav", source_image="./SadTalker/example_img.jpg", results_dir = "./results/")


new_question("What's the best weather")