from flask import Flask, jsonify, request
from flask_cors import CORS
from datetime import datetime
from backend import load_data
import requests

app = Flask(__name__)
CORS(app)

@app.route('/fetchBusData', methods=['GET'])
def fetch_bus_data():
    # Example using query parameters for date, departure, arrival, and passengers
    date = request.args.get('date', type=str)
    date = str(datetime.strptime(date, '%Y-%m-%d'))
    departure = request.args.get(
        'departure', default="Dallas, TX", type=str)
    arrival = request.args.get('arrival', default="Austin, TX", type=str)
    passengers = request.args.get('passengers', default="1", type=str)

    # Convert date format if necessary and validate inputs as needed
    # Adapt the backend function to either run synchronously or use asyncio to run it asynchronously
    try:
        data = load_data(date, departure, arrival, passengers)

        return jsonify(data), 200
    except Exception as e:
        # Handle exceptions or errors
        return jsonify({"error": str(e)}), 500


@app.route('/submitForm', methods=['POST'])
def submit_form():
    data = request.json
    # Now data will contain the form data as a dictionary
    # For example, to access the departure city: departure = data['departure']

    # Process the data...
    
    res = requests.get(
        "https://txbus-production.up.railway.app/fetchBusData", params=data)

    print(res.url)

    return res.text, 200

    
def main():
    app.run()


if __name__ == "__main__":
    main()
