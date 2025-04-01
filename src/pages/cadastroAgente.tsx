import React, { useState } from "react";
import { StyleSheet, View, Text, TextInput, TouchableOpacity, Alert, ScrollView } from "react-native";
import { useFonts, Montserrat_400Regular, Montserrat_500Medium } from '@expo-google-fonts/montserrat';
import AppLoading from 'expo-app-loading';
import Ionicons from 'react-native-vector-icons/Ionicons';
import * as DocumentPicker from 'expo-document-picker';

const CadastroAgentes = () => {
    const [setor, setSetor] = useState("");
    const [assunto, setAssunto] = useState("");
    const [documento, setDocumento] = useState<string | null>(null);
    const [documentoNome, setDocumentoNome] = useState("");

    let [fontsLoaded] = useFonts({
        Montserrat_400Regular,
        Montserrat_500Medium,
    });

    if (!fontsLoaded) {
        return <AppLoading />;
    }

    const selecionarDocumento = async () => {
        try {
            const resultado = await DocumentPicker.getDocumentAsync({
                type: "*/*",
            });
    
            console.log("Resultado do DocumentPicker:", resultado);
    
            if (resultado.canceled) {
                Alert.alert("Seleção cancelada");
                return;
            }
    
            const fileAsset = resultado.assets?.[0];
    
            if (!fileAsset?.uri) {
                Alert.alert("Erro", "Nenhum arquivo selecionado.");
                return;
            }
    
            const nomeArquivo = fileAsset.name || fileAsset.uri.split('/').pop();
            const extensao = (nomeArquivo ?? "").split('.').pop()?.toLowerCase();
    
            if (extensao !== "csv") {
                Alert.alert("Erro", "Por favor, selecione um arquivo CSV.");
                return;
            }
    
            setDocumento(fileAsset.uri);
            setDocumentoNome(nomeArquivo ?? "");
    
            Alert.alert("Arquivo selecionado", nomeArquivo);
    
        } catch (err) {
            Alert.alert("Erro ao selecionar documento", err instanceof Error ? err.message : "Erro desconhecido");
        }
    };
    

    const handleSubmit = async () => {
        if (!setor || !assunto || !documento) {
            Alert.alert("Erro", "Todos os campos devem ser preenchidos.");
            return;
        }

        const nomeArquivo = documento.split('/').pop();

        const formData = new FormData();
        formData.append("setor", setor);
        formData.append("assunto", assunto);
        const file = {
            uri: documento,
            type: 'application/csv',
            name: nomeArquivo,
        } as any;

        formData.append("documento", file);

        try {
            const response = await fetch('http://192.168.0.11:3000/cadastro/agente', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                throw new Error('Falha ao enviar os dados');
            }

            const data = await response.json();
            Alert.alert("Cadastro enviado!", "Os dados foram registrados com sucesso.");

            setSetor("");
            setAssunto("");
            setDocumento(null);
            setDocumentoNome("");

        } catch (err) {
            Alert.alert("Erro", err instanceof Error ? err.message : "Erro desconhecido");
        }
    };

    return (
        <ScrollView contentContainerStyle={styles.scrollContainer}>
            <View style={styles.container}>
                <View style={styles.cabecalho}>
                    <Text style={styles.titulo}>Cadastrar um agente</Text>
                </View>

                <View style={styles.inputContainer}>
                    <Text style={styles.label}>Nome do Setor</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Insira o nome do setor (Ex: RH)"
                        value={setor}
                        onChangeText={setSetor}
                        placeholderTextColor="#939393"
                    />
                </View>

                <View style={styles.inputContainer}>
                    <Text style={styles.label}>Assunto</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Insira o tópico do assunto aqui (Ex: férias)"
                        value={assunto}
                        onChangeText={setAssunto}
                        placeholderTextColor="#939393"
                    />
                </View>

                <View style={styles.uploadContainer}>
                    <Text style={styles.label}>Insira um documento do setor abaixo:</Text>
                    <TouchableOpacity style={styles.btn} onPress={selecionarDocumento}>
                        <View style={styles.iconContainer}>
                            <Ionicons name="add" size={24} color="#fff" />
                        </View>
                        <Text style={styles.btnTexto}>Upload de arquivo</Text>
                    </TouchableOpacity>
                    {documentoNome && <Text style={styles.arquivoSelecionado}>Arquivo: {documentoNome}</Text>}
                    <Text style={styles.comentario}>* ATENÇÃO: O documento deve conter tabelas com os dados do setor como um todo e que contenha uma seção exclusiva para o assunto</Text>
                </View>

                <View style={styles.footer}>
                    <TouchableOpacity style={styles.btnEnviar} onPress={handleSubmit}>
                        <Text style={styles.btnTexto}>Enviar</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </ScrollView>
    );
};


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
    uploadContainer: {
        width: 360,
        marginTop: 20,
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

export default CadastroAgentes;
