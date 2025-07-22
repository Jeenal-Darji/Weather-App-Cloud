import React, { useState, useEffect } from "react";
import { fetchWeather } from "../api/weather";

const Weather = ({ selectedCity }) => {
  const [weather, setWeather] = useState(null);

  useEffect(() => {
    if (selectedCity) {
      getWeather(selectedCity);
    }
  }, [selectedCity]); // Runs every time a new city is selected

  const getWeather = async (city) => {
    try {
      const data = await fetchWeather(city);
      setWeather(data);
    } catch (error) {
      console.error("Error fetching weather:", error);
    }
  };

  return (
    <div className="p-4 text-center">
      <h2 className="text-2xl font-bold">Weather Forecast</h2>

      {weather ? (
        <div className="mt-4 p-4 border rounded bg-gray-100">
          <h3 className="text-xl font-bold">{weather.name}</h3>
          <p>Temperature: {weather.main.temp}°C</p>
          <p>Humidity: {weather.main.humidity}%</p>
          <p>Condition: {weather.weather[0].description}</p>
        </div>
      ) : (
        <p>Select a city to view its weather.</p>
      )}
    </div>
  );
};

export default Weather;
