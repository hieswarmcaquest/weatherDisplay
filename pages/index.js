import React from 'react';
import Head from 'next/head';
import WeatherWidget from '../components/WeatherWidget';

const Home = () => {
  const isWeatherEnabled = process.env.NEXT_PUBLIC_ENABLE_WEATHER === '1';

  return (
    <>
      <Head>
        <title>Weather Data</title>
      </Head>
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        {isWeatherEnabled && <WeatherWidget />}
      </div>
    </>
  );
};

export default Home;
