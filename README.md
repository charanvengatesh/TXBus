# TXBus

## Overview

TXBus is a React-based web application designed to help users search for bus travel options across various cities in Texas. It allows users to input their travel details, including date, departure city, arrival city, and number of passengers, to fetch and display available bus routes.

## Features

- **Search Functionality**: Users can search for bus routes by specifying the departure city, arrival city, date, and number of passengers.
- **Dynamic Sorting**: Search results can be sorted alphabetically by operator name, or by price (low to high or high to low).
- **Responsive Design**: The application is designed to be responsive, ensuring a good user experience across different devices.
- **External Booking**: Clicking on a search result redirects the user to the bus operator's booking page, allowing them to proceed with their reservation.

## How the backend works

1. Import necessary libraries:
   - `datetime` for handling dates
   - `json` for parsing and generating JSON data
   - `re` for regular expressions
   - `requests` for making HTTP requests
   - `ThreadPoolExecutor` from concurrent.futures for parallel execution

2. Load city IDs from a JSON file to map city names to their IDs for different operators.

3. Create a session object from requests for persistent settings across requests.

4. Define a function to format dates from one format to another.

5. Define a function to get the base URL and parameters for a given operator, date, departure city, arrival city, and number of passengers. This involves:
   - Mapping each operator to their respective base URL.
   - Formatting the date as required by each operator.
   - Using the loaded city IDs to get the specific IDs required by each operator.
   - Constructing and returning the base URL and parameters for the request.

6. Define a function to fetch data from an operator's API:
   - Use the get_base_url_and_params function to get the URL and parameters.
   - Make a `GET` request to the operator's API with the parameters.
   - Parse the JSON response.
   - Process the data based on the operator to extract relevant trip information.
   - Filter out trips with a price of 0.
   - Return the processed and filtered data as a JSON string.

7. Define a function to process the raw data from each operator's API into a consistent format:
   - For each operator, extract and transform the relevant information from the raw data into a list of dictionaries.
   - Use regular expressions and date formatting as necessary to clean and format the data.
   - Return the processed data.

8. Define a function to load data from all operators in parallel:
   - Use `ThreadPoolExecutor` to fetch data from each operator's API in parallel.
   - Combine the results from all operators.
   - Return the combined list of trips.

## Technologies Used

- **React**: For building the user interface.
- **useState & useEffect Hooks**: For managing state and side effects.
- **Fetch API**: For making network requests to fetch bus data.

## Setup and Installation

1. Clone the repository to your local machine.
2. Navigate to the project directory.
3. Run `npm install` to install dependencies.
4. Run `npm start` to start the development server.
5. Open `http://localhost:3000` in your browser to view the application.

## Usage

1. Fill in the search form with your travel details.
2. Click the "Search" button to fetch available bus routes.
3. Use the sort options to order the search results as desired.
4. Click on a search result to be redirected to the operator's booking page.

## Contributing

Contributions are welcome! Please feel free to submit a pull request or open an issue for any bugs or feature requests.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

