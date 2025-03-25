import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, View, TouchableOpacity, Alert } from "react-native";
import { useFonts, MontserratAlternates_400Regular, MontserratAlternates_800ExtraBold } from '@expo-google-fonts/montserrat-alternates';
import AppLoading from 'expo-app-loading';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';import * as Linking from 'expo-linking';
import {
    Montserrat_400Regular,
    Montserrat_500Medium,
    Montserrat_600SemiBold,
} from '@expo-google-fonts/montserrat';

// Defina os tipos das suas rotas
type RootStackParamList = {
    Login: undefined;
    HomeDrawer: undefined;
    // Adicione outras rotas aqui se necessário
  };
  
  // Crie o tipo para a navegação
  type LoginScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Login'>;

export default function Login() {
    const [email, setEmail] = useState('');
    const [senha, setSenha] = useState('');
    const [loading, setLoading] = useState(false);
    const navigation = useNavigation<LoginScreenNavigationProp>();

    let [fontsLoaded] = useFonts({
        MontserratAlternates_400Regular,
        MontserratAlternates_800ExtraBold,
        Montserrat_600SemiBold,
        Montserrat_400Regular,
        Montserrat_500Medium,
    });

    const handleLogin = async () => {
        if (!email || !senha) {
            Alert.alert('Erro', 'Por favor, preencha todos os campos');
            return;
        }

        setLoading(true);
        
        try {
            const response = await fetch(`http://localhost:3000/api/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, senha })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Erro ao fazer login');
            }

            // Navegação corrigida com tipos
            navigation.navigate('HomeDrawer');

        } catch (error) {
            // Tratamento de erro tipado
            const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
            Alert.alert('Erro', errorMessage);
        } finally {
            setLoading(false);
        }
    };

    if (!fontsLoaded) {
        return <AppLoading />;
    }

    return (
        <View style={styles.container}>
            <View style={styles.cabecalho}>
                <View><Text style={styles.bemVindo}>Bem vindo ao</Text></View>
                <View><Text style={styles.titulo}>Pro4Tech</Text></View>
            </View>
            <TextInput 
                style={styles.input}
                placeholder="Email"
                value={email}
                onChangeText={setEmail} 
                placeholderTextColor="#939393"
                keyboardType="email-address"
                autoCapitalize="none"
            />
            <TextInput 
                style={styles.input}
                placeholder="Senha"
                value={senha}
                onChangeText={setSenha} 
                placeholderTextColor="#939393"
                secureTextEntry={true}
            />
            <TouchableOpacity onPress={() => Linking.openURL('mailto:suporte@pro4tech.com')}>
                <View style={styles.esqueceuSenha}>
                    <Text style={styles.esqueceuSenhaTexto}>Esqueci minha senha</Text>
                </View>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleLogin} disabled={loading}>
                <View style={styles.btn}>
                    <Text style={styles.btnEntrar}>
                        {loading ? 'Carregando...' : 'Entrar'}
                    </Text>
                </View>
            </TouchableOpacity>
        </View>
    );
}

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