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
import Feather from 'react-native-vector-icons/Feather';

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

interface MensagemHistorico {
  id: string;
  usuario_id: number;
  agente_id: number | null;
  texto: string;
  data: string;
}

interface HistoricoChat {
  _id: string;
  id: string;
  usuario_id: number;
  agente_id: number;
  data_criacao: string;
  titulo: string;
  mensagens: MensagemHistorico[];
}

const Chat = () => {
  const [agentes, setAgentes] = useState<Agente[]>([]);
  const [agenteSelecionado, setAgenteSelecionado] = useState<Agente | null>(null);
  const [chatId, setChatId] = useState<string | null>(null);
  const [isLoadingAgentes, setIsLoadingAgentes] = useState(true);
  const [usuario_id, setUsuario_id] = useState<number | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [historico, setHistorico] = useState<HistoricoChat[]>([]);
  const [isLoadingHistorico, setIsLoadingHistorico] = useState(false);
  const [agentesCompletos, setAgentesCompletos] = useState<Agente[]>([]);

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

      const response = await fetch(`http://192.168.0.178:3000/usuarios/buscar/agentes`, {
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

  const handleBuscarTodosAgentes = async () => {
    try {
      const token = await AsyncStorage.getItem("userToken");

      if (!token) {
        console.error("Token não encontrado.");
        return;
      }

      const response = await fetch(`http://192.168.0.178:3000/agentes`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
      });

      const data = await response.json();
      setAgentesCompletos(data);
      console.log("Todos os agentes carregados:", data);
    } catch (err) {
      console.error("Erro ao buscar todos os agentes", err);
    }
  };

  const handleBuscarHistorico = async (usuarioId?: number) => {
    try {
      setIsLoadingHistorico(true);
      const token = await AsyncStorage.getItem("userToken");
      const id = usuarioId || usuario_id;

      console.log("Buscando histórico para usuario_id:", id);

      if (!token || !id) {
        console.error("Token ou usuário_id não encontrado.", { token: !!token, id });
        return;
      }

      const response = await fetch(`http://192.168.0.178:3000/historico/chat?usuario_id=${id}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setHistorico(data);
      console.log("Histórico carregado:", data);
    } catch (err) {
      console.error("Erro ao buscar histórico", err);
    } finally {
      setIsLoadingHistorico(false);
    }
  };

  const encontrarAgentePorId = (agenteId: number): Agente | null => {
    return agentesCompletos.find(agente => agente.id === agenteId) || null;
  };

  const carregarMensagensHistorico = (historicoChat: HistoricoChat) => {
    const mensagensFormatadas: Message[] = [
      { id: 0, text: 'Olá! Como posso ajudar?', sender: 'bot' }
    ];

    historicoChat.mensagens.forEach((mensagem, index) => {

      const isUserMessage = mensagem.agente_id === null;

      mensagensFormatadas.push({
        id: index + 1,
        text: mensagem.texto,
        sender: isUserMessage ? 'user' : 'bot'
      });
    });

    setMessages(mensagensFormatadas);
  };

  const abrirChatHistorico = (historicoItem: HistoricoChat) => {
    const agenteCompleto = encontrarAgentePorId(historicoItem.agente_id);

    setChatId(historicoItem.id);
    setAgenteSelecionado(agenteCompleto || {
      id: historicoItem.agente_id,
      setor: "Carregando...",
      assunto: historicoItem.titulo || "Chat anterior"
    });

    carregarMensagensHistorico(historicoItem);

  };

  useEffect(() => {
    const inicializar = async () => {
      try {
        const allKeys = await AsyncStorage.getAllKeys();
        console.log("Todas as chaves no AsyncStorage:", allKeys);

        const token = await AsyncStorage.getItem("userToken");
        if (token) {
          try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            console.log("Payload do token:", payload);

            const possibleIds = ['id', 'userId', 'user_id', 'sub', 'uid'];
            let userId = null;

            for (const field of possibleIds) {
              if (payload[field]) {
                userId = payload[field];
                console.log(`Usuario ID encontrado no token (${field}):`, userId);
                break;
              }
            }

            if (userId) {
              setUsuario_id(userId);
              console.log("Usuario ID definido:", userId);

              await handleBuscarAgentes();
              await handleBuscarTodosAgentes();
              await handleBuscarHistorico(userId);

              console.log("Carregamento concluído!");
            } else {
              console.error("ID do usuário não encontrado no token");

              await handleBuscarAgentes();
              await handleBuscarTodosAgentes();
            }
          } catch (tokenError) {
            console.error("Erro ao decodificar token:", tokenError);
            await handleBuscarAgentes();
            await handleBuscarTodosAgentes();
          }
        } else {
          console.error("Token não encontrado");
          await handleBuscarAgentes();
          await handleBuscarTodosAgentes();
        }
      } catch (error) {
        console.error("Erro ao inicializar:", error);
      }
    };

    inicializar();
  }, []);

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
      const response = await fetch(`http://192.168.0.178:3000/mensagens`, {
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

  const deletarChat = async (chatId: string) => {
    try {
      const token = await AsyncStorage.getItem("userToken");

      if (!token) {
        console.error("Token não encontrado.");
        return;
      }

      console.log("Tentando deletar chat com ID:", chatId);
      // CORREÇÃO: Remova o /historico/ da URL
      console.log("URL da requisição:", `http://192.168.0.178:3000/chats/${chatId}`);

      const response = await fetch(`http://192.168.0.178:3000/chats/${chatId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
      });

      console.log("Status da resposta:", response.status);
      console.log("Response OK:", response.ok);

      if (response.ok) {
        const responseData = await response.json();
        console.log("Resposta do servidor:", responseData);

        // Atualizar o histórico removendo o chat deletado
        setHistorico(prev => prev.filter(chat => chat._id !== chatId));
        console.log("Chat deletado com sucesso do estado local");

        // Opcional: Mostrar mensagem de sucesso
        alert("Chat deletado com sucesso!");
      } else {
        const errorData = await response.text();
        console.error("Erro ao deletar chat - Status:", response.status);
        console.error("Erro ao deletar chat - Resposta:", errorData);
        alert(`Erro ao deletar chat: ${response.status} - ${errorData}`);
      }
    } catch (error) {
      console.error("Erro ao deletar chat:", error);
      alert(`Erro ao deletar chat: ${error.message}`);
    }
  };

  // Função para limpar todo o histórico
  const limparHistorico = async () => {
    try {
      const token = await AsyncStorage.getItem("userToken");

      if (!token || !usuario_id) {
        console.error("Token ou usuário_id não encontrado.");
        return;
      }

      console.log("Iniciando limpeza do histórico...");
      console.log("Número de chats para deletar:", historico.length);

      // CORREÇÃO: Use a URL correta (sem /historico/)
      const promises = historico.map(chat => {
        console.log(`Deletando chat: ${chat._id}`);
        return fetch(`http://192.168.0.178:3000/chats/${chat._id}`, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
          },
        });
      });

      await Promise.all(promises);

      // Limpar o histórico local
      setHistorico([]);
      console.log("Histórico limpo com sucesso");
      alert("Histórico limpo com sucesso!");

    } catch (error) {
      console.error("Erro ao limpar histórico:", error);
      alert(`Erro ao limpar histórico: ${error.message}`);
    }
  };


  const onRefresh = async () => {
    setIsRefreshing(true);
    try {
      await handleBuscarAgentes();
      await handleBuscarTodosAgentes();
      await handleBuscarHistorico();
    } catch (error) {
      console.error(error);
    } finally {
      setIsRefreshing(false);
    }
  };


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
            ListFooterComponent={
              <>
                <Text style={[styles.title, { marginTop: 20 }]}>
                  Histórico de Chats:
                </Text>

                {isLoadingHistorico ? (
                  <ActivityIndicator size="large" color="#00B6A3" />
                ) : historico.length === 0 ? (
                  <Text style={{ color: '#aaa', padding: 10 }}>
                    Nenhum histórico encontrado.
                  </Text>
                ) : (
                  <>
                    <FlatList
                      data={historico}
                      keyExtractor={(item) => item.id}
                      renderItem={({ item }) => {
                        const agenteCompleto = encontrarAgentePorId(item.agente_id);

                        return (
                          <View style={styles.historicoCardContainer}>
                            <View style={styles.agenteCard}>
                              <TouchableOpacity
                                style={styles.deleteIcon}
                                onPress={() => deletarChat(item._id)}
                              >
                                <Feather name="trash-2" size={24} color="#fff" />
                              </TouchableOpacity>

                              <TouchableOpacity
                                style={{ flex: 1 }}
                                onPress={() => abrirChatHistorico(item)}
                              >
                                <Text style={[styles.agenteText, { fontSize: 16, fontWeight: 'bold' }]}>
                                  {agenteCompleto?.assunto || item.titulo || "Assunto não disponível"}
                                </Text>
                                <Text style={styles.agenteText}>
                                  Agente: {agenteCompleto?.setor || "Carregando..."}
                                </Text>
                                <Text style={styles.agenteText}>
                                  Data: {new Date(item.data_criacao).toLocaleDateString()}
                                </Text>
                              </TouchableOpacity>
                            </View>
                          </View>
                        );

                      }}
                    />

                    {historico.length > 0 && (
                      <TouchableOpacity
                        style={styles.clearHistoryButton}
                        onPress={limparHistorico}
                      >
                        <Text style={styles.clearHistoryButtonText}>Limpar Histórico</Text>
                      </TouchableOpacity>
                    )}
                  </>
                )}
              </>
            }
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
  emptyText: {
    color: '#aaa',
    textAlign: 'center',
    marginTop: 10,
  },
  clearHistoryButton: {
    backgroundColor: '#0B8D7F',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginTop: 15,
    alignItems: 'center',
    marginHorizontal: 10,
  },

  clearHistoryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  historicoCardContainer: {
    marginBottom: 10,
  },

  agenteCard: {
    backgroundColor: '#333',
    padding: 15,
    borderRadius: 10,
    position: 'relative',
    marginBottom: 10
  },
  deleteIcon: {
    position: 'absolute',
    top: 16,
    right: 16,
    zIndex: 1,
  },

});