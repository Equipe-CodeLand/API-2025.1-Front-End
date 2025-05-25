import React, { useState, useEffect } from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { createDrawerNavigator, DrawerContentScrollView, DrawerItem, DrawerItemList } from "@react-navigation/drawer"
import { View } from 'react-native';
import Login from '../pages/login';
import Home from '../pages/home';
import Chat from '../pages/chat';
import CadastroAgentes from '../pages/cadastroAgente';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ListagemAgentes from '../pages/listagemAgentes';
import ListagemUsuarios from '../pages/listagemUsuario';
import PermissaoUsuarioPainel from '../pages/permissaoUsuarios';
import CadastroUsuario from '../pages/cadastroUsuario';
import Dashboard from '../pages/dashboard';

const Stack = createStackNavigator();
const Drawer = createDrawerNavigator();

const DrawerNavigator = ({ navigation }: any) => {
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    const loadUserRole = async () => {
      const role = await AsyncStorage.getItem('userRole');
      setUserRole(role); 
    };

    loadUserRole();
  }, []);

  return (
    <Drawer.Navigator
      initialRouteName="Home"
      drawerContent={(props) => (
        <View style={{ flex: 1 }}>
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
        drawerActiveTintColor: '#fff',
        drawerInactiveTintColor: '#fff',
        drawerActiveBackgroundColor: 'transparent',
        drawerItemStyle: { marginVertical: 5 },
      }}
    >
      <Drawer.Screen name="Home" component={Home} />
      <Drawer.Screen name="Chat" component={Chat} />
      {userRole === 'admin' && ( 
        <>
          <Drawer.Screen name="Cadastro de Agente" component={CadastroAgentes} />
          <Drawer.Screen name="Painel de Agentes" component={ListagemAgentes} />
          <Drawer.Screen name="Cadastro de Usuário" component={CadastroUsuario} />
          <Drawer.Screen name="Painel de Usuários" component={ListagemUsuarios} />
          <Drawer.Screen name="Dashboard" component={Dashboard} />
          <Drawer.Screen
            name="Tela de permissões"
            component={PermissaoUsuarioPainel}
            options={{
              drawerItemStyle: { display: 'none' },
            }}
          />
        </>
      )}
    </Drawer.Navigator>
  );
};

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
      <Stack.Screen name="Home" component={DrawerNavigator} />
    </Stack.Navigator>
  );
};

const Routes = () => {
  return (
    <AuthStack />
  );
};

export default Routes;