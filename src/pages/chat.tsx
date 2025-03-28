import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet
} from 'react-native';
import { Message } from '../interface/Message';

const Chat = () => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    { id: 0, text: 'Olá! Como posso ajudar?', sender: 'bot' }
  ]);

  const sendMessage = () => {
    if (input.trim() === '') return;

    const newMessage: Message = { id: messages.length, text: input, sender: 'user' };
    setMessages([...messages, newMessage]);
    setInput('');

    setTimeout(() => {
      const botResponse: Message = { id: messages.length + 1, text: 'Certo! O que você precisa?', sender: 'bot' };
      setMessages(prevMessages => [...prevMessages, botResponse]);
    }, 1000);
  };

  return (
    <View
      style={styles.container} 
    >
      {/* Mensagens */}
      <FlatList
        data={messages}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={[styles.messageContainer, item.sender === 'user' ? styles.userMessage : styles.botMessage]}>
            <Text style={styles.messageText}>{item.text}</Text>
          </View>
        )}
        contentContainerStyle={styles.messagesList}
      />

      {/* Campo de Entrada */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Digite sua mensagem..."
          placeholderTextColor="#888"
          value={input}
          onChangeText={setInput}
        />
        <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
          <Text style={styles.sendButtonText}>Enviar</Text>
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
  header: {
    backgroundColor: '#00B6A3',
    padding: 20,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
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