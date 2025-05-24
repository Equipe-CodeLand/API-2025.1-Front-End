import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Dimensions, ScrollView } from 'react-native';
import { Acesso } from '../interface/Acesso';
import { BarChart } from 'react-native-chart-kit';

const Dashboard = () => {
  const [acessos, setAcessos] = useState<Acesso[]>([]);
  const [loading, setLoading] = useState(true);

  const screenWidth = Dimensions.get('window').width;

  useEffect(() => {
    const fetchAcessos = async () => {
      try {
        const response = await fetch('http://192.168.1.24:3000/acessos');
        const data = await response.json();
        setAcessos(data);
      } catch (error) {
        console.error('Erro ao buscar acessos:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAcessos();
  }, []);

  const totalAcessos = acessos.length;

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#00B6A3" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Dashboard de Acessos</Text>

      <BarChart
        data={{
          labels: ['Agentes'],
          datasets: [
            {
              data: [totalAcessos],
            },
          ],
        }}
        width={screenWidth - 20}
        height={320}
        yAxisLabel=""
        yAxisSuffix=""
        chartConfig={{
          backgroundColor: '#1A1A1A',
          backgroundGradientFrom: '#1A1A1A',
          backgroundGradientTo: '#1A1A1A',
          decimalPlaces: 0,
          color: (opacity = 1) => `rgba(0, 182, 163, ${opacity})`,
          labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
          style: {
            borderRadius: 16,
          },
        }}
        verticalLabelRotation={0}
      />

      <View style={styles.info}>
        <Text style={styles.infoText}>Total de Acessos: {totalAcessos}</Text>
      </View>
    </ScrollView>
  );
};

export default Dashboard;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1A1A1A',
    padding: 10,
  },
  title: {
    color: '#fff',
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    alignSelf: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1A1A1A',
  },
  info: {
    marginTop: 20,
    alignItems: 'center',
  },
  infoText: {
    color: '#fff',
    fontSize: 18,
  },
});
