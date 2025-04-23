import { useState, useEffect } from "react";
import { StyleSheet, Text, View, FlatList, TouchableOpacity, TextInput, Pressable } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";
import { useFonts, Montserrat_400Regular, Montserrat_500Medium } from '@expo-google-fonts/montserrat';
import AppLoading from 'expo-app-loading';
import { RefreshControl } from "react-native";
import { useFocusEffect } from '@react-navigation/native';
import { useCallback } from 'react';
import { API_URL } from '@env'; // <- aqui a mágica acontece

const ListagemUsuarios = () => {
    const [usuarios, setUsuarios] = useState<any[]>([]);
    const [dropdownAberto, setDropdownAberto] = useState<number | null>(null);
    const [mostrarSenhaId, setMostrarSenhaId] = useState<number | null>(null);
    const [isRefreshing, setIsRefreshing] = useState(false);

    let [fontsLoaded] = useFonts({
        Montserrat_400Regular,
        Montserrat_500Medium,
    });

    const onRefresh = async () => {
        setIsRefreshing(true);
        try {
            await handleBuscarUsuarios(); // já faz o fetch certinho
        } catch (error) {
            console.log(`Erro ao buscar usuários: ${error}`);
        } finally {
            setIsRefreshing(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            handleBuscarUsuarios();
        }, [])
    );    

    const handleToggleStatus = async (id: number, statusAtual: boolean) => {
        try {
            const token = await AsyncStorage.getItem("userToken");

            const response = await fetch(`${API_URL}/usuarios/${id}/status`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                },
                body: JSON.stringify({ ativo: !statusAtual }),
            });

            const result = await response.json();

            if (result.success) {
                alert(result.message);
                handleBuscarUsuarios(); // atualiza a lista
            } else {
                alert("Erro: " + result.message);
            }
        } catch (error) {
            console.error("Erro ao atualizar status do usuário:", error);
            alert("Erro ao atualizar status.");
        }
    };

    
    const handleBuscarUsuarios = async () => {
        try {
            const token = await AsyncStorage.getItem("userToken");

            if (!token) {
                console.error("Token não encontrado.");
                return;
            }

            const response = await fetch(`${API_URL}/usuarios`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                },
            });

            const data = await response.json();
            setUsuarios(data);
        } catch (err) {
            console.error("Erro ao buscar usuários", err);
        }
    };

    useEffect(() => {
        handleBuscarUsuarios();
    }, []);

    const toggleDropdown = (id: number) => {
        setDropdownAberto(dropdownAberto === id ? null : id);
    };

    const toggleMostrarSenha = (id: number) => {
        setMostrarSenhaId(mostrarSenhaId === id ? null : id);
    };

    const handleRoleChange = (id: number, role: string) => {
        const updatedUsuarios = usuarios.map(user => {
            if (user.id === id) {
                return { ...user, role };
            }
            return user;
        });
        setUsuarios(updatedUsuarios);
    };

    return (
        <View style={styles.container}>
            <View style={styles.cabecalho}>
                <Text style={styles.titulo}>Painel de Usuário</Text>
                <Text style={styles.comentario}>
                    Clique em um usuário para ver os detalhes.
                </Text>
            </View>

            <FlatList
                data={usuarios}
                keyExtractor={(item) => item.id.toString()}
                refreshControl={
                    <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />
                }
                renderItem={({ item }) => {
                    const isAberto = dropdownAberto === item.id;
                    const mostrarSenha = mostrarSenhaId === item.id;

                    return (
                        <View style={item.ativo ? styles.usuario : styles.usuarioDesativado}>
                            <TouchableOpacity
                                style={styles.dropdownHeader}
                                onPress={() => toggleDropdown(item.id)}
                            >
                                <Text style={styles.nomeUsuario}>{item.nome}</Text>

                                <Ionicons
                                    name={isAberto ? "chevron-up" : "chevron-down"}
                                    size={20}
                                    color="#000"
                                />
                            </TouchableOpacity>

                            {isAberto && (
                                <View style={styles.dropdownContent}>

                                    <View style={styles.flex}>
                                        <Text style={[styles.email, { flex: 1 }]}>
                                            Email: {item.email}
                                        </Text>
                                        <TouchableOpacity
                                            onPress={() => handleToggleStatus(item.id, item.ativo)}
                                        >
                                            <Ionicons
                                                name={item.ativo ? "checkmark-circle" : "close-circle"}
                                                size={28}
                                                color={item.ativo ? "#5CB85C" : "#D9534F"}
                                            />
                                        </TouchableOpacity>
                                    </View>


                                    <View style={styles.roleContainer}>
                                        <TouchableOpacity
                                            style={[
                                                styles.checkbox,
                                                item.role === "user" && styles.checkboxSelected,
                                            ]}
                                            disabled={true}
                                        >
                                            <Ionicons
                                                name={item.role === "user" ? "checkbox" : "square-outline"}
                                                size={25}
                                                color={
                                                    !item.ativo
                                                        ? "#000" // Desativado
                                                        : item.role === "user"
                                                            ? "#B1AEAF" // Ativo e selecionado
                                                            : "#ccc"   // Não selecionado
                                                }
                                            />
                                            <Text style={[styles.checkboxLabel, !item.ativo && { color: "#000" }]}>
                                                Funcionário
                                            </Text>
                                        </TouchableOpacity>

                                        <TouchableOpacity
                                            style={[
                                                styles.checkbox,
                                                item.role === "admin" && styles.checkboxSelected,
                                            ]}
                                            disabled={true}
                                        >
                                            <Ionicons
                                                name={item.role === "admin" ? "checkbox" : "square-outline"}
                                                size={25}
                                                color={
                                                    !item.ativo
                                                        ? "#000" // Desativado
                                                        : item.role === "admin"
                                                            ? "#B1AEAF" // Ativo e selecionado
                                                            : "#ccc"   // Não selecionado
                                                }
                                            />
                                            <Text style={[styles.checkboxLabel, !item.ativo && { color: "#000" }]}>
                                                Administrador
                                            </Text>
                                        </TouchableOpacity>
                                    </View>


                                    <View style={styles.buttonContainer}>
                                        <TouchableOpacity style={[styles.button, styles.botaoExcluir]}>
                                            <Text style={styles.buttonText}>Excluir</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity style={[styles.button, styles.botaoAtualizar]}>
                                            <Text style={styles.buttonText}>Atualizar</Text>
                                        </TouchableOpacity>
                                    </View>


                                </View>
                            )}
                        </View>
                    );
                }}
            />
        </View>
    );
};


