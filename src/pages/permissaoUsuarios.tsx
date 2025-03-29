import { StyleSheet, Text, View, FlatList, TouchableOpacity } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRoute } from "@react-navigation/native";
import { CheckBox } from "react-native-elements"; 
import { useEffect, useState } from "react";

const PermissaoUsuarioPainel = () => {
  const route = useRoute();
  const { agenteId } = route.params as { agenteId: number };

  const [usuarios, setUsuarios] = useState<{ id: number; nome: string; selecionado: boolean }[]>([]);
  const [selecionados, setSelecionados] = useState<{ [key: number]: boolean }>({});
  const [desmarcarTodosAtivo, setDesmarcarTodosAtivo] = useState(false); 

  useEffect(() => {
    const handleListarUsuariosPorAgente = async () => {
      try {
        const token = await AsyncStorage.getItem("userToken");
        if (!token) {
          console.error("Token não encontrado.");
          return;
        }

        const response = await fetch(
          `http://192.168.0.11:3000/agentes/${agenteId}/usuarios`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error(`Erro na requisição: ${response.status}`);
        }

        const data = await response.json();

        const usuariosComSelecao = data.map((usuario: any) => ({
          ...usuario,
          selecionado: usuario.selecionado === 1 || usuario.selecionado === true,
        }));

        setUsuarios(usuariosComSelecao);

        const selecionadosIniciais = usuariosComSelecao.reduce(
          (acc: { [key: number]: boolean }, usuario: any) => {
            acc[usuario.id] = usuario.selecionado;
            return acc;
          },
          {}
        );

        setSelecionados(selecionadosIniciais);
      } catch (err) {
        console.error("Erro ao buscar usuários:", err);
      }
    };

    handleListarUsuariosPorAgente();
  }, [agenteId]);

  const togglePermissaoUsuario = async (usuarioId: number, isChecked: boolean) => {
    try {
      const token = await AsyncStorage.getItem("userToken");
      if (!token) {
        console.error("Token não encontrado.");
        return;
      }

      const url = isChecked
        ? `http://192.168.0.11:3000/agentes/${usuarioId}/habilitar`
        : `http://192.168.0.11:3000/agentes/${usuarioId}/desabilitar`;

      const response = await fetch(url, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Erro na resposta:", errorText);
        throw new Error(`Erro na requisição: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        setSelecionados((prev: { [key: number]: boolean }) => ({
          ...prev,
          [usuarioId]: isChecked,
        }));
      } else {
        console.error("Erro ao atualizar permissão:", data.message);
      }
    } catch (err) {
      console.error("Erro ao atualizar permissão:", err);
    }
  };

  const toggleSelecionado = (id: number) => {
    const isChecked = !selecionados[id];
    togglePermissaoUsuario(id, isChecked);
  };

  const desmarcarTodos = async () => {
    try {
      setDesmarcarTodosAtivo(true); 

      const token = await AsyncStorage.getItem("userToken");
      if (!token) {
        console.error("Token não encontrado.");
        return;
      }

      for (const usuario of usuarios) {
        await fetch(`http://192.168.0.11:3000/agentes/${usuario.id}/desabilitar`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
      }

      setSelecionados({}); 

      setTimeout(() => {
        setDesmarcarTodosAtivo(false);
      }, 500);
    } catch (err) {
      console.error("Erro ao desmarcar todos:", err);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.cabecalho}>
        <Text style={styles.titulo}>Tela de permissões</Text>
        <Text style={styles.comentario}>Selecione o(s) funcionário(s)</Text>
      </View>

      <TouchableOpacity onPress={desmarcarTodos} style={styles.desmarcarContainer}>
        <CheckBox
          checkedIcon="check-square-o"
          uncheckedIcon="square-o"
          checked={desmarcarTodosAtivo} 
          onPress={desmarcarTodos}
        />
        <Text style={styles.desmarcarTexto}>Desmarcar todos</Text>
      </TouchableOpacity>

      <FlatList
        data={usuarios}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.usuarioContainer}>
            <CheckBox
              checkedIcon="check-square-o"
              uncheckedIcon="square-o"
              checked={!!selecionados[item.id]}
              onPress={() => toggleSelecionado(item.id)}
            />
            <Text style={styles.nomeUsuario}>{item.nome}</Text>
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
    marginBottom: 32,
  },
  titulo: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    textAlign: "center",
  },
  comentario: {
    marginTop: 10,
    color: "#7D7F85",
    textAlign: "center",
    paddingHorizontal: 16,
  },
  usuarioContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    borderRadius: 8,
    marginVertical: 5,
    width: 370,
  },
  nomeUsuario: {
    marginLeft: 10,
    fontSize: 16,
    color: "#fff",
  },
  desmarcarContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
    width: 350,
  },
  desmarcarTexto: {
    color: "#fff",
    marginLeft: 10,
    fontSize: 16,
  },
});

export default PermissaoUsuarioPainel;