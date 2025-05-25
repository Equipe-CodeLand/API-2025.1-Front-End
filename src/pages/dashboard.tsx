import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Dimensions,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { Acesso } from '../interface/Acesso';
import { BarChart } from 'react-native-chart-kit';

const Dashboard = () => {
  const [acessos, setAcessos] = useState<Acesso[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [periodo, setPeriodo] = useState<'7' | '30' | 'all'>('all');

  const screenWidth = Dimensions.get('window').width;

  const fetchAcessos = useCallback(async () => {
    try {
      if (!refreshing) setLoading(true);
      const response = await fetch('http://192.168.1.29:3000/acessos');
      const data = await response.json();
      setAcessos(data);
    } catch (error) {
      console.error('Erro ao buscar acessos:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [refreshing]);

  useEffect(() => {
    fetchAcessos();
  }, [fetchAcessos]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchAcessos();
  };

  // filtrar os acessos pelo período
  const acessosFiltrados = acessos.filter((acesso) => {
    if (periodo === 'all') return true;

    const dataAcesso = new Date(acesso.data_acesso.replace(' ', 'T'));

    const dataLimite = new Date();
    dataLimite.setDate(dataLimite.getDate() - Number(periodo));

    return dataAcesso >= dataLimite;
  });

  // Agrupar os acessos por agente_nome
  const acessosPorAgente: Record<string, number> = {};

  acessosFiltrados.forEach((acesso) => {
    const nomeAgente = acesso.agente_nome || 'Desconhecido';
    acessosPorAgente[nomeAgente] = (acessosPorAgente[nomeAgente] || 0) + 1;
  });

  const labels = Object.keys(acessosPorAgente);
  const data = Object.values(acessosPorAgente);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#00B6A3" />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={['#00B6A3']}
          tintColor="#00B6A3"
        />
      }
    >
      <Text style={styles.title}>Dashboard de Acessos</Text>

      {/* Filtro */}
      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={[
            styles.filterButton,
            periodo === '7' && styles.activeFilter,
          ]}
          onPress={() => setPeriodo('7')}
        >
          <Text style={styles.filterText}>Últimos 7 dias</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.filterButton,
            periodo === '30' && styles.activeFilter,
          ]}
          onPress={() => setPeriodo('30')}
        >
          <Text style={styles.filterText}>Últimos 30 dias</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.filterButton,
            periodo === 'all' && styles.activeFilter,
          ]}
          onPress={() => setPeriodo('all')}
        >
          <Text style={styles.filterText}>Todo Período</Text>
        </TouchableOpacity>
      </View>

      {/* Gráfico */}
      {labels.length > 0 ? (
        <BarChart
          data={{
            labels: labels,
            datasets: [
              {
                data: data,
              },
            ],
          }}
          width={screenWidth - 20}
          height={320}
          yAxisLabel=""
          yAxisSuffix=""
          fromZero
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
          verticalLabelRotation={labels.length > 4 ? 45 : 0}
        />
      ) : (
        <Text style={styles.noDataText}>Nenhum dado para este período.</Text>
      )}

      {/* Info */}
      <View style={styles.info}>
        <Text style={styles.infoText}>
          Total de Acessos no período selecionado: {acessosFiltrados.length}
        </Text>
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
  filterContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  filterButton: {
    backgroundColor: '#333',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  activeFilter: {
    backgroundColor: '#00B6A3',
  },
  filterText: {
    color: '#fff',
    fontSize: 14,
  },
  info: {
    marginTop: 20,
    alignItems: 'center',
  },
  infoText: {
    color: '#fff',
    fontSize: 18,
  },
  noDataText: {
    color: '#fff',
    fontSize: 16,
    alignSelf: 'center',
    marginVertical: 20,
  },
});