const styles = StyleSheet.create({
    flex: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center", // garante que fiquem alinhados na vertical
    },
    container: {
        flex: 1,
        paddingTop: 80,
        backgroundColor: "#1A1A1A",
        alignItems: "center",
    },
    cabecalho: {
        alignItems: "center",
        marginBottom: 64,
    },
    titulo: {
        fontSize: 28,
        fontWeight: "500",
        color: "#fff",
        fontFamily: "Montserrat_500Medium",
    },
    comentario: {
        marginTop: 20,
        color: "#7D7F85",
        padding: 16,
        textAlign: "center",
        width: 340,
        fontFamily: "Montserrat_500Medium",
    },
    usuario: {
        backgroundColor: "#fff",
        width: 320,
        marginBottom: 20,
        borderRadius: 8,
        padding: 16,
        fontFamily: "Montserrat_500Medium",
    },
    usuarioDesativado: {
        backgroundColor: "#ccc",
        width: 320,
        marginBottom: 20,
        borderRadius: 8,
        padding: 16,
        fontFamily: "Montserrat_500Medium",
    },
    nomeUsuario: {
        fontSize: 16,
        fontFamily: "Montserrat_500Medium",
    },
    email: {
        fontFamily: "Montserrat_500Medium",
    },
    dropdownHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    dropdownContent: {
        marginTop: 16,
    },
    senhaContainer: {
        flexDirection: "row",
        alignItems: "center",
        marginTop: 10,
        marginBottom: 10,
    },
    inputSenha: {
        flex: 1,
        borderBottomWidth: 1,
        borderBottomColor: "#ccc",
        marginRight: 10,
        paddingVertical: 2,
    },
    tipoContainer: {
        flexDirection: "row",
        justifyContent: "space-around",
        marginTop: 10,
    },
    roleContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginTop: 16,
    },
    checkbox: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 16,
        marginHorizontal: 5,
    },
    checkboxLabel: {
        marginLeft: 4,
        color: "#333",
        fontWeight: "500",
        fontFamily: "Montserrat_500Medium",
    },
    buttonContainer: {
        flexDirection: "row",
        justifyContent: "center",
        marginTop: 10,
    },
    button: {
        marginHorizontal: 15,
        paddingVertical: 6,
        paddingHorizontal: 10,
        borderRadius: 8,
        justifyContent: "center",
        alignItems: "center",
        flex: 0.50,
    },
    botaoAtualizar: {
        backgroundColor: "#0B8D7F",
    },
    botaoExcluir: {
        backgroundColor: "#BA4747",
    },
    buttonText: {
        color: "#fff",
        fontFamily: "Montserrat_500Medium",
    },
});

export default ListagemUsuarios;
