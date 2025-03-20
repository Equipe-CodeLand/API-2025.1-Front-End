import React from 'react';
import Login from './src/pages/login';
import Routes from './routes/routes';
import { StatusBar } from 'react-native';

const Index = () => {
  return (
    <>
      <StatusBar backgroundColor="#00B6A3" barStyle="light-content" />
      <Routes />
    </>
  );
}
export default Index