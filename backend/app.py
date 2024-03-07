from flask import Flask, jsonify, request
from datetime import datetime
from backend import load_data

app = Flask(__name__)


@app.route('/fetchBusData', methods=['GET'])
def fetch_bus_data():
    # Example using query parameters for date, departure, arrival, and passengers
    date = request.args.get('date', default=str(
        datetime.now().date()), type=str)
    date = str(datetime.strptime(date, '%m/%d/%Y'))
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


if __name__ == "__main__":
    app.run(debug=True, host='0.0.0.0', port=3000)
