import { Montserrat_400Regular, Montserrat_500Medium, useFonts } from "@expo-google-fonts/montserrat";
import AsyncStorage from "@react-native-async-storage/async-storage";
import AppLoading from "expo-app-loading";
import { useState } from "react";
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import RNPickerSelect from 'react-native-picker-select';
import { API_URL } from '@env';

const CadastroUsuario = () => {
    const [nome, setNome] = useState("");
    const [email, setEmail] = useState("");
    const [senha, setSenha] = useState("");
    const [tipo, setTipo] = useState("");
    const [senhaValida, setSenhaValida] = useState(true);
    const [emailValido, setEmailValido] = useState(true); 

    let [fontsLoaded] = useFonts({
        Montserrat_400Regular,
        Montserrat_500Medium,
    });

    if (!fontsLoaded) {
        return <AppLoading />;
    }

    const validarEmail = (email: string) => {
        const contemArroba = email.includes('@');
        setEmailValido(contemArroba); 
        setEmail(email);
    };

    const validarSenha = (senha: string) => {
        const regex = /^(?=.*[!@#$%^&*])(?=.*\d)[A-Za-z\d!@#$%^&*]{8,}$/;
        setSenhaValida(regex.test(senha)); 
        setSenha(senha); 
    };

    const handleSubmit = async () => {
        if (!nome || !email || !senha || !tipo) {
            alert("Por favor, preencha todos os campos.");
            return;
        }

        if (!emailValido) {
            alert("Por favor, insira um e-mail válido que utilize '@'.");
            return;
        }

        if (!senhaValida) {
            alert("A senha deve ter pelo menos 8 caracteres, incluir um número e um caractere especial.");
            return;
        }

        const token = await AsyncStorage.getItem("userToken");
        if (!token) {
            console.error("Token não encontrado.");
            alert("Erro de autenticação. Faça login novamente.");
            return;
        }

        // Certifique-se de que o tipo está definido corretamente
        if (!['admin', 'user'].includes(tipo)) {
            alert("Por favor, selecione um cargo válido para o usuário.");
            return;
        }

        const dados = {
            nome,
            email,
            senha,
            cargo: tipo, 
        };

        console.log("Dados enviados:", dados);

        try {
            const response = await fetch(`${API_URL}/cadastro/usuario`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(dados),
            });

            console.log("Resposta completa do servidor:", response);

            if (!response.ok) {
                const errorData = await response.json();
                console.log("Erro ao cadastrar usuário:", errorData);
            
                if (errorData.message === "E-mail já cadastrado.") {
                    alert("Este e-mail já está cadastrado. Por favor, use outro.");
                } else {
                    alert(`Erro ao cadastrar usuário: ${errorData.message || 'Tente novamente.'}`);
                }
                return;
            }                     

            const responseData = await response.json();
            alert("Usuário cadastrado com sucesso!");
            console.log("Resposta do servidor:", responseData);

            // Limpar os campos após o sucesso
            setNome("");
            setEmail("");
            setSenha("");
            setTipo("");
        } catch (error) {
            console.error("Erro ao cadastrar usuário:", error);
            alert("Erro ao cadastrar usuário. Verifique sua conexão e tente novamente.");
        }
    };

    return (
        <ScrollView contentContainerStyle={styles.scrollContainer}>
            <View style={styles.container}>
                <View style={styles.cabecalho}>
                    <Text style={styles.titulo}>Cadastrar um agente</Text>
                </View>

                <View style={styles.inputContainer}>
                    <Text style={styles.label}>Nome do Usuário</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Insira o nome do usuário"
                        value={nome}
                        onChangeText={setNome}
                        placeholderTextColor="#939393"
                    />
                </View>

                <View style={styles.inputContainer}>
                    <Text style={styles.label}>Email do Usuário</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Insira o email do usuário"
                        value={email}
                        onChangeText={validarEmail} 
                        placeholderTextColor="#939393"
                    />
                    {!emailValido && (
                        <Text style={styles.aviso}>
                            Por favor, insira um e-mail válido  que utilize '@'.
                        </Text>
                    )}
                </View>

                <View style={styles.inputContainer}>
                    <Text style={styles.label}>Senha do Usuário</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Insira a senha do usuário"
                        value={senha}
                        onChangeText={validarSenha}
                        placeholderTextColor="#939393"
                        secureTextEntry 
                    />
                    {!senhaValida && (
                        <Text style={styles.aviso}>
                            ATENÇÃO: Digite uma senha que contenha pelo menos 8 caracteres, um número e um caractere especial.
                        </Text>
                    )}
                </View>

                <View style={styles.inputContainer}>
                    <Text style={styles.label}>Cargo do Usuário</Text>
                    <RNPickerSelect
                        onValueChange={(value) => setTipo(value)}
                        value={tipo}
                        style={{
                            inputIOS: { color: '#fff' },
                            inputAndroid: { color: '#fff' },
                        }}
                        items={[
                            { label: 'Administrador', value: 'admin' },
                            { label: 'Usuário', value: 'user' },
                        ]}
                    />
                </View>

                <View style={styles.footer}>
                    <TouchableOpacity style={styles.btnEnviar} onPress={handleSubmit}>
                        <Text style={styles.btnTexto}>Enviar</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </ScrollView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'flex-start',
        alignItems: 'center',
        backgroundColor: '#1A1A1A',
        paddingTop: 80,
    },
    scrollContainer: {
        flexGrow: 1,
    },
    cabecalho: {
        display: 'flex',
        alignItems: 'center',
        marginBottom: 64,
    },
    titulo: {
        fontSize: 30,
        fontFamily: "Montserrat_500Medium",
        color: '#fff',
        textAlign: 'center',
    },
    inputContainer: {
        width: 360,
        marginBottom: 16,
    },
    select: {
        color: '#fff',
    },
    aviso: {
        color: '#939393',
        fontSize: 14,
        marginTop: 5,
        fontFamily: "Montserrat_400Regular",
    },
    label: {
        color: '#fff',
        fontFamily: "Montserrat_400Regular",
        marginBottom: 5,
        fontSize: 18
    },
    input: {
        width: '100%',
        borderRadius: 10,
        backgroundColor: '#FFF4F4',
        paddingLeft: 10,
        color: '#939393',
        height: 40,
    },
    btn: {
        backgroundColor: '#0B8D7F',
        width: 220,
        height: 40,
        borderRadius: 5,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 10,
        flexDirection: 'row',
        padding: 5,
    },
    iconContainer: {
        backgroundColor: '#0B8D7F',
        borderRadius: 20,
        padding: 5,
        marginRight: 10,
    },
    btnTexto: {
        color: '#FFF4F4',
        fontFamily: "Montserrat_400Regular",
        fontSize: 16,
    },
    arquivoSelecionado: {
        marginTop: 10,
        color: '#FFF4F4',
        fontFamily: "Montserrat_400Regular",
    },
    comentario: {
        marginTop: 20,
        color: '#7D7F85',
        fontFamily: "Montserrat_400Regular",
    },
    btnEnviar: {
        backgroundColor: '#0B8D7F',
        width: 300,
        height: 40,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 240,
        marginBottom: 30,
      },    
    footer: {
        bottom: 92,
        width: '100%',
        alignItems: 'center',
    },
});

export default CadastroUsuario;