import React, { useEffect, useState } from 'react';
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { API_URL } from '@env';
import 'react-native-get-random-values';
import { v4 as uuidv4 } from 'uuid';

interface Agente {
  id: number;
  setor: string;
  assunto: string;
}

interface Message {
  id: number;
  text: string;
  sender: 'user' | 'bot';
}

const Chat = () => {
  const [agentes, setAgentes] = useState<Agente[]>([]);
  const [agenteSelecionado, setAgenteSelecionado] = useState<Agente | null>(null);
  const [chatId, setChatId] = useState<string | null>(null);
  const [isLoadingAgentes, setIsLoadingAgentes] = useState(true);
  const [usuario_id, setUsuario_id] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    { id: 0, text: 'Olá! Como posso ajudar?', sender: 'bot' }
  ]);
  const [loading, setLoading] = useState(false);

  const handleBuscarAgentes = async () => {
    try {
      setIsLoadingAgentes(true);
      const token = await AsyncStorage.getItem("userToken");

      if (!token) {
        console.error("Token não encontrado.");
        return;
      }

      const response = await fetch(`${API_URL}/usuarios/buscar/agentes`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
      });

      const data = await response.json();
      setAgentes(data);
    } catch (err) {
      console.error("Erro ao buscar usuários", err);
    } finally {
      setIsLoadingAgentes(false);
    }
  };

  const sendMessage = async () => {
    if (input.trim() === '') return;

    const userMessage: Message = {
      id: messages.length + 1,
      text: input,
      sender: 'user'
    };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    const token = await AsyncStorage.getItem("userToken");

    if (!token) {
      console.error("Token não encontrado.");
      return;
    }

    try {
      const response = await fetch(`${API_URL}/mensagens`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          question: input,
          chat_id: chatId,
          usuario_id: usuario_id,
          agente_id: agenteSelecionado?.id
        })
      });

      const data = await response.json();

      const botResponse: Message = {
        id: messages.length + 2,
        text: data.response,
        sender: 'bot'
      };
      setMessages(prev => [...prev, botResponse]);

    } catch (error) {
      console.error('Erro ao se comunicar com o backend:', error);
      const errorMessage: Message = {
        id: messages.length + 2,
        text: 'Desculpe, ocorreu um erro ao processar sua mensagem.',
        sender: 'bot'
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setIsRefreshing(true);
    try {
      await handleBuscarAgentes();
    } catch (error) {
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    handleBuscarAgentes();
  }, []);

  if (!chatId) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Selecione um agente para iniciar o chat:</Text>
        {isLoadingAgentes ? (
          <ActivityIndicator size="large" color="#00B6A3" />
        ) : (
          <FlatList
            data={agentes}
            keyExtractor={(item) => item.id.toString()}
            refreshControl={
              <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />
            }
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.agenteCard}
                onPress={() => {
                  const novoChatId = uuidv4();
                  setChatId(novoChatId);
                  setAgenteSelecionado(item);
                }}
              >
                <Text style={styles.agenteText}>Setor: {item.setor}</Text>
                <Text style={styles.agenteText}>Assunto: {item.assunto}</Text>
              </TouchableOpacity>
            )}
            contentContainerStyle={{ padding: 10 }}
          />
        )}
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={80} // ajuste conforme necessário
      >
        <FlatList
          data={messages}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <View style={[
              styles.messageContainer,
              item.sender === 'user' ? styles.userMessage : styles.botMessage
            ]}>
              <Text style={styles.messageText}>{item.text}</Text>
            </View>
          )}
          contentContainerStyle={styles.messagesList}
          inverted={false}
        />

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Digite sua mensagem..."
            placeholderTextColor="#888"
            value={input}
            onChangeText={setInput}
            editable={!loading}
          />

          <TouchableOpacity
            style={styles.sendButton}
            onPress={sendMessage}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.sendButtonText}>Enviar</Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default Chat;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1A1A1A'
  },
  title: {
    color: '#fff',
    fontSize: 18,
    padding: 16,
    fontWeight: 'bold'
  },
  agenteCard: {
    backgroundColor: '#333',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  agenteText: {
    color: '#fff',
    fontSize: 16,
  },
  messagesList: {
    flexGrow: 1,
    padding: 10,
  },
  messageContainer: {
    padding: 10,
    borderRadius: 10,
    marginVertical: 5,
    maxWidth: '80%',
  },
  userMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#007AFF',
  },
  botMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#333',
  },
  messageText: {
    color: '#fff',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 10,
    borderTopWidth: 1,
    borderColor: '#444',
    alignItems: 'center',
    backgroundColor: '#222',
  },
  input: {
    flex: 1,
    backgroundColor: '#333',
    color: '#fff',
    padding: 10,
    borderRadius: 5,
  },
  sendButton: {
    backgroundColor: '#00B6A3',
    padding: 10,
    marginLeft: 10,
    borderRadius: 5,
  },
  sendButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
