from datetime import datetime
import json
import re
import requests
from concurrent.futures import ThreadPoolExecutor

# Define the base URL
# Load city IDs once
with open('./cityID.json', 'r') as f:
    city_id = json.load(f)

session = requests.Session()
def format_date(date_string, format='%Y-%m-%d', to_format='%m-%d-%Y'):
    return datetime.fromisoformat(date_string).strftime(to_format)


def get_base_url_and_params(operator, date, departure, arrival, passengers):
    base_urls = {
        "redcoach": 'https://booking.redcoachusa.com/api/v2021/en-us/journeys/search',
        "flixbus": 'https://global.api.flixbus.com/search/service/v4/search?',
        "megabus": 'https://us.megabus.com/journey-planner/api/journeys'
    }
    params_dict = {
        "redcoach": {
            'departureDate': format_date(date),
            'destinationStopId': city_id['redcoach'][arrival],
            'originStopId': city_id['redcoach'][departure],
            'Passengers': f"BONUS_SCHEME_GROUP.STUDENT,{passengers}",
            'currencyId': "CURRENCY.USD"
        },
        "flixbus": {
            'from_city_id': city_id['flixbus'][departure],
            'to_city_id': city_id['flixbus'][arrival],
            'departure_date': format_date(date, format='%Y-%m-%d', to_format='%d.%m.%Y'),
            'products': json.dumps({"adult": passengers}),
            'currency': 'USD',
            'locale': 'en_US',
            'search_by': 'cities',
            'include_after_midnight_rides': '1'
        },
        "megabus": {
            'departureDate': format_date(date),
            'destinationId': city_id['megabus'][arrival],
            'inboundDepartureDate': format_date(date),
            'originId': city_id['megabus'][departure],
            'totalPassengers': passengers,
        }
    }
    return base_urls[operator], params_dict[operator]


def fetchData(operator, date, departure, arrival, passengers):
    base_url, params = get_base_url_and_params(operator, date, departure, arrival, passengers)

    response = session.get(base_url, params=params)
    
    print(response.url)
    response.raise_for_status()
    data = response.json()
    trips = process_data(data, operator)
    
    trips = [trip for trip in trips if trip['price'] != 0]

    return json.dumps(trips, indent=4)


def process_data(data, operator):
    if operator == "megabus":
        return [
            {
                "operator": "Megabus",
                "date": format_date(trip['arrivalDateTime'], to_format='%m-%d-%Y'),
                "departureTime": format_date(trip['departureDateTime'], format='%Y-%m-%dT%H:%M:%S', to_format='%I:%M %p'),
                "departureCity": trip['origin']['cityName'],
                "departureStation": re.split('/|-', trip['origin']['stopName'])[0].strip(),
                "arrivalTime": format_date(trip['arrivalDateTime'], format='%Y-%m-%dT%H:%M:%S', to_format='%I:%M %p'),
                "arrivalCity": trip['destination']['cityName'],
                "arrivalStation": re.split('/|-', trip['destination']['stopName'])[0].strip(),
                "price": trip['price'],
                "departureCityID": city_id['megabus'][trip['origin']['cityName']],
                "arrivalCityID": city_id['megabus'][trip['destination']['cityName']]
            } for trip in data['journeys']
        ]
    elif operator == "redcoach":
        return [
            {
                "operator": "Redcoach",
                "date": format_date(trip['Origin']['ActualDepartureDateTime'], to_format='%m-%d-%Y'),
                "departureTime": format_date(trip['Origin']['ActualDepartureDateTime'], format='%Y-%m-%dT%H:%M:%S', to_format='%I:%M %p'),
                "departureCity": trip['Origin']['City']['Name'] + ", TX",
                "departureStation": trip['Origin']['Stop']['Name'],
                "arrivalTime": format_date(trip['Destination']['ActualArrivalDateTime'], format='%Y-%m-%dT%H:%M:%S', to_format='%I:%M %p'),
                "arrivalCity": trip['Destination']['City']['Name'] + ", TX",
                "arrivalStation": trip['Destination']['Stop']['Name'],
                "price": trip['PriceFrom'],
                "departureCityID": city_id['redcoach'][trip['Origin']['City']['Name'] + ", TX"],
                "arrivalCityID": city_id['redcoach'][trip['Destination']['City']['Name'] + ", TX"]
            } for trip in data['Journeys']
        ]
    elif operator == "flixbus":
        cities = {cityID: info['name']
                  for cityID, info in data.get('cities', {}).items()}
        stations = {stationID: info['name']
                    for stationID, info in data.get('stations', {}).items()}
        operators = {operatorID: info['label']
                     for operatorID, info in data.get('operators', {}).items()}

        return [
            {
                "operator": operators.get(trip['legs'][0]['operator_id'], "Flixbus"),
                "date": format_date(trip['departure']['date'], to_format='%m-%d-%Y'),
                "departureTime": format_date(trip['departure']['date'], format='%Y-%m-%dT%H:%M:%S', to_format='%I:%M %p'),
                "departureCity": cities.get(trip['departure']['city_id'], "Unknown"),
                "departureStation": stations.get(trip['departure']['station_id'], "Unknown"),
                "arrivalTime": format_date(trip['arrival']['date'], format='%Y-%m-%dT%H:%M:%S', to_format='%I:%M %p'),
                "arrivalCity": cities.get(trip['arrival']['city_id'], "Unknown"),
                "arrivalStation": stations.get(trip['arrival']['station_id'], "Unknown"),
                "price": trip['price']['total'],
                "departureCityID": [trip['departure']['city_id']][0],
                "arrivalCityID": [trip['arrival']['city_id']][0]
            } for key, trip in data.get('trips', [{}])[0].get('results', {}).items()
        ]
    else:
        return []


def load_data(date, departure, arrival, passengers):
    with ThreadPoolExecutor(max_workers=3) as executor:
        future_fb = executor.submit(
            fetchData, "flixbus", date, departure, arrival, passengers)
        future_mb = executor.submit(
            fetchData, "megabus", date, departure, arrival, passengers)
        future_rc = executor.submit(
            fetchData, "redcoach", date, departure, arrival, passengers)

        fb = json.loads(future_fb.result())
        mb = json.loads(future_mb.result())
        rc = json.loads(future_rc.result())

        return rc + mb + fb
