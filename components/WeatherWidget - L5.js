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
  const [lastWeatherData, setLastWeatherData] = useState(null);
  const [city, setCity] = useState(null);
  const [notificationPermissionRequested, setNotificationPermissionRequested] = useState(false);
  const apiKey = 'e44068033495acdea5c7116bc3cfec85';

  // Function to request notification permission
  const requestNotificationPermission = () => {
    if ('Notification' in window) {
      Notification.requestPermission().then((permission) => {
        if (permission === 'granted') {
          console.log('Notification permission granted.');
        } else {
          console.log('Notification permission denied.');
        }
        setNotificationPermissionRequested(true); // Mark as requested
      });
    } else {
      console.log('This browser does not support notifications.');
    }
  };

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

        // Check if weather has changed significantly
        if (lastWeatherData && Math.abs(response.data.main.temp - lastWeatherData.main.temp) >= 5) {
          sendWeatherNotification('Significant Weather Change', {
            body: `The temperature in ${city} has changed by more than 5°C.`,
          });
        }

        // Update last weather data
        setLastWeatherData(response.data);
      } catch (error) {
        setError(error.response?.data?.message || 'Error fetching weather data');
      }
    };

    fetchWeather();
  }, [city, apiKey, lastWeatherData]);

  // Fetch location on component mount
  useEffect(() => {
    fetchLocation();
  }, []);

  // Function to send weather notifications
  const sendWeatherNotification = (title, options) => {
    if (Notification.permission === 'granted') {
      new Notification(title, options);
    }
  };

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
        {/* Button to request notification permission */}
        {!notificationPermissionRequested && (
          <button onClick={requestNotificationPermission} style={styles.permissionButton}>
            Enable Weather Notifications
          </button>
        )}
      </div>
    </DraggableBox>
  );
};

const styles = {
  weatherContainer: {
    width: '300px',
    padding: '20px',
    background: 'linear-gradient(135deg, rgba(0, 133, 255, 0.8), rgba(50, 153, 255, 0.8))',
    borderRadius: '15px',
    boxShadow: '0 8px 30px rgba(0, 0, 0, 0.3)',
    textAlign: 'center',
    backdropFilter: 'blur(10px)', // Soft blur background effect
    transition: 'all 0.3s ease-in-out',
    maxWidth: '350px',
  },
  cityContainer: {
    background: 'rgba(255, 255, 255, 0.6)', // Slight background for city name
    borderRadius: '10px',
    marginBottom: '15px',
    padding: '10px',
  },
  cityName: {
    fontSize: '26px',
    fontWeight: 'bold',
    color: '#ffffff',
    margin: 0,
  },
  weatherDetails: {
    fontSize: '16px',
    color: '#ffffff',
  },
  weatherTemp: {
    marginBottom: '10px',
    fontSize: '20px',
  },
  weatherHumidity: {
    marginBottom: '15px',
    fontSize: '18px',
  },
  weatherIconContainer: {
    marginTop: '10px',
  },
  weatherIcon: {
    fontSize: '65px',
    color: '#ffffff',
    transition: 'transform 0.3s ease',
  },
  permissionButton: {
    marginTop: '15px',
    padding: '10px 20px',
    fontSize: '16px',
    backgroundColor: '#4CAF50',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
  },
};

export default WeatherWidget;
