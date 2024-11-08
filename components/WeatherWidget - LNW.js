import React, { useState, useEffect } from 'react';
import axios from 'axios';
import DraggableBox from './DraggableBox';
import { ResizableBox } from 'react-resizable'; // Import ResizableBox from react-resizable
import 'react-resizable/css/styles.css'; // Import styles for the resizable component
import WbSunnyIcon from '@mui/icons-material/WbSunny';
import CloudIcon from '@mui/icons-material/Cloud';
import OpacityIcon from '@mui/icons-material/Opacity';
import AcUnitIcon from '@mui/icons-material/AcUnit';
import ThunderstormIcon from '@mui/icons-material/Thunderstorm';

const WeatherWidget = () => {
  const [weatherData, setWeatherData] = useState(null);
  const [hourlyData, setHourlyData] = useState([]);
  const [error, setError] = useState(null);
  const [lastWeatherData, setLastWeatherData] = useState(null);
  const [city, setCity] = useState(null);
  const apiKey = 'e44068033495acdea5c7116bc3cfec85';

  // Request permission for notifications when the component mounts
  useEffect(() => {
    requestNotificationPermission();
    if (typeof window !== "undefined" && document.styleSheets.length > 0) {
      const styleSheet = document.styleSheets[0];
      if (styleSheet) {
        styleSheet.insertRule(`
          @keyframes shineEffect {
            0% {
              box-shadow: 0 0 15px rgba(255, 255, 255, 0.6), 0 0 30px rgba(255, 255, 255, 0.3);
            }
            100% {
              box-shadow: 0 0 30px rgba(255, 255, 255, 0.8), 0 0 60px rgba(255, 255, 255, 0.5);
            }
          }
        `, styleSheet.cssRules.length);
      }
    }
  }, []);

  // Function to request notification permission
  const requestNotificationPermission = () => {
    if ('Notification' in window) {
      Notification.requestPermission().then((permission) => {
        if (permission === 'granted') {
          console.log('Notification permission granted.');
        } else {
          console.log('Notification permission denied.');
        }
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
        // Fetch current weather and hourly data (forecast for 48 hours)
        const response = await axios.get('https://api.openweathermap.org/data/2.5/onecall', {
          params: { 
            lat: city.latitude,
            lon: city.longitude,
            appid: apiKey,
            units: 'metric'
          },
        });
        setWeatherData(response.data.current); // Current weather data
        setHourlyData(response.data.hourly.slice(0, 4)); // Get next 3 hours data (including current)

        // Check if weather has changed significantly
        if (lastWeatherData && Math.abs(response.data.current.temp - lastWeatherData.temp) >= 5) {
          sendWeatherNotification('Significant Weather Change', {
            body: `The temperature in ${city} has changed by more than 5°C.`,
          });
        }

        // Update last weather data
        setLastWeatherData(response.data.current);
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

  // Function to format time in 12-hour format
  const formatTime = (timestamp) => {
    const date = new Date(timestamp * 1000);
    let hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12;
    return `${hours}:${minutes < 10 ? '0' + minutes : minutes} ${ampm}`;
  };

  if (error) return <p>Error: {error}</p>;
  if (!weatherData || !hourlyData.length) return <p>Loading weather...</p>;

  const weatherCondition = weatherData.weather[0].description.toLowerCase();
  const weatherIcon = getWeatherIcon(weatherCondition);

  return (
    <DraggableBox>
      <ResizableBox
        width={300}
        height={300}
        minConstraints={[200, 150]} // Minimum size
        maxConstraints={[400, 400]} // Maximum size
        axis="both"
        resizeHandles={['se']} // Resize from bottom-right corner
        style={{ ...styles.weatherContainer }}
      >
        <div style={styles.cityContainer}>
          <h3 style={styles.cityName}>{city}</h3>
        </div>
        <div style={styles.weatherDetails}>
          <div style={styles.weatherIconContainer}>{weatherIcon}</div>
          <p style={styles.weatherTemp}>
            {Number(weatherData.temp) % 1 === 0 ? weatherData.temp.toFixed(0) : weatherData.temp.toFixed(1)}°C
          </p>
          <p style={styles.weatherCondition}>{weatherData.weather[0].description}</p>
          <p style={styles.currentTime}>Current Time: {formatTime(weatherData.dt)}</p>
        </div>
        <div style={styles.forecastContainer}>
          <h4>Next 3 Hours:</h4>
          {hourlyData.map((hour, index) => (
            <div key={index} style={styles.forecastItem}>
              <p style={styles.forecastTime}>{formatTime(hour.dt)}</p>
              <div style={styles.forecastIcon}>{getWeatherIcon(hour.weather[0].description)}</div>
              <p style={styles.forecastTemp}>{hour.temp.toFixed(1)}°C</p>
            </div>
          ))}
        </div>
      </ResizableBox>
    </DraggableBox>
  );
};

const styles = {
  weatherContainer: {
    width: '100%',
    height: '100%',
    padding: '20px',
    background: 'linear-gradient(135deg, rgba(0, 133, 255, 0.7), rgba(50, 153, 255, 0.7))',
    borderRadius: '10px',
    boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)',
    textAlign: 'center',
    backdropFilter: 'blur(5px)',
    transition: 'all 0.3s ease-in-out',
    position: 'relative',
  },
  cityContainer: {
    background: 'rgba(255, 255, 255, 0.7)', // Slight background for city name
    borderRadius: '20px',
    padding: '5px 15px',
    marginBottom: '15px',
    display: 'inline-block',
  },
  cityName: {
    fontSize: '22px',
    fontWeight: 'bold',
    color: '#ffffff',
    margin: 0,
  },
  weatherDetails: {
    fontSize: '16px',
    color: '#ffffff',
  },
  weatherTemp: {
    fontSize: '32px',
    margin: '10px 0',
  },
  weatherCondition: {
    fontSize: '16px',
  },
  currentTime: {
    fontSize: '14px',
    margin: '10px 0',
  },
  weatherIconContainer: {
    fontSize: '50px',
    margin: '10px 0',
  },
  forecastContainer: {
    marginTop: '20px',
    fontSize: '14px',
    color: '#ffffff',
  },
  forecastItem: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '5px 0',
    borderBottom: '1px solid rgba(255, 255, 255, 0.2)',
  },
  forecastTime: {
    fontSize: '12px',
  },
  forecastTemp: {
    fontSize: '12px',
  },
  forecastIcon: {
    fontSize: '20px',
  },
};

export default WeatherWidget;
