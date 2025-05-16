import React, { useState } from "react";
import { StyleSheet, View, TextInput, TextInputProps } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
 
type BarraPesquisaProps = {
  onRegexSubmit?: (regex: RegExp) => void;
  placeholder?: string;
  inputProps?: TextInputProps;
};
 
const BarraPesquisaComponent: React.FC<BarraPesquisaProps> = ({
    onRegexSubmit,
    placeholder = "Pesquisar...",
    inputProps,
  }) => {
    const [pesquisa, setPesquisa] = useState<string>("");

  const handleChange = (text: string) => {
    const pesquisaFormatada = text.trim(); // Remover espaços extras
    setPesquisa(pesquisaFormatada);

    if (pesquisaFormatada === "") {
      onRegexSubmit?.(/.*/); // Se estiver vazio, retorna todos
    } else {
      try {
        // Aqui está o ajuste: regex simples, sem complicação
        const regex = new RegExp(`^${pesquisaFormatada}`, "i");
        onRegexSubmit?.(regex);
      } catch (e) {
        console.warn("Regex inválida:", e);
      }
    }
  };

  return (
    <View style={styles.wrapper}>
      <View style={styles.searchContainer}>
        <Ionicons name="search-outline" size={20} color="#888" style={styles.icon} />
        <TextInput
          style={styles.input}
          placeholder={placeholder}
          value={pesquisa}
          onChangeText={handleChange}
          placeholderTextColor="#888"
          {...inputProps}
        />
      </View>
    </View>
  );
};
 
const styles = StyleSheet.create({
  wrapper: {
    width: "100%", // Ocupa toda a largura
    paddingHorizontal: 20, // Adiciona um pouco de padding nas laterais
    marginBottom: 20,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f0f0f0",
    borderRadius: 25,
    paddingHorizontal: 15,
    paddingVertical: 8,
    width: "100%", // Ocupa toda a largura do wrapper
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 2,
  },
  icon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: "#000",
  },
});
 
export default BarraPesquisaComponent;