import React, { useState, useEffect } from "react";
import { fetchWeather, fetchForecast } from "./api/weather";
import { db, auth, analytics } from "./firebase"; // messaging removed
import { doc, getDoc, setDoc, onSnapshot, collection } from "firebase/firestore";
import "bootstrap/dist/css/bootstrap.min.css";
import "./App.css";
import { logEvent } from "firebase/analytics";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Signup from "./pages/Signup";
import Login from "./pages/login";
import { onAuthStateChanged, signOut } from "firebase/auth";
import Sidebar from "./components/sidebar";

const WeatherApp = ({
  searchInput,
  setSearchInput,
  savedCities,
  getWeather,
  saveCity,
  handleSubmit,
  weather,
  forecast,
  error,
  convertUnixToTime,
  getWindDirection,
  getWeatherEmoji,
  deleteCity,
}) => (
  <div className="app-container">
    <div className="topbar">
      <button
        onClick={() => {
          signOut(auth)
            .then(() => {
              console.log("User signed out");
              window.location.reload();
            })
            .catch((error) => console.error("Sign out error:", error));
        }}
        className="signout-btn-top"
      >
        Sign Out
      </button>
    </div>
    <Sidebar
      onSelectCity={(cityName) => {
        setSearchInput(cityName);
        getWeather(cityName);
      }}
      savedCities={savedCities}
      onDeleteCity={deleteCity}
    />
    <div className="container">
      <h1>Weather Forecast</h1>
      <form onSubmit={handleSubmit} className="input-group">
        <input
          type="text"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="Enter city name"
        />
        <button type="submit">Search</button>
        <button type="button" onClick={() => saveCity(searchInput)}>
          Add City
        </button>
      </form>

      {error && <div className="error-message">{error}</div>}

      {weather && (
        <>
          <div className="current-weather">
            <h2>
              {weather.name}, {weather.sys.country}
            </h2>
            <div className="weather-emoji">
              {getWeatherEmoji(weather.weather[0].description)}
            </div>
            <p className="temperature">
              {Math.round(weather.main.temp)}°C
            </p>
            <p className="weather-condition">
              {weather.weather[0].description}
            </p>
            <div className="weather-details">
              <div>
                <span className="icon">💧</span>{" "}
                <strong>Humidity:</strong> {weather.main.humidity}%
              </div>
              <div>
                <span className="icon">🌬</span>{" "}
                <strong>Wind:</strong> {weather.wind.speed} m/s
              </div>
              <div>
                <span className="icon">☁</span>{" "}
                <strong>Clouds:</strong> {weather.clouds.all}%
              </div>
            </div>
          </div>

          <div className="weather-info-boxes">
            <div className="info-box">
              <span className="emoji">🌅</span>
              <strong>Sunrise:</strong>
              <p>{convertUnixToTime(weather.sys.sunrise)}</p>
            </div>
            <div className="info-box">
              <span className="emoji">🌇</span>
              <strong>Sunset:</strong>
              <p>{convertUnixToTime(weather.sys.sunset)}</p>
            </div>
            <div className="info-box">
              <span className="emoji">🔭</span>
              <strong>Visibility:</strong>
              <p>{(weather.visibility / 1000).toFixed(1)} km</p>
            </div>
            <div className="info-box">
              <span className="emoji">💧</span>
              <strong>Precipitation:</strong>
              <p>{weather.rain ? `${weather.rain['1h'] || 0} mm` : "0 mm"}</p>
            </div>
            <div className="info-box">
              <span className="emoji">🧭</span>
              <strong>Wind Direction:</strong>
              <p>{getWindDirection(weather.wind.deg)}</p>
            </div>
          </div>
        </>
      )}

      {forecast.length > 0 && (
        <>
          <h2 className="forecast-title">5-Day Forecast</h2>
          <div className="forecast-container">
            {forecast.map((item, index) => {
              const condition = item.weather[0].description;
              const date = new Date(item.dt_txt);
              const formattedDate = date.toLocaleDateString(undefined, {
                month: "numeric",
                day: "numeric",
                year: "numeric",
              });
              return (
                <div key={index} className="forecast-card">
                  <h3>{formattedDate}</h3>
                  <div className="weather-emoji">
                    {getWeatherEmoji(condition)}
                  </div>
                  <p className="temp">{Math.round(item.main.temp)}°C</p>
                  <p className="weather-condition">{condition}</p>
                  <div className="weather-metric">
                    <span className="icon">🌬</span> {item.wind.speed} m/s
                  </div>
                  <div className="weather-metric">
                    <span className="icon">💧</span> {item.main.humidity}%
                  </div>
                  <div className="weather-metric">
                    <span className="icon">👁</span>{" "}
                    {(item.visibility / 1000).toFixed(1)} km
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* Weather Alert Section */}
      {weather && (
        <div className="weather-alert">
          <h3>⚠️ Weather Alert </h3> 
          <h3> 
           </h3>
          <p>{getWeatherAlert(weather)}</p>
        </div>
      )}
    </div>
  </div>
);

// Helper function to generate weather alert based on current weather
const getWeatherAlert = (weather) => {
  if (!weather) return "";
  const temp = weather.main.temp;
  const condition = weather.weather[0].main;
  const wind = weather.wind.speed;
  const visibility = weather.visibility;

  if (temp > 40)
    return "Extreme heat alert! Stay hydrated and avoid going out during peak hours.";
  if (temp < 0)
    return "Freezing weather ahead! Dress warmly and watch out for icy roads.";
  if (condition === "Thunderstorm")
    return "⛈ Thunderstorm warning! Avoid open areas and stay indoors.";
  if (
    condition === "Rain" &&
    weather.rain &&
    ((weather.rain["1h"] && weather.rain["1h"] > 10) ||
      (weather.rain["3h"] && weather.rain["3h"] > 20))
  )
    return "Heavy rainfall alert! Possible water logging in low-lying areas.";
  if (wind > 15)
    return "High wind alert! Secure loose items and avoid unnecessary travel.";
  if (visibility < 1000)
    return "Low visibility warning due to fog or mist. Drive cautiously.";

  return "No unusual weather conditions currently. Enjoy your day!";
};

const App = () => {
  const [searchInput, setSearchInput] = useState("");
  const [weather, setWeather] = useState(null);
  const [forecast, setForecast] = useState([]);
  const [user, setUser] = useState(null);
  const [savedCities, setSavedCities] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) listenToUserCities(currentUser.email);
    });
    return () => unsubscribe();
  }, []);

  const getWeather = async (selectedCity) => {
    if (!selectedCity) return;
    setError("");
    logEvent(analytics, "city_search", { searched_city: selectedCity });

    try {
      const weatherData = await fetchWeather(selectedCity);
      const forecastData = await fetchForecast(selectedCity);

      if (!weatherData || weatherData.cod === "404") {
        setError("City not found. Please check the spelling and try again.");
        setWeather(null);
        setForecast([]);
        return;
      }

      setWeather(weatherData);
      setForecast(forecastData ? processForecastData(forecastData) : []);
    } catch (error) {
      console.error("Error fetching weather data:", error);
      setError("Failed to get weather data. Please try again later.");
      setWeather(null);
      setForecast([]);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    getWeather(searchInput);
  };

  const listenToUserCities = (email) => {
    const userDocRef = doc(db, "savedCities", email);
    return onSnapshot(
      userDocRef,
      (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          setSavedCities(data.cities || []);
        }
      },
      (error) => console.error("Error listening to saved cities:", error)
    );
  };

  const saveCity = async (cityName) => {
    try {
      const user = auth.currentUser;
      if (!user) return alert("Please log in to save cities.");
      const userDocRef = doc(db, "savedCities", user.email);
      const userDocSnap = await getDoc(userDocRef);
      let existingCities = userDocSnap.exists() ? userDocSnap.data().cities || [] : [];

      if (existingCities.includes(cityName)) return alert("City already saved!");

      const updatedCities = [...existingCities, cityName];
      await setDoc(userDocRef, { cities: updatedCities });
      console.log("✅ City saved:", cityName);

      if ("Notification" in window && Notification.permission === "granted") {
        new Notification("✅ City Added", {
          body: `${cityName} was successfully added to your saved cities.`,
          icon: "/weather-icon.png",
        });
      }
    } catch (error) {
      console.error("Error saving city:", error);
    }
  };

  const deleteCity = async (cityName) => {
    try {
      const user = auth.currentUser;
      if (!user) return;
      const userDocRef = doc(db, "savedCities", user.email);
      const docSnap = await getDoc(userDocRef);
      if (!docSnap.exists()) return;
      const existingCities = docSnap.data().cities || [];
      const updatedCities = existingCities.filter((city) => city !== cityName);
      await setDoc(userDocRef, { cities: updatedCities });

      if ("Notification" in window && Notification.permission === "granted") {
        new Notification("🗑️ City Removed", {
          body: `${cityName} was removed from your saved cities.`,
          icon: "/weather-icon.png",
        });
      }
    } catch (error) {
      console.error("Error deleting city:", error);
    }
  };

  const convertUnixToTime = (unix) =>
    new Date(unix * 1000).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });

  const processForecastData = (forecastData) => {
    const daily = [];
    const grouped = {};
    const today = new Date().toLocaleDateString();

    forecastData.list.forEach((item) => {
      const date = new Date(item.dt_txt).toLocaleDateString();
      if (date !== today)
        grouped[date] = [...(grouped[date] || []), item];
    });

    Object.keys(grouped)
      .slice(0, 5)
      .forEach((date) => {
        const closest = grouped[date].reduce((a, b) =>
          Math.abs(new Date(b.dt_txt).getHours() - 12) <
          Math.abs(new Date(a.dt_txt).getHours() - 12)
            ? b
            : a
        );
        daily.push(closest);
      });

    return daily;
  };

  const getWindDirection = (deg) => {
    const dirs = [
      "N",
      "NNE",
      "NE",
      "ENE",
      "E",
      "ESE",
      "SE",
      "SSE",
      "S",
      "SSW",
      "SW",
      "WSW",
      "W",
      "WNW",
      "NW",
      "NNW",
    ];
    return dirs[Math.round(deg / 22.5) % 16];
  };

  const getWeatherEmoji = (desc) => {
    if (desc.includes("Clear")) return "☀";
    if (desc.includes("Clouds")) return "☁";
    if (desc.includes("Rain")) return "🌧";
    if (desc.includes("Thunderstorm")) return "⛈";
    if (desc.includes("Snow")) return "❄";
    if (desc.includes("Fog") || desc.includes("Mist")) return "🌫";
    return "🌤";
  };



  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={
            user ? (
              <WeatherApp
                searchInput={searchInput}
                setSearchInput={setSearchInput}
                savedCities={savedCities}
                getWeather={getWeather}
                saveCity={saveCity}
                handleSubmit={handleSubmit}
                weather={weather}
                forecast={forecast}
                error={error}
                convertUnixToTime={convertUnixToTime}
                getWindDirection={getWindDirection}
                getWeatherEmoji={getWeatherEmoji}
                deleteCity={deleteCity}
              />
            ) : (
              <Login />
            )
          }
        />
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
      </Routes>
    </Router>
  );
};

export default App;
