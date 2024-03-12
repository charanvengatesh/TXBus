"use client";

import React, { FormEvent, useEffect, useState } from "react";

export default function Home() {
  const [formData, setFormData] = useState({
    date: "",
    departure: "",
    arrival: "",
    passengers: "1",
  });

  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [sortOption, setSortOption] = useState<string>("");

  interface SearchResult {
    arrivalCity: string;
    arrivalCityID: string;
    arrivalStation: string;
    arrivalTime: string;
    date: string;
    departureCity: string;
    departureCityID: string;
    departureStation: string;
    departureTime: string;
    operator: string;
    price: number;
  }

  const cities = [
    "Dallas, TX",
    "Austin, TX",
    "Houston, TX",
    "College Station, TX",
    "San Antonio, TX",
  ];

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSortOption(e.target.value);
  };

  const sortResults = (results: SearchResult[]) => {
    switch (sortOption) {
      case "priceLowHigh":
        return results.sort((a, b) => a.price - b.price);
      case "priceHighLow":
        return results.sort((a, b) => b.price - a.price);
      case "alphabetical":
        return results.sort((a, b) => a.operator.localeCompare(b.operator));
      default:
        return results;
    }
  };

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ): Promise<void> {
    event.preventDefault(); // Prevent default form submission behavior
    // Construct the URL with query parameters
    const queryParams = new URLSearchParams(formData).toString();
    const url = `https://txbus-production.up.railway.app/fetchBusData?${queryParams}`; // Ensure this URL matches your Flask endpoint and port
    // const url = `http://127.0.0.1:5000/fetchBusData?${queryParams}`; // Ensure this URL matches your Flask endpoint and port

    try {
      const response = await fetch(url); // GET request

      if (!response.ok) {
        throw new Error("Network response was not ok.");
      }

      const jsonResponse = await response.json();
      setSearchResults(jsonResponse); // Ensure jsonResponse is in the correct format
    } catch (error) {
      console.error("There was a problem with the fetch operation:", error);
    }
  }

  const handleBookNow = async (result: SearchResult) => {
    var url = "";
    let operator = result.operator.toLowerCase();
    
    if (operator == "redcoach") {
      url = `https://booking.redcoachusa.com/journeys?oStop=${result.departureCityID}&dStop=${result.arrivalCityID}&oDate=${result.date}&fareClasses=BONUS_SCHEME_GROUP.STUDENT,${formData.passengers}`;
    } else if (operator == "megabus") {
      const formattedDate = new Date(result.date).toISOString().split("T")[0];
      url = `https://us.megabus.com/journey-planner/journeys?days=1&concessionCount=0&departureDate=${formattedDate}&destinationId=${result.arrivalCityID}&inboundOtherDisabilityCount=0&inboundPcaCount=0&inboundWheelchairSeated=0&nusCount=0&originId=${result.departureCityID}&otherDisabilityCount=0&pcaCount=0&totalPassengers=${formData.passengers}&wheelchairSeated=0`;
    } else if (operator == "flixbus" || operator == "greyhound" || operator == "valley transit") {
      const date = new Date(result.date);
      const formattedDate = [
        date.getDate().toString().padStart(2, "0"),
        (date.getMonth() + 1).toString().padStart(2, "0"), // Months are 0-based
        date.getFullYear(),
      ].join(".");
      url = `https://shop.flixbus.com/search?departureCity=${result.departureCityID}&arrivalCity=${result.arrivalCityID}&route=Dallas%2C+TX-Houston%2C+TX&rideDate=${formattedDate}&adult=${formData.passengers}&_locale=en_US&features%5Bfeature.enable_distribusion%5D=1&features%5Bfeature.darken_page%5D=1`;
    }
    console.log(url);
    try {
      window.open(url, "_blank");
    } catch (error) {
      console.error(
        "There was a problem redirecting to the booking page:",
        error
      );
    }
  };

  const sortedResults = sortResults([...searchResults]);

  return (
    <main className="p-4">
      <div className="max-w-xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-6">TXBus</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex justify-between gap-4">
            <div className="flex-1">
              <label htmlFor="date" className="block text-lg font-medium">
                Date:
              </label>
              <input
                type="date"
                id="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                className="mt-1 p-2 w-full border-2 border-gray-200 rounded-lg"
              />
            </div>
            <div className="flex-1">
              <label htmlFor="passengers" className="block text-lg font-medium">
                Passengers:
              </label>
              <input
                type="number"
                id="passengers"
                name="passengers"
                value={formData.passengers}
                onChange={handleChange}
                min="1"
                className="mt-1 p-2 w-full border-2 border-gray-200 rounded-lg"
              />
            </div>
          </div>
          <div>
            <label htmlFor="departure" className="block text-lg font-medium">
              Departure City:
            </label>
            <select
              id="departure"
              name="departure"
              value={formData.departure}
              onChange={handleChange}
              className="mt-1 p-2 w-full border-2 border-gray-200 rounded-lg"
            >
              <option value="">Select a city</option>
              {cities.map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="arrival" className="block text-lg font-medium">
              Arrival City:
            </label>
            <select
              id="arrival"
              name="arrival"
              value={formData.arrival}
              onChange={handleChange}
              className="mt-1 p-2 w-full border-2 border-gray-200 rounded-lg"
            >
              <option value="">Select a city</option>
              {cities.map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>
          </div>
          <button
            type="submit"
            className="w-full bg-blue-500 text-white p-2 rounded-lg font-medium hover:bg-blue-600"
          >
            Search
          </button>
        </form>
        {Array.isArray(sortedResults) && sortedResults.length > 0 && (
          <div className="mt-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="flex justify-between">
              <h2 className="text-2xl font-bold col-span-full">
                Search Results
              </h2>
              <div className="flex mb-2">
                <select
                  id="sort"
                  value={sortOption}
                  onChange={handleSortChange}
                  className="p-2 border-2 border-gray-200 rounded-lg"
                >
                  <option value="">Select sort option</option>
                  <option value="alphabetical">Alphabetical (A-Z)</option>
                  <option value="priceLowHigh">Price (Low to High)</option>
                  <option value="priceHighLow">Price (High to Low)</option>
                </select>
              </div>
            </div>
            {sortedResults.map((result, index) => (
              <div
                key={index}
                onClick={() => handleBookNow(result)}
                className="p-4 mt-2 border-2 border-gray-200 rounded-lg cursor-pointer hover:bg-gray-200"
              >
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-xl font-semibold">{result.operator}</h3>
                  <span className="text-sm bg-blue-200 text-blue-800 rounded-full px-2 py-1">
                    ${result.price.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between items-center mb-1">
                  <span className="font-normal">{result.departureTime}</span>
                  {/* <span className="font-light text-sm">{result.date}</span> */}
                  <span className="font-normal">{result.arrivalTime}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="truncate max-w-sm font-light">
                    {result.departureStation}
                  </span>
                  <span className="truncate max-w-sm font-light">
                    {result.arrivalStation}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
