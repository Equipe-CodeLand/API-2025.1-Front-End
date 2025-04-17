import { useState, useEffect } from "react";
import { StyleSheet, Text, View, FlatList, TouchableOpacity } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";

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

            const response = await fetch("http://192.168.0.178:3000/agentes", {
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
                    <TouchableOpacity
                        style={styles.agente}
                        onPress={() => navigation.navigate("Tela de permissões", { agenteId: item.id })}
                    >
                        <Text style={{ fontWeight: "bold" }}>{item.setor}</Text>
                        <Text>{item.assunto}</Text>
                    </TouchableOpacity>
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
        height: 70,
        marginBottom: 30,
        padding: 16,
        borderRadius: 8,
        marginTop: 0,
    },
});

export default ListagemAgentes;
