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
import { BarChart, PieChart } from 'react-native-chart-kit';
import { API_URL } from '@env';

const Dashboard = () => {
  const [acessos, setAcessos] = useState<Acesso[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [periodo, setPeriodo] = useState<'7' | '30' | 'all'>('all');

  const screenWidth = Dimensions.get('window').width;

  const fetchAcessos = useCallback(async () => {
    try {
      if (!refreshing) setLoading(true);
      const response = await fetch(`${API_URL}/acessos`);
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

  // Filtrar os acessos pelo período
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

  // Calcular o Top 3 agentes mais ativos
  const top3Agentes = Object.entries(acessosPorAgente)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);

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

      <Text style={styles.title}>Distribuição dos Acessos</Text>

      {/* Gráfico de pizza */}
      <View style={styles.topContainer}>
        {labels.length > 0 ? (
          <PieChart
            data={labels.map((label, index) => ({
              name: label,
              population: data[index],
              color: `hsl(${index * 60}, 70%, 50%)`, // Gera cores variadas automaticamente
              legendFontColor: '#fff',
              legendFontSize: 14,
            }))}
            width={screenWidth - 20}
            height={220}
            chartConfig={{
              backgroundColor: '#1A1A1A',
              backgroundGradientFrom: '#1A1A1A',
              backgroundGradientTo: '#1A1A1A',
              color: (opacity = 1) => `rgba(0, 182, 163, ${opacity})`,
              labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
            }}
            accessor="population"
            backgroundColor="transparent"
            paddingLeft="15"
            center={[10, 0]}
            absolute
          />
        ) : (
          <Text style={styles.noDataText}>Nenhum dado para este período.</Text>
        )}
      </View>

      <Text style={styles.title}>Acessos por agente</Text>

      {/* Gráfico de barras */}
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
          height={360}
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

      {/* Top 3 Agentes */}
      <View style={styles.topContainer}>
        <Text style={styles.topTitle}>🏆 Top 3 Agentes Mais Ativos</Text>
        {top3Agentes.length > 0 ? (
          top3Agentes.map(([agente, count], index) => (
            <View key={agente} style={styles.topItem}>
              <Text style={styles.topPosition}>
                {index + 1}º - {agente}
              </Text>
              <Text style={styles.topCount}>{count} acessos</Text>
            </View>
          ))
        ) : (
          <Text style={styles.noDataText}>Sem dados neste período.</Text>
        )}
      </View>

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
    paddingTop: 40,
  },
  title: {
    color: '#fff',
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    marginTop: 20,
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
  topContainer: {
    backgroundColor: '#2A2A2A',
    borderRadius: 10,
    padding: 16,
    marginBottom: 60,
    marginTop: 20,
  },
  topTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    alignSelf: 'center',
  },
  topItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  topPosition: {
    color: '#fff',
    fontSize: 16,
  },
  topCount: {
    color: '#00B6A3',
    fontSize: 16,
    fontWeight: 'bold',
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
