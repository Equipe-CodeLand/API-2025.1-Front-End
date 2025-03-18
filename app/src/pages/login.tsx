import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, View } from "react-native";
import { useFonts, MontserratAlternates_400Regular, MontserratAlternates_800ExtraBold } from '@expo-google-fonts/montserrat-alternates';
import AppLoading from 'expo-app-loading';
import * as Linking from 'expo-linking';
import {
    Montserrat_400Regular,
    Montserrat_500Medium,
    Montserrat_600SemiBold,
  } from '@expo-google-fonts/montserrat';

export default function Login() {
    const [email, setEmail] = useState('');
    const [senha, setSenha] = useState('');

    let [fontsLoaded] = useFonts({
        MontserratAlternates_400Regular,
        MontserratAlternates_800ExtraBold,
        Montserrat_600SemiBold,
        Montserrat_400Regular,
        Montserrat_500Medium,
    });

    if (!fontsLoaded) {
        return <AppLoading />;
    }

    return (
        <View className="container" style={styles.container}>
            <View style={styles.cabecalho}>
                <View><Text style={styles.bemVindo}>Bem vindo ao</Text></View>
                <View><Text style={styles.titulo}>Pro4Tech</Text></View>
            </View>
            <TextInput 
                style={styles.input}
                placeholder="Email"
                value={email}
                onChangeText={setEmail} 
            />
            <TextInput 
                style={styles.input}
                placeholder="Senha"
                value={senha}
                onChangeText={setSenha} 
            />
            <View style={styles.esqueceuSenha}><Text style={styles.esqueceuSenhaTexto}>Esqueci minha senha</Text></View>
            <View style={styles.btn}><Text style={styles.btnEntrar}>Entrar</Text></View>
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
        width: 188,
        height: 24,
        margin: 21,
        borderRadius: 5,
        backgroundColor: '#FFF4F4',
        paddingLeft: 10,
        color: '#939393',
    },
    esqueceuSenha: {
        alignSelf: 'flex-start',
        marginLeft: 113, 
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
        verticalAlign: 'middle',
        fontFamily: "Montserrat_500Medium", 
        paddingTop: 6,
    }
});