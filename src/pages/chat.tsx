import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  ActivityIndicator
} from 'react-native';
import { Message } from '../interface/Message';

const Chat = () => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    { id: 0, text: 'Olá! Como posso ajudar?', sender: 'bot' }
  ]);
  const [loading, setLoading] = useState(false);


   const sendMessage = async () => {
    if (input.trim() === '') return;

    // Adiciona mensagem do usuário
    const userMessage: Message = { 
      id: messages.length + 1, 
      text: input, 
      sender: 'user' 
    };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      // Enviar a mensagem para o backend FastAPI
      const response = await fetch('http://127.0.0.1:8000/chat/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ question: input })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      // Adiciona resposta do bot
      const botResponse: Message = { 
        id: messages.length + 2, 
        text: data.response, 
        sender: 'bot' 
      };
      setMessages(prev => [...prev, botResponse]);
      
    } catch (error) {
      console.error('Erro ao se comunicar com o backend:', error);
      // Adiciona mensagem de erro
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

  return (
    <View style={styles.container}>
      {/* Mensagens */}
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

      {/* Campo de Entrada */}
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
    </View>
  );
};


export default Chat;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1A1A1A'
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