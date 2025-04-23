import React, { useState, useEffect } from "react";
import { StyleSheet, Text, View, FlatList, TouchableOpacity, Alert, Modal, TextInput, Button } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import { API_URL } from '@env';
import Feather from "react-native-vector-icons/Feather";

const ListagemAgentes = () => {
    const [agentes, setAgentes] = useState<any[]>([]);
    const [modalVisible, setModalVisible] = useState(false);
    const [agenteEditando, setAgenteEditando] = useState<any>(null);
    const [formData, setFormData] = useState({
        setor: '',
        assunto: '',
        documento: ''
    });
    const navigation = useNavigation();

    const handleBuscarAgentes = async () => {
        try {
            const token = await AsyncStorage.getItem("userToken");

            if (!token) {
                console.error("Token não encontrado.");
                return;
            }

            const response = await fetch(`${API_URL}/agentes`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                throw new Error(`Erro ao buscar agentes: ${response.status}`);
            }

            const data = await response.json();
            setAgentes(data);
        } catch (err) {
            console.error("Erro ao buscar agentes", err);
        }
    };

    const abrirModalEdicao = (agente: any) => {
        setAgenteEditando(agente);
        setFormData({
            setor: agente.setor,
            assunto: agente.assunto,
            documento: agente.documento
        });
        setModalVisible(true);
    };

    const handleAtualizarAgente = async () => {
        try {
            const token = await AsyncStorage.getItem("userToken");
            
            if (!token) {
                console.error("Token não encontrado.");
                return;
            }

            const response = await fetch(`${API_URL}/agentes/${agenteEditando.id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                },
                body: JSON.stringify(formData),
            });

            if (!response.ok) {
                throw new Error(`Erro ao atualizar agente: ${response.status}`);
            }

            Alert.alert("Sucesso", "Agente atualizado com sucesso");
            setModalVisible(false);
            handleBuscarAgentes(); // Atualiza a lista
        } catch (err) {
            console.error("Erro ao atualizar agente", err);
            Alert.alert("Erro", "Não foi possível atualizar o agente");
        }
    };

    const handleDeletarAgente = async (agenteId: number) => {
        try {
            const token = await AsyncStorage.getItem("userToken");

            if (!token) {
                console.error("Token não encontrado.");
                return;
            }

            Alert.alert(
                "Confirmar Exclusão",
                "Tem certeza que deseja excluir este agente?",
                [
                    {
                        text: "Cancelar",
                        style: "cancel"
                    },
                    { 
                        text: "Excluir", 
                        onPress: async () => {
                            const response = await fetch(`${API_URL}/agentes/${agenteId}`, {
                                method: "DELETE",
                                headers: {
                                    "Content-Type": "application/json",
                                    "Authorization": `Bearer ${token}`,
                                },
                            });

                            if (!response.ok) {
                                throw new Error(`Erro ao deletar agente: ${response.status}`);
                            }

                            handleBuscarAgentes();
                            Alert.alert("Sucesso", "Agente excluído com sucesso");
                        }
                    }
                ]
            );
        } catch (err) {
            console.error("Erro ao deletar agente", err);
            Alert.alert("Erro", "Não foi possível excluir o agente");
        }
    };

    useEffect(() => {
        handleBuscarAgentes();
    }, []);

    return (
        <View style={styles.container}>
            <View style={styles.cabecalho}>
                <Text style={styles.titulo}>Painel de Agente</Text>
                <Text style={styles.comentario}>
                    Para restringir o acesso dos usuários aos agentes listados, clique no agente desejado.
                </Text>
            </View>

            <FlatList
                data={agentes}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                    <View style={styles.agente}>
                        <TouchableOpacity
                            style={styles.infoContainer}
                            onPress={() => navigation.navigate("Tela de permissões", { agenteId: item.id })}
                        >
                            <Text style={{ fontWeight: "bold" }}>{item.setor}</Text>
                            <Text>{item.assunto}</Text>
                        </TouchableOpacity>

                        <View style={styles.iconContainer}>
                            <TouchableOpacity onPress={() => abrirModalEdicao(item)}>
                                <Feather name="edit" size={20} color="#333" style={styles.icon} />
                            </TouchableOpacity>

                            <TouchableOpacity onPress={() => handleDeletarAgente(item.id)}>
                                <Feather name="trash-2" size={20} color="#cc0000" style={styles.icon} />
                            </TouchableOpacity>
                        </View>
                    </View>
                )}
            />

            {/* Modal de Edição */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => {
                    setModalVisible(false);
                }}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Editar Agente</Text>
                        
                        <Text style={styles.label}>Setor:</Text>
                        <TextInput
                            style={styles.input}
                            value={formData.setor}
                            onChangeText={(text) => setFormData({...formData, setor: text})}
                        />

                        <Text style={styles.label}>Assunto:</Text>
                        <TextInput
                            style={styles.input}
                            value={formData.assunto}
                            onChangeText={(text) => setFormData({...formData, assunto: text})}
                        />

                        <Text style={styles.label}>Documento:</Text>
                        <TextInput
                            style={styles.input}
                            value={formData.documento}
                            onChangeText={(text) => setFormData({...formData, documento: text})}
                        />

                        <View style={styles.modalButtons}>
                            <TouchableOpacity 
                                style={[styles.button, styles.cancelButton]}
                                onPress={() => setModalVisible(false)}
                            >
                                <Text style={styles.buttonText}>Cancelar</Text>
                            </TouchableOpacity>
                            
                            <TouchableOpacity 
                                style={[styles.button, styles.saveButton]}
                                onPress={handleAtualizarAgente}
                            >
                                <Text style={styles.buttonText}>Salvar</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "flex-start",
        alignItems: "center",
        backgroundColor: "#1A1A1A",
        paddingTop: 80,
    },
    cabecalho: {
        alignItems: "center",
        marginBottom: 64,
    },
    titulo: {
        fontSize: 30,
        fontWeight: "500",
        color: "#fff",
        textAlign: "center",
    },
    comentario: {
        marginTop: 20,
        color: "#7D7F85",
        padding: 16,
        paddingBottom: 0,
        width: 340,
        textAlign: "center",
        marginBottom: 0,
    },
    agente: {
        backgroundColor: "#fff",
        width: 300,
        minHeight: 70,
        marginBottom: 30,
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 8,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    infoContainer: {
        flex: 1,
        marginRight: 10,
    },
    iconContainer: {
        flexDirection: "row",
        alignItems: "center",
    },
    icon: {
        marginLeft: 12,
    },

    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    modalContent: {
        width: '90%',
        backgroundColor: 'white',
        padding: 20,
        borderRadius: 10,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
    },
    label: {
        fontSize: 16,
        marginBottom: 5,
        marginTop: 10,
    },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 5,
        padding: 10,
        fontSize: 16,
        marginBottom: 10,
    },
    modalButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 20,
    },
    button: {
        padding: 12,
        borderRadius: 5,
        width: '48%',
        alignItems: 'center',
    },
    cancelButton: {
        backgroundColor: '#e74c3c',
    },
    saveButton: {
        backgroundColor: '#2ecc71',
    },
    buttonText: {
        color: 'white',
        fontWeight: 'bold',
    },
});

export default ListagemAgentes;
