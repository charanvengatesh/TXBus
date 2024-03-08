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
    const url = "http://localhost:3001/submitForm"; // Update this URL to your Flask endpoint

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
    <main>
      <div>
        <h1>TXBus</h1>
        <form onSubmit={handleSubmit}>
          <div>
            <label htmlFor="date">Date:</label>
            <input
              type="date"
              id="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
            />
          </div>
          <div>
            <label htmlFor="departure">Departure City:</label>
            <select
              id="departure"
              name="departure"
              value={formData.departure}
              onChange={handleChange}
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
            <label htmlFor="arrival">Arrival City:</label>
            <select
              id="arrival"
              name="arrival"
              value={formData.arrival}
              onChange={handleChange}
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
            <label htmlFor="passengers">Passengers:</label>
            <input
              type="number"
              id="passengers"
              name="passengers"
              value={formData.passengers}
              onChange={handleChange}
              min="1"
            />
          </div>
          <button type="submit">Search</button>
        </form>

        {Array.isArray(searchResults) && searchResults.length > 0 && (
          <div>
            <h2>Search Results</h2>

            <div></div>
            {searchResults.map((result, index) => (
              <div key={index}>
                <p>
                  <span>Date:</span> {result.date}
                </p>
                <p>
                  <span>Departure:</span>{" "}
                  {result.departureCity} ({result.departureStation}) at{" "}
                  {result.departureTime}
                </p>
                <p>
                  <span>Arrival:</span>{" "}
                  {result.arrivalCity} ({result.arrivalStation}) at{" "}
                  {result.arrivalTime}
                </p>
                <p>
                  <span>Operator:</span>{" "}
                  {result.operator}
                </p>
                <p>
                  <span>Price:</span> $
                  {result.price.toFixed(2)}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
