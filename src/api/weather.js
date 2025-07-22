import axios from "axios";
import { addCity } from "./cityActions"; 

const API_KEY = "54d6ab45b69841269bcd57873c54766b";
const BASE_URL = "https://api.openweathermap.org/data/2.5/weather";
const AIR_QUALITY_URL = "http://api.openweathermap.org/data/2.5/air_pollution";
const FORECAST_URL = "https://api.openweathermap.org/data/2.5/forecast";

export const fetchWeather = async (city) => {

  try {
    await addCity(city);
    const response = await axios.get(`${BASE_URL}?q=${city}&appid=${API_KEY}&units=metric`);
    return response.data;
  } catch (error) {
    console.error("Error fetching weather data:", error);
    return null;
  }
};


export const fetchForecast = async (city) => {
  try {
    await addCity(city);
    const response = await axios.get(`${FORECAST_URL}?q=${city}&appid=${API_KEY}&units=metric`);
    return response.data;
  } catch (error) {
    console.error("Error fetching forecast data:", error);
    return null;
 }
};     


export const fetchAirQuality = async (lat, lon) => {
  try {
    const response = await axios.get(`${AIR_QUALITY_URL}?lat=${lat}&lon=${lon}&appid=${API_KEY}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching air quality:", error);
    return null;
  }
};

export const estimateUVIndex = (temperature, cloudCover) => {
  return (temperature / 10) * (cloudCover/100);
};