import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '@env';
import { useNavigation } from 'expo-router';

const Home = () => {
    const [usuario, setUsuario] = useState<{ nome: string, email: string } | null>(null);
    const [loading, setLoading] = useState(true);
    const navigation = useNavigation();

    useEffect(() => {
        const fetchPerfil = async () => {
            try {
                const token = await AsyncStorage.getItem('userToken');
                if (!token) return;

                const response = await fetch(`${API_URL}/usuarios/perfil`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                const data = await response.json();

                if (response.ok) {
                    setUsuario(data.data);
                } else {
                    console.log('Erro ao buscar perfil:', data.message);
                }
            } catch (error) {
                console.log('Erro:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchPerfil();
    }, [navigation]);

    if (loading) {
        return (
            <View style={styles.container}>
                <ActivityIndicator size="large" color="#00B6A3" />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Text style={styles.text}>
                {usuario ? `Bem-vindo, ${usuario.nome}!` : 'Bem-vindo à Home!'}
            </Text>
        </View>
    );
};

export default Home;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#1A1A1A',
    },
    text: {
        fontSize: 20,
        fontWeight: 'bold',
        color: "#fff",
    }
});
