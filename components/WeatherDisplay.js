// components/WeatherDisplay.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const WeatherDisplay = () => {
  const [weatherData, setWeatherData] = useState(null);
  const [error, setError] = useState(null);
  const apiKey = 'e44068033495acdea5c7116bc3cfec85';
  const city = 'London';

  useEffect(() => {
    const fetchWeather = async () => {
      console.log("APIKEY", apiKey);
      try {
        const response = await axios.get('https://api.openweathermap.org/data/2.5/weather', {
          params: { q: city, appid: apiKey, units: 'metric' },
        });
        setWeatherData(response.data);
      } catch (error) {
        setError(error.response?.data?.message || 'Error fetching weather data');
      }
    };

    fetchWeather();
  }, [apiKey]);

  // Draggable handler
  const handleDrag = (e) => {
    e.target.style.position = 'absolute';
    e.target.style.left = `${e.pageX - e.target.offsetWidth / 2}px`;
    e.target.style.top = `${e.pageY - e.target.offsetHeight / 2}px`;
  };

  if (error) return <p>Error: {error}</p>;
  if (!weatherData) return <p>Loading weather...</p>;

  return (
    <div style={styles.weatherContainer} onMouseDown={handleDrag}>
      <h3>{weatherData.name} Weather</h3>
      <p>Temperature: {weatherData.main.temp}°C</p>
      <p>Humidity: {weatherData.main.humidity}%</p>
      <p>Conditions: {weatherData.weather[0].description}</p>
    </div>
  );
};

const styles = {
  weatherContainer: {
    width: '200px',
    padding: '10px',
    backgroundColor: 'lightblue',
    borderRadius: '8px',
    boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.2)',
    cursor: 'move', // Indicates draggable behavior
    textAlign: 'center',
  },
};

export default WeatherDisplay;
