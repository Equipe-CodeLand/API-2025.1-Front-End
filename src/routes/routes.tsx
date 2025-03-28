import React, { useState, useEffect } from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { createDrawerNavigator, DrawerContentScrollView, DrawerItem, DrawerItemList } from "@react-navigation/drawer"
import { View } from 'react-native';
import Login from '../pages/login';
import Home from '../pages/home';
import Profile from '../pages/profile';
import Chat from '../pages/chat';
import CadastroAgentes from '../pages/cadastroAgente';
import AsyncStorage from '@react-native-async-storage/async-storage';

const Stack = createStackNavigator();
const Drawer = createDrawerNavigator();

const AuthStack = () => {
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    const loadUserRole = async () => {
      const role = await AsyncStorage.getItem('userRole');
      setUserRole(role);
    };
    loadUserRole();
  }, []);

  if (userRole === null) {
    return (
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Login" component={Login} />
      </Stack.Navigator>
    );
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={Login} />
      <Stack.Screen name="HomeDrawer" component={DrawerNavigator} />
    </Stack.Navigator>
  );
};

// Drawer para a navegação dentro do app
const DrawerNavigator = ({ navigation }: any) => {
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    const loadUserRole = async () => {
      const role = await AsyncStorage.getItem('userRole');
      setUserRole(role); // Salva o role do usuário no estado
    };

    loadUserRole();
  }, []);

  return (
    <Drawer.Navigator
      initialRouteName="Home"
      drawerContent={(props) => (
        <View style={{ flex: 1, backgroundColor: '#00B6A3' }}>
          <DrawerContentScrollView {...props}>
            <DrawerItemList {...props} />
          </DrawerContentScrollView>
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
      {userRole === 'admin' && ( // Se o usuário for admin, exibe a tela de cadastro
        <Drawer.Screen name="Cadastro de Agente" component={CadastroAgentes} />
      )}
    </Drawer.Navigator>
  );
};

const Routes = () => {
  return (
    <AuthStack />
  );
};

export default Routes;
