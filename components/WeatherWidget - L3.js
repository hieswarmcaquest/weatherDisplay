// components/WeatherWidget.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import DraggableBox from './DraggableBox';
import WbSunnyIcon from '@mui/icons-material/WbSunny';
import CloudIcon from '@mui/icons-material/Cloud';
import OpacityIcon from '@mui/icons-material/Opacity';
import AcUnitIcon from '@mui/icons-material/AcUnit';
import ThunderstormIcon from '@mui/icons-material/Thunderstorm';

const WeatherWidget = () => {
  const [weatherData, setWeatherData] = useState(null);
  const [error, setError] = useState(null);
  const [city, setCity] = useState(null);
  const apiKey = 'e44068033495acdea5c7116bc3cfec85';

  // Function to get user location based on IP
  const fetchLocation = async () => {
    try {
      const response = await axios.get('https://ipapi.co/json/');
      setCity(response.data.city);
    } catch (error) {
      setError('Error fetching location');
    }
  };

  // Fetch weather data once location is set
  useEffect(() => {
    const fetchWeather = async () => {
      if (!city) return;
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
  }, [city, apiKey]);

  // Fetch location on component mount
  useEffect(() => {
    fetchLocation();
  }, []);

  // Select the appropriate icon based on the weather condition
  const getWeatherIcon = (condition) => {
    if (condition.includes('cloud')) return <CloudIcon style={styles.weatherIcon} />;
    if (condition.includes('rain')) return <OpacityIcon style={styles.weatherIcon} />;
    if (condition.includes('clear')) return <WbSunnyIcon style={styles.weatherIcon} />;
    if (condition.includes('snow')) return <AcUnitIcon style={styles.weatherIcon} />;
    if (condition.includes('thunderstorm')) return <ThunderstormIcon style={styles.weatherIcon} />;
    return <CloudIcon style={styles.weatherIcon} />; // default icon
  };

  if (error) return <p>Error: {error}</p>;
  if (!weatherData) return <p>Loading weather...</p>;

  const weatherCondition = weatherData.weather[0].description.toLowerCase();
  const weatherIcon = getWeatherIcon(weatherCondition);

  return (
    <DraggableBox>
      <div style={styles.weatherContainer}>
        <div style={styles.cityContainer}>
          <h3 style={styles.cityName}>{weatherData.name}</h3>
        </div>
        <div style={styles.weatherDetails}>
          <p style={styles.weatherTemp}>Temperature: {weatherData.main.temp}°C</p>
          <p style={styles.weatherHumidity}>Humidity: {weatherData.main.humidity}%</p>
          <div style={styles.weatherIconContainer}>{weatherIcon}</div>
        </div>
      </div>
    </DraggableBox>
  );
};

const styles = {
  weatherContainer: {
    width: '250px',
    padding: '20px',
    backgroundColor: 'rgba(135, 206, 250, 0.8)', // Light blue background with transparency
    borderRadius: '12px',
    boxShadow: '0 4px 10px rgba(0, 0, 0, 0.2)',
    textAlign: 'center',
    backdropFilter: 'blur(10px)', // Adding a blur effect for a soft look
    transition: 'all 0.3s ease-in-out',
    maxWidth: '300px',
  },
  cityContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.6)', // Light background for city name
    borderRadius: '8px',
    marginBottom: '15px',
    padding: '10px',
  },
  cityName: {
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#2a2a2a',
    margin: 0,
  },
  weatherDetails: {
    fontSize: '16px',
    fontWeight: '500',
    color: '#333',
  },
  weatherTemp: {
    marginBottom: '10px',
  },
  weatherHumidity: {
    marginBottom: '15px',
  },
  weatherIconContainer: {
    marginTop: '10px',
  },
  weatherIcon: {
    fontSize: '60px', // Larger icon size
    color: '#1976d2', // Icon color
    transition: 'transform 0.3s ease',
  },
  weatherContainerHover: {
    '&:hover': {
      boxShadow: '0 8px 20px rgba(0, 0, 0, 0.3)', // Hover shadow effect
      transform: 'scale(1.05)', // Slight scale-up effect on hover
    },
  },
};

export default WeatherWidget;
