import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { createDrawerNavigator, DrawerContentScrollView, DrawerItem, DrawerItemList } from "@react-navigation/drawer"
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
      drawerContent={(props) => (

        <View style={{ flex: 1, backgroundColor: '#00B6A3' }}>
          <DrawerContentScrollView {...props}>
            <DrawerItemList {...props} />
          </DrawerContentScrollView>
          {/* Botão de Sair no final */}
          <DrawerItem
            label="Sair"
            labelStyle={{ color: '#fff' }}
            onPress={() => navigation.navigate('Login')}
            style={{ margin: 10, borderRadius: 15 }}
          />
        </View>
        
      )}
      screenOptions={{
        headerStyle: { backgroundColor: '#00B6A3' },
        headerTintColor: '#fff',
        drawerStyle: { backgroundColor: '#00B6A3' },
        drawerActiveBackgroundColor: '#008F80',
        drawerActiveTintColor: '#fff',
        drawerInactiveTintColor: '#fff',
        drawerItemStyle: { marginVertical: 5 },
      }}
    >
      <Drawer.Screen name="Home" component={Home} />
      <Drawer.Screen name="Profile" component={Profile} />
      <Drawer.Screen name="Chat" component={Chat} />
    </Drawer.Navigator>
  );
};

const Routes = () => {
  return (
    <AuthStack />
  );
};
export default Routes