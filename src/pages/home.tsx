import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const Home = () => {

    return (
        <View style={styles.container}>
            <Text style={styles.text}>
               Bem-vindo!
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
