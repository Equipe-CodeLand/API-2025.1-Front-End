import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { createDrawerNavigator } from "@react-navigation/drawer"
import Login from '../src/pages/login';
import Home from '../src/pages/home';
import Profile from '../src/pages/profile';
import { View } from 'react-native';
import Chat from '../src/pages/chat';

const Stack = createStackNavigator();
const Drawer = createDrawerNavigator();

const AuthStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={Login} />
      <Stack.Screen name="HomeDrawer" component={DrawerNavigator} />
    </Stack.Navigator>
  );
};

// Drawer para a navegação dentro do app
const DrawerNavigator = ({ navigation }: any) => {
  return (
    <Drawer.Navigator
      initialRouteName="Home"
      screenOptions={{
        headerStyle: { backgroundColor: '#00B6A3' },
        headerTintColor: '#fff', 
        headerTitleStyle: { fontSize: 18, fontWeight: 'bold' }, 
      }}
    >
      <Drawer.Screen name="Home" component={Home} />
      <Drawer.Screen name="Profile" component={Profile} />
      <Drawer.Screen name="Chat" component={Chat} />
      <Drawer.Screen
        name="Sair"
        component={() => {
          navigation.navigate('Login');
          return <View />;
        }}
        options={{ drawerLabel: "Sair" }}
      />
    </Drawer.Navigator>
  );
};

const Routes = () => {
  return (
    <AuthStack />
  );
};
export default Routes