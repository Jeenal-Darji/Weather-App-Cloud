import React from "react";
import "./sidebar.css"; // Make sure you style it as needed

const Sidebar = ({ savedCities, onSelectCity, onDeleteCity }) => {
  return (
    <div className="sidebar">
      <h3>Saved Cities</h3>
      {savedCities.length === 0 ? (
        <p>No cities saved yet.</p>
      ) : (
        <ul className="city-list">
          {savedCities.map((city, index) => (
            <li key={index} className="city-item">
              <span className="city-name" onClick={() => onSelectCity(city)}>
                {city}
              </span>
              <button className="delete-btn" onClick={() => onDeleteCity(city)}>❌</button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Sidebar;
