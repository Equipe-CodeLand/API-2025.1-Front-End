import React, { useState, useEffect } from "react";
import { StyleSheet, Text, View, FlatList, TouchableOpacity, TextInput, Pressable, Alert } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";
import { useFonts, Montserrat_400Regular, Montserrat_500Medium } from '@expo-google-fonts/montserrat';
import AppLoading from 'expo-app-loading';
import { RefreshControl } from "react-native";
import { useFocusEffect } from '@react-navigation/native';
import { useCallback } from 'react';
import RNPickerSelect from 'react-native-picker-select';
import { API_URL } from '@env'; // <- aqui a mágica acontece
import BarraPesquisaComponent from "../components/barraPesquisa";

const ListagemUsuarios = () => {
    const [usuarios, setUsuarios] = useState<any[]>([]);
    const [dropdownAberto, setDropdownAberto] = useState<number | null>(null);
    const [mostrarSenhaId, setMostrarSenhaId] = useState<number | null>(null);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [isEditing, setIsEditing] = useState(false)
    const [editandoUsuarioId, setEditandoUsuarioId] = useState<number | null>(null);
    const [editNome, setEditNome] = useState('');
    const [editEmail, setEditEmail] = useState('');
    const [editSenha, setEditSenha] = useState('');
    const [editCargo, setEditCargo] = useState('');
    const [senhaValida, setSenhaValida] = useState(true);
    const [emailValido, setEmailValido] = useState(true);
    const [usuariosFiltrados, setUsuariosFiltrados] = useState<typeof usuarios>([]);


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
                Alert.alert(
                    statusAtual ? "Usuário Inativo" : "Usuário Reativado",
                    result.message,
                    [
                        {
                            text: "OK",
                            style: "default",
                        },
                    ]
                );
                handleBuscarUsuarios();
            } else {
                Alert.alert(
                    "Erro",
                    result.message,
                    [
                        {
                            text: "OK",
                            style: "cancel",
                        },
                    ]
                );
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
            setUsuariosFiltrados(data);
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

    const validarEmail = (email: string) => {
        const contemArroba = email.includes('@');
        setEmailValido(contemArroba);
        setEditEmail(email);
    };

    const validarSenha = (senha: string) => {
        const regex = /^(?=.*[!@#$%^&*])(?=.*\d)[A-Za-z\d!@#$%^&*]{8,}$/;
        setSenhaValida(regex.test(senha));
        setEditSenha(senha);
    };

    const handleEdicao = (usuario: any) => {
        setEditandoUsuarioId(usuario.id);
        setEditNome(usuario.nome);
        setEditEmail(usuario.email);
        setEditSenha('');
        setEditCargo(usuario.role)
    };

    const cancelarEdicao = () => {
        setEditandoUsuarioId(null);
        setEditNome('');
        setEditEmail('');
        setEditSenha('');
        setEditCargo('')
    };

    const salvarEdicao = async (id: number) => {
        if (!emailValido) {
            Alert.alert("E-mail inválido", "Por favor, insira um e-mail válido que utilize '@'.");
            return;
        }

        if (!senhaValida) {
            Alert.alert("Senha Inválida", "A senha deve ter pelo menos 8 caracteres, incluir um número e um caractere especial.");
            return;
        }

        const token = await AsyncStorage.getItem("userToken");
        if (!token) {
            console.error("Token não encontrado.");
            Alert.alert("Erro", "Erro de autenticação. Faça login novamente.");
            return;
        }

        const role = await AsyncStorage.getItem("userRole")
        if (role == "admin" && editCargo == "user") {
            Alert.alert("Erro", "Você não pode alterar seu próprio cargo para Usuário.")
        }
        // Construir apenas os dados que foram preenchidos
        const dados: any = {};

        if (editNome && editNome.trim() !== '') {
            dados.nome = editNome.trim();
        }
        if (editEmail && editEmail.trim() !== '') {
            dados.email = editEmail.trim();
        }
        if (editSenha && editSenha.trim() !== '') {
            dados.senha = editSenha;
        }
        if (editCargo && editCargo.trim() !== '') {
            dados.role = editCargo;
        }

        if (Object.keys(dados).length === 0) {
            Alert.alert("Atualização concluída!", "Nenhum dado para atualizar.");
            return;
        }

        try {
            const response = await fetch(`${API_URL}/atualizar/usuarios/${id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                },
                body: JSON.stringify(dados),
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.log("Erro ao atualizar usuário:", errorData);

                if (errorData.error === "E-mail já cadastrado.") {
                    Alert.alert("E-mail Inválido!", "Este e-mail já está cadastrado. Por favor, use outro.");
                } else {
                    Alert.alert("Erro", `Erro ao atualizar usuário: ${errorData.message || 'Tente novamente.'}`);
                }
                return;
            }

            const responseData = await response.json();
            Alert.alert("Atualização Concluída!", "Usuário atualizado com sucesso!");

            await handleBuscarUsuarios();
            setEditandoUsuarioId(null);

        } catch (error) {
            console.log('Erro ao salvar edição', error);
        }
    };



    return (
        <View style={styles.container}>
            <View style={styles.cabecalho}>
                <Text style={styles.titulo}>Painel de Usuário</Text>
                <Text style={styles.comentario}>
                    Clique em um usuário para ver os detalhes.
                </Text>
            </View>

            <View style={styles.searchWrapper}>
                <BarraPesquisaComponent
                    onRegexSubmit={(regex) => {
                        if (!regex || regex.source === "(?:)") {
                            // Regex inválida ou vazia, mostrar todos os usuários
                            setUsuariosFiltrados(usuarios);
                        } else {
                            // Filtra por nome, email, cargo ou status
                            const filtrados = usuarios.filter((usuario) =>
                                regex.test(usuario.nome) ||
                                regex.test(usuario.email) ||
                                regex.test(usuario.role) ||
                                regex.test(usuario.ativo ? "Ativo" : "Inativo")
                            );
                            setUsuariosFiltrados(filtrados);
                        }
                    }}
                    placeholder="Pesquisar por nome, email, cargo ou status"
                />
            </View>

            <FlatList
                data={usuariosFiltrados}
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

                                    {editandoUsuarioId === item.id ? (
                                        <View style={{ marginTop: 16 }}>
                                            <TextInput
                                                style={styles.input}
                                                placeholder="Nome"
                                                value={editNome}
                                                onChangeText={setEditNome}
                                            />
                                            <TextInput
                                                style={styles.input}
                                                placeholder="Email"
                                                value={editEmail}
                                                onChangeText={validarEmail}
                                                keyboardType="email-address"
                                            />
                                            <TextInput
                                                style={styles.input}
                                                placeholder="Senha (Deixe vazio para não alterar)"
                                                value={editSenha}
                                                onChangeText={validarSenha}
                                                secureTextEntry
                                            />

                                            <RNPickerSelect
                                                onValueChange={(value) => setEditCargo(value)}
                                                value={editCargo}
                                                style={{
                                                    inputIOS: { color: '#000', paddingVertical: 12 },
                                                    inputAndroid: { color: '#000' },
                                                }}
                                                placeholder={{ label: "Selecione um cargo", value: '' }}
                                                items={[
                                                    { label: 'Administrador', value: 'admin' },
                                                    { label: 'Usuário', value: 'user' },
                                                ]}
                                            />


                                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 }}>
                                                <TouchableOpacity
                                                    style={[styles.button, styles.botaoCancelar, { flex: 1, marginLeft: 5 }]}
                                                    onPress={cancelarEdicao}
                                                >
                                                    <Text style={styles.buttonText}>Cancelar</Text>
                                                </TouchableOpacity>

                                                <TouchableOpacity
                                                    style={[styles.button, styles.botaoAtualizar, { flex: 1, marginRight: 5 }]}
                                                    onPress={() => salvarEdicao(item.id)}
                                                >
                                                    <Text style={styles.buttonText}>Salvar</Text>
                                                </TouchableOpacity>
                                            </View>
                                        </View>
                                    ) : (
                                        <View>
                                            <View style={styles.flex}>
                                                <Text style={[styles.email, { flex: 1 }]}>
                                                    Email: {item.email}
                                                </Text>
                                                <TouchableOpacity
                                                    onPress={() => {
                                                        Alert.alert(
                                                            item.ativo ? "Inativar usuário" : "Ativar usuário",
                                                            `Tem certeza que deseja ${item.ativo ? "inativar" : "ativar"} ${item.nome}?`,
                                                            [
                                                                {
                                                                    text: "Cancelar",
                                                                    style: "cancel",
                                                                },
                                                                {
                                                                    text: "Confirmar",
                                                                    onPress: () => handleToggleStatus(item.id, item.ativo),
                                                                },
                                                            ]
                                                        );
                                                    }}
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
                                                <TouchableOpacity
                                                    style={[styles.button, styles.botaoExcluir]}
                                                    onPress={() => {
                                                        Alert.alert(
                                                            item.ativo ? "Inativar usuário" : "Ativar usuário",
                                                            `Tem certeza que deseja ${item.ativo ? "inativar" : "ativar"} ${item.nome}?`,
                                                            [
                                                                { text: "Cancelar", style: "cancel" },
                                                                { text: "Confirmar", onPress: () => handleToggleStatus(item.id, item.ativo) }
                                                            ]
                                                        );
                                                    }}
                                                >
                                                    <Text style={styles.buttonText}>{item.ativo ? "Inativar" : "Ativar"}</Text>
                                                </TouchableOpacity>
                                                <TouchableOpacity
                                                    style={[styles.button, styles.botaoAtualizar]}
                                                    onPress={() => handleEdicao(item)}
                                                >
                                                    <Text style={styles.buttonText}>Atualizar</Text>
                                                </TouchableOpacity>
                                            </View>
                                        </View>
                                    )}

                                </View>
                            )}
                        </View>
                    );
                }}
                contentContainerStyle={{
                    justifyContent: "center",
                    alignItems: "center",
                    paddingBottom: 20,
                }}
            />
        </View>
    );
};


const styles = StyleSheet.create({
    flex: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    container: {
        flex: 1,
        paddingTop: 80,
        backgroundColor: "#1A1A1A",
        alignItems: "center",
        justifyContent: "flex-start",
    },
    headerContainer: {
        width: "100%",
        paddingTop: 80,
        paddingHorizontal: 20,
        marginBottom: 20,
    },
    cabecalho: {
        display: 'flex',
        alignItems: "center",
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
        textAlign: "center",
        width: 340,
        fontFamily: "Montserrat_500Medium",
    },
    searchWrapper: {
        width: "100%",
        paddingVertical: 10,
        backgroundColor: "#1A1A1A",
        alignItems: "center",
    },
    listContent: {
        paddingBottom: 20,
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
    input: {
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 8,
        padding: 10,
        marginTop: 10,
        backgroundColor: "#fff",
        fontFamily: "Montserrat_400Regular",
    },
    botaoCancelar: {
        backgroundColor: "#BA4747",
    }

});

export default ListagemUsuarios;