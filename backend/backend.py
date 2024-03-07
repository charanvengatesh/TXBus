from datetime import datetime
import json
import time
from concurrent.futures import ThreadPoolExecutor

from fetchBusData import fetchData

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

