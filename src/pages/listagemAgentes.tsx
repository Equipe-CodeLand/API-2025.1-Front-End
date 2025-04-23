import { useState, useEffect } from "react";
import { StyleSheet, Text, View, FlatList, TouchableOpacity } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import { API_URL } from '@env';
import Feather from "react-native-vector-icons/Feather";

const ListagemAgentes = () => {
    const [agentes, setAgentes] = useState<any[]>([]);
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
                            <TouchableOpacity onPress={() => console.log("Editar", item.id)}>
                                <Feather name="edit" size={20} color="#333" style={styles.icon} />
                            </TouchableOpacity>

                            <TouchableOpacity onPress={() => console.log("Deletar", item.id)}>
                                <Feather name="trash-2" size={20} color="#cc0000" style={styles.icon} />
                            </TouchableOpacity>
                        </View>
                    </View>
                )}
            />
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
});

export default ListagemAgentes;
