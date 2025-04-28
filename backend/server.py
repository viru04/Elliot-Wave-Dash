# server.py (Flask server)
from flask import Flask, request, jsonify
import elliot_predictor  # Assume it loads model once at startup

app = Flask(__name__)

# Load model at server start
model =elliot_predictor.load_model()

@app.route('/predict', methods=['POST'])
def predict():
    data = request.get_json()
    ticker = data['ticker']
    result = model.predict(ticker)
    return jsonify(result)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
