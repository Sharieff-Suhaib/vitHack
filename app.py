from flask import Flask, request, jsonify

app = Flask(__name__)

@app.route('/api/speech', methods=['POST'])
def receive_speech_text():
    data = request.json
    spoken_text = data.get("text", "")
    print(f"Received Speech Text: {spoken_text}")
    
    return jsonify({"response": f"Received: {spoken_text}"})

if __name__ == '__main__':
    app.run(host="0.0.0.0", port=5000, debug=True)
