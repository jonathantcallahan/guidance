from flask import Flask, request, jsonify, render_template
import requests
import os

'''
API_URL = "https://api-inference.huggingface.co/models/jtc7537/alan_botts"
headers = {
    "Authorization": f"Bearer {os.getenv('HUGGINGFACE_API_KEY')}",
    "Content-Type": "application/json"
}
data = {
    "inputs": "How is your day going?"
}

response = requests.post(API_URL, headers=headers, json=data)
print(response.json())
'''

app = Flask(__name__)

HUGGING_FACE_URL = 'https://huggingface.co/jtc7537/alan_botts'
HUGGING_FACE_API_KEY = os.gentenv('HUGGINGFACE_API_KEY')
HEADERS = {'Authorization': f'Bearer {HUGGING_FACE_API_KEY}'}

def query_huggingface(payload):
    response = requests.post(HUGGING_FACE_URL, headers=HEADERS, json=payload)
    return render_template('index.html')

if __name__ == '__main__':
    app.run(debug=True)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/chat', methods=['POST'])
def chat():
    user_input = request.json.get('input')
