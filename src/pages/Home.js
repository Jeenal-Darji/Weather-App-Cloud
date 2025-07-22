// src/pages/Home.js
import React, { useState, useEffect } from 'react';
import { getWeatherData } from '../api/weather';
import Sidebar from '../components/sidebar';
import WeatherCard from '../components/WeatherCard';
import ForecastChart from '../components/ForecastChart';
import AirQuality from '../components/AirQuality';
import WindInfo from '../components/WindInfo';
import UVIndex from '../components/UVIndex';
import Precipitation from '../components/Precipitation';

const Home = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [darkMode, setDarkMode] = useState(false);
  
  // Auto set dark mode based on time of day
  useEffect(() => {
    const hour = new Date().getHours();
    setDarkMode(hour < 6 || hour >= 18); // Dark mode between 6 PM and 6 AM
    
    // Check for user's dark mode preference
    const savedDarkMode = localStorage.getItem('darkMode');
    if (savedDarkMode) {
      setDarkMode(savedDarkMode === 'true');
    }
  }, []);
  
  // Save dark mode preference
  useEffect(() => {
    localStorage.setItem('darkMode', darkMode);
    document.body.classList.toggle('dark-mode', darkMode);
  }, [darkMode]);
  
  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const data = await getWeatherData(searchQuery);
      setWeatherData(data);
      setSearchQuery('');
    } catch (err) {
      setError('City not found. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  
  const handleCitySelect = async (cityName) => {
    if (!cityName) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const data = await getWeatherData(cityName);
      setWeatherData(data);
    } catch (err) {
      setError('Failed to load weather data for selected city.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  
  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };
  
  return (
    <div className={`home-container ${darkMode ? 'dark-mode' : 'light-mode'}`}>
      <Sidebar 
        onCitySelect={handleCitySelect} 
        currentCity={weatherData?.current}
      />
      
      <main className="content">
        <div className="top-bar">
          <form onSubmit={handleSearch} className="search-form">
            <input
              type="text"
              placeholder="Search for a city..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
            <button type="submit" className="search-button">
              Get Weather
            </button>
          </form>
          
          <button 
            onClick={toggleDarkMode} 
            className="mode-toggle"
            aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {darkMode ? '☀️' : '🌙'}
          </button>
        </div>
        
        {loading && <div className="loading">Loading weather data...</div>}
        
        {error && <div className="error-message">{error}</div>}
        
        {!weatherData && !loading && !error && (
          <div className="welcome-message">
            <h2>Welcome to the Weather App</h2>
            <p>Enter a city name to get started</p>
          </div>
        )}
        
        {weatherData && (
          <div className="weather-container">
            <WeatherCard data={weatherData} />
            
            <div className="forecast-section">
              <ForecastChart forecast={weatherData.forecast} />
            </div>
            
            <div className="details-grid">
              <AirQuality data={weatherData} />
              <WindInfo data={weatherData} />
              <UVIndex data={weatherData} />
              <Precipitation data={weatherData} />
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Home;