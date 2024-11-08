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

  // Dynamic styles based on weather condition
  const getWidgetShape = (condition) => {
    if (condition.includes('clear')) return styles.circularShape;  // Sunny: circle
    if (condition.includes('rain')) return styles.cloudShape;    // Rainy: cloud-like
    if (condition.includes('snow')) return styles.snowShape;     // Snowy: square with rounded corners
    return styles.defaultShape; // Default: square
  };

  if (error) return <p>Error: {error}</p>;
  if (!weatherData) return <p>Loading weather...</p>;

  const weatherCondition = weatherData.weather[0].description.toLowerCase();
  const weatherIcon = getWeatherIcon(weatherCondition);
  const widgetShape = getWidgetShape(weatherCondition);

  return (
    <DraggableBox>
      <div style={{ ...styles.weatherContainer, ...widgetShape }}>
        <div style={styles.cityContainer}>
          <h3 style={styles.cityName}>{weatherData.name}</h3>
        </div>
        <div style={styles.weatherDetails}>
          <p style={styles.weatherTemp}>
            Temperature: {Number(weatherData.main.temp) % 1 === 0 ? weatherData.main.temp.toFixed(0) : weatherData.main.temp.toFixed(1)}°C
          </p>
          <p style={styles.weatherHumidity}>Humidity: {weatherData.main.humidity}%</p>
          <div style={styles.weatherIconContainer}>{weatherIcon}</div>
        </div>
      </div>
    </DraggableBox>
  );
};

const styles = {
  weatherContainer: {
    width: '200px',
    height: '200px',
    padding: '15px',
    background: 'linear-gradient(135deg, rgba(0, 133, 255, 0.8), rgba(50, 153, 255, 0.8))',
    boxShadow: '0 8px 30px rgba(0, 0, 0, 0.3)',
    textAlign: 'center',
    backdropFilter: 'blur(10px)',
    transition: 'all 0.3s ease-in-out',
    maxWidth: '300px',
    position: 'relative',
    animation: 'shineEffect 2s infinite alternate', // Shine animation
    overflow: 'hidden', // Ensure content stays within the shape
  },
  circularShape: {
    borderRadius: '50%', // Make it circular for sunny weather
  },
  cloudShape: {
    borderRadius: '20%', // Make it cloud-like for rainy weather
  },
  snowShape: {
    borderRadius: '15%', // Square with rounded corners for snowy weather
  },
  defaultShape: {
    borderRadius: '5%', // Default square shape
  },
  cityContainer: {
    background: 'rgba(255, 255, 255, 0.6)', // Slight background for city name
    borderRadius: '50%',
    marginBottom: '10px',
    padding: '8px',
    display: 'inline-block',
  },
  cityName: {
    fontSize: '18px',
    fontWeight: 'bold',
    color: '#ffffff',
    margin: 0,
    textShadow: '0 0 10px rgba(255, 255, 255, 0.8)', // Glowing effect for city name
  },
  weatherDetails: {
    fontSize: '14px',
    color: '#ffffff',
  },
  weatherTemp: {
    marginBottom: '8px',
    fontSize: '16px',
    textShadow: '0 0 10px rgba(255, 255, 255, 0.8)', // Glowing effect for temperature
  },
  weatherHumidity: {
    marginBottom: '12px',
    fontSize: '14px',
  },
  weatherIconContainer: {
    marginTop: '8px',
  },
  weatherIcon: {
    fontSize: '45px',
    color: '#ffffff',
    transition: 'transform 0.3s ease',
    textShadow: '0 0 10px rgba(255, 255, 255, 0.8)', // Glowing effect for icon
  },
  permissionButton: {
    marginTop: '12px',
    padding: '8px 16px',
    fontSize: '14px',
    backgroundColor: '#4CAF50',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
  },
};

export default WeatherWidget;
