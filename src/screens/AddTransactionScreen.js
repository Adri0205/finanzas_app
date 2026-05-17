import { useState } from "react";

import axios from "axios";

import { Button, TextInput, View } from "react-native";

export default function AddTransactionScreen() {
  const [monto, setMonto] = useState("");

  const [tipo, setTipo] = useState("");

  const [categoria, setCategoria] = useState("");

  const [cuenta, setCuenta] = useState("");

  const [descripcion, setDescripcion] = useState("");

  const guardar = async () => {
    if (!monto || !tipo || !categoria || !cuenta) {
      alert("Complete todos los campos");

      return;
    }

    try {
      await axios.post("http://192.168.1.20:3000/api/transactions", {
        monto,
        tipo,
        categoria,
        cuenta,
        descripcion,
      });

      alert("Guardado");

      setMonto("");
      setTipo("");
      setCategoria("");
      setCuenta("");
      setDescripcion("");
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <View style={{ padding: 20 }}>
      <TextInput
        placeholder="Monto"
        keyboardType="numeric"
        value={monto}
        onChangeText={setMonto}
        style={{
          borderWidth: 1,
          marginBottom: 10,
          padding: 10,
        }}
      />

      <TextInput
        placeholder="Tipo"
        value={tipo}
        onChangeText={setTipo}
        style={{
          borderWidth: 1,
          marginBottom: 10,
          padding: 10,
        }}
      />

      <TextInput
        placeholder="Categoría"
        value={categoria}
        onChangeText={setCategoria}
        style={{
          borderWidth: 1,
          marginBottom: 10,
          padding: 10,
        }}
      />

      <TextInput
        placeholder="Cuenta"
        value={cuenta}
        onChangeText={setCuenta}
        style={{
          borderWidth: 1,
          marginBottom: 10,
          padding: 10,
        }}
      />

      <TextInput
        placeholder="Descripción"
        value={descripcion}
        onChangeText={setDescripcion}
        style={{
          borderWidth: 1,
          marginBottom: 10,
          padding: 10,
        }}
      />

      <Button title="Guardar" onPress={guardar} />
    </View>
  );
}
