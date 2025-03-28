import React from 'react';
import { StatusBar } from 'react-native';
import Routes from '../src/routes/routes';

const Index = () => {
  return (
    <>
      <StatusBar backgroundColor="#00B6A3" barStyle="light-content" />
      <Routes />
    </>
  );
}
export default Index