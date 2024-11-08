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
  const [error, setError] = useState(null);
  const [lastWeatherData, setLastWeatherData] = useState(null);
  const [city, setCity] = useState(null);
  const apiKey = 'e44068033495acdea5c7116bc3cfec85';

  useEffect(() => {
    requestNotificationPermission();
  }, []);

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

  const fetchLocation = async () => {
    try {
      const response = await axios.get('https://ipapi.co/json/');
      setCity(response.data.city);
    } catch (error) {
      setError('Error fetching location');
    }
  };

  useEffect(() => {
    const fetchWeather = async () => {
      if (!city) return;
      try {
        const response = await axios.get('https://api.openweathermap.org/data/2.5/weather', {
          params: { q: city, appid: apiKey, units: 'metric' },
        });
        setWeatherData(response.data);

        if (lastWeatherData && Math.abs(response.data.main.temp - lastWeatherData.main.temp) >= 5) {
          sendWeatherNotification('Significant Weather Change', {
            body: `The temperature in ${city} has changed by more than 5°C.`,
          });
        }

        setLastWeatherData(response.data);
      } catch (error) {
        setError(error.response?.data?.message || 'Error fetching weather data');
      }
    };

    fetchWeather();
  }, [city, apiKey, lastWeatherData]);

  useEffect(() => {
    fetchLocation();
  }, []);

  const sendWeatherNotification = (title, options) => {
    if (Notification.permission === 'granted') {
      new Notification(title, options);
    }
  };

  const getWeatherIcon = (condition) => {
    if (condition.includes('cloud')) return <CloudIcon style={{ ...styles.weatherIcon, color: '#90a4ae' }} />;
    if (condition.includes('rain')) return <OpacityIcon style={{ ...styles.weatherIcon, color: '#607d8b' }} />;
    if (condition.includes('clear')) return <WbSunnyIcon style={{ ...styles.weatherIcon, color: '#ffeb3b' }} />;
    if (condition.includes('snow')) return <AcUnitIcon style={{ ...styles.weatherIcon, color: '#00bcd4' }} />;
    if (condition.includes('thunderstorm')) return <ThunderstormIcon style={{ ...styles.weatherIcon, color: '#9e9e9e' }} />;
    return <CloudIcon style={{ ...styles.weatherIcon, color: '#90a4ae' }} />;
  };

  const getWeatherAnimation = (condition) => {
    if (condition.includes('clear')) return 'sunshineEffect';
    if (condition.includes('cloud')) return 'cloudEffect';
    if (condition.includes('rain')) return 'rainEffect';
    if (condition.includes('snow')) return 'snowEffect';
    if (condition.includes('thunderstorm')) return 'thunderstormEffect';
    return '';
  };

  const getWidgetShape = (condition) => {
    if (condition.includes('clear')) return styles.circularShape;
    if (condition.includes('rain')) return styles.cloudShape;
    if (condition.includes('snow')) return styles.snowShape;
    return styles.defaultShape;
  };

  if (error) return <p>Error: {error}</p>;
  if (!weatherData) return <p>Loading weather...</p>;

  const weatherCondition = weatherData.weather[0].description.toLowerCase();
  const weatherIcon = getWeatherIcon(weatherCondition);
  const widgetShape = getWidgetShape(weatherCondition);
  const weatherAnimation = getWeatherAnimation(weatherCondition);

  return (
    <DraggableBox>
      <ResizableBox
        width={300}
        height={220}
        minConstraints={[150, 150]}
        maxConstraints={[400, 300]}
        axis="both"
        resizeHandles={['se']}
        style={{ ...styles.weatherContainer, ...widgetShape }}
      >
        <div style={styles.cityContainer}>
          <div style={styles.cityInfo}>
            <h3 style={styles.cityName}>{weatherData.name}</h3>
            <div style={styles.weatherDetails}>
              <p style={styles.weatherTemp}>
                {Number(weatherData.main.temp) % 1 === 0 ? weatherData.main.temp.toFixed(0) : weatherData.main.temp.toFixed(1)}°C
              </p>
              <p style={styles.weatherHumidity}>Humidity: {weatherData.main.humidity}%</p>
            </div>
          </div>
        </div>
        <div className={weatherAnimation} style={styles.weatherIconContainer}>
          {weatherIcon}
        </div>
      </ResizableBox>
    </DraggableBox>
  );
};

const styles = {
  weatherContainer: {
    width: '100%',
    height: '100%',
    padding: '10px',
    background: 'linear-gradient(135deg, rgba(15, 30, 84, 0.95), rgba(60, 80, 150, 0.9))', 
    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.3)',
    backdropFilter: 'blur(10px)',
    borderRadius: '12px',
    overflow: 'hidden',
    textAlign: 'left',
    color: '#e0e8ff',
  },
  cityContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    marginBottom: '6px',
  },
  cityInfo: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    marginBottom: '2px', // Minimal bottom margin for compactness
  },
  cityName: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#ffffff',
    margin: '0 0 4px 0', // Tight bottom margin to keep close to other text
  },
  weatherDetails: {
    color: '#b3c7ff',
    fontSize: '13px',
    margin: '0', // Remove margin to keep text close
  },
  weatherTemp: {
    margin: '0',
    fontSize: '24px',
    fontWeight: '700',
    color: '#e0e8ff',
    textShadow: '0px 1px 5px rgba(0, 0, 0, 0.5)',
  },
  weatherHumidity: {
    margin: '2px 0 0 0', // Tighten top margin
    fontSize: '13px',
    color: '#cfd8ff',
  },
  weatherIconContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '50%',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    width: '48px',
    height: '48px',
    boxShadow: '0px 3px 10px rgba(0, 0, 0, 0.2)',
    margin: '0 0 8px 0', // Minimal space around icon container
  },
  weatherIcon: {
    fontSize: '36px',
    color: '#f1f5ff',
  },
};


export default WeatherWidget;
