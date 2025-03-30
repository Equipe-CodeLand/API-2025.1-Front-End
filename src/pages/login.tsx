import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View, Alert } from "react-native";
import { useFonts, MontserratAlternates_400Regular, MontserratAlternates_800ExtraBold } from '@expo-google-fonts/montserrat-alternates';
import AppLoading from 'expo-app-loading';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';

const Login = () => {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const navigation = useNavigation();

  let [fontsLoaded] = useFonts({
    MontserratAlternates_400Regular,
    MontserratAlternates_800ExtraBold,
  });

  if (!fontsLoaded) {
    return <AppLoading />;
  }

  const handleLogin = async () => {
    try {
      const response = await fetch('http://192.168.0.178:3000/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email,
          senha: senha,
        }),
      });
  
      const data = await response.json();
      
      if (data.message === "Login bem-sucedido") {
        // Salvar o token e o role do usuário
        await AsyncStorage.setItem('userToken', data.token);
        await AsyncStorage.setItem('userRole', data.role);
  
        // Navegar para a tela HomeDrawer
        navigation.navigate('Home'); // Isso garante que o app navegue para a Home após o login
      } else {
        Alert.alert('Erro', 'Email ou senha inválidos');
      }
    } catch (error) {
      Alert.alert('Erro', 'Ocorreu um erro. Tente novamente.');
    }
  };  

  return (
    <View style={styles.container}>
      <View style={styles.cabecalho}>
        <Text style={styles.bemVindo}>Bem vindo ao</Text>
        <Text style={styles.titulo}>Pro4Tech</Text>
      </View>
      <TextInput 
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail} 
        placeholderTextColor="#939393"
      />
      <TextInput 
        style={styles.input}
        placeholder="Senha"
        value={senha}
        onChangeText={setSenha} 
        placeholderTextColor="#939393"
        secureTextEntry
      />
      <View style={styles.esqueceuSenha}><Text style={styles.esqueceuSenhaTexto}>Esqueci minha senha</Text></View>
      <TouchableOpacity style={styles.btn} onPress={handleLogin}>
        <Text style={styles.btnEntrar}>Entrar</Text>
      </TouchableOpacity>
    </View>
  );
};

export default Login;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#00B6A3',
    color: '#fff',
    marginTop: 0,
  },
  cabecalho: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: 40,
  },
  bemVindo: {
    fontSize: 25,
    fontFamily: 'MontserratAlternates_400Regular',
    textAlign: 'center',
    color: '#fff',
  },
  titulo: {
    fontSize: 40,
    fontFamily: "MontserratAlternates_800ExtraBold", 
    textAlign: 'center',
    color: '#fff',
  },
  input: {
    width: 228,
    margin: 21,
    borderRadius: 5,
    backgroundColor: '#FFF4F4',
    paddingLeft: 10,
    color: '#939393',
  },
  esqueceuSenha: {
    alignSelf: 'flex-start',
    marginLeft: 91, 
    color: '#FFF4F4',
  },
  esqueceuSenhaTexto: {
    fontSize: 13,
    color: '#FFF4F4',
    fontFamily: "Montserrat_400Regular", 
    marginBottom: 20,
  },
  btn: {
    backgroundColor: '#0B8D7F',
    width: 127,
    height: 31,
    borderRadius: 5,
    display: 'flex',
    justifyContent: 'center',
  },
  btnEntrar: {
    color: '#FFF4F4',
    width: 127,
    height: 31,
    borderRadius: 5,
    display: 'flex',
    justifyContent: 'center',
    textAlign: 'center',
    fontFamily: "Montserrat_500Medium", 
    paddingTop: 6,
  }
});
