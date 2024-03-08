"use client";

import React, { FormEvent, useEffect, useState } from "react";

export default function Home() {
  const [formData, setFormData] = useState({
    date: "",
    departure: "",
    arrival: "",
    passengers: "",
  });

  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);

  interface SearchResult {
    arrivalCity: string;
    arrivalStation: string;
    arrivalTime: string;
    date: string;
    departureCity: string;
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

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ): Promise<void> {
    event.preventDefault(); // Prevent default form submission behavior
    const url = "https://txbus-production.up.railway.app/submitForm"; // Update this URL to your Flask endpoint

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error("Network response was not ok.");
      }

      const jsonResponse = await response.json();
      setSearchResults(jsonResponse); // Make sure jsonResponse is in the correct format
    } catch (error) {
      console.error("There was a problem with the fetch operation:", error);
    }
  }

  return (
    <main className="p-4">
      <div className="max-w-xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-6">TXBus</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
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
          <div>
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
          <button
            type="submit"
            className="w-full bg-blue-500 text-white p-2 rounded-lg font-medium hover:bg-blue-600"
          >
            Search
          </button>
        </form>

        {Array.isArray(searchResults) && searchResults.length > 0 && (
          <div className="mt-8">
            <h2 className="text-2xl font-bold mb-4">Search Results</h2>
            {searchResults.map((result, index) => (
              <div
                key={index}
                className="p-4 mb-4 border-2 border-gray-200 rounded-lg"
              >
                <h2 className="text-xl font-semibold">{result.operator}</h2>
                <p className="font-medium">
                  Date: <span className="font-normal">{result.date}</span>
                </p>
                <p className="font-medium">
                  Departure:{" "}
                  <span className="font-normal">
                    {result.departureCity} ({result.departureStation}) at{" "}
                    {result.departureTime}
                  </span>
                </p>
                <p className="font-medium">
                  Arrival:{" "}
                  <span className="font-normal">
                    {result.arrivalCity} ({result.arrivalStation}) at{" "}
                    {result.arrivalTime}
                  </span>
                </p>
                <p className="font-medium">
                  Price:{" "}
                  <span className="font-normal">
                    ${result.price.toFixed(2)}
                  </span>
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
