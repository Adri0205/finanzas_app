import React, {

  useEffect,
  useState

} from 'react';

import axios from 'axios';

import {

  View,
  Text,
  FlatList,
  TouchableOpacity,
  Alert

} from 'react-native';

export default function TransactionsScreen() {

  const [transactions, setTransactions] =
    useState([]);


  // OBTENER DATOS

  const obtenerTransacciones =
    async () => {

      try {

        const response =
          await axios.get(
            'http://10.0.2.2:3000/api/transactions'
          );

        setTransactions(response.data);

      } catch (error) {

        console.log(error);

      }

    };


  useEffect(() => {

    obtenerTransacciones();

  }, []);


  // ELIMINAR

  const eliminar = (id) => {

    Alert.alert(

      'Eliminar',

      '¿Desea eliminar esta transacción?',

      [

        {
          text: 'Cancelar'
        },

        {

          text: 'Eliminar',

          onPress: async () => {

            try {

              await axios.delete(
                `http://10.0.2.2:3000/api/transactions/${id}`
              );

              obtenerTransacciones();

            } catch (error) {

              console.log(error);

            }

          }

        }

      ]

    );

  };


  return (

    <View style={{ padding: 20 }}>

      <Text
        style={{
          fontSize: 25,
          fontWeight: 'bold',
          marginBottom: 20
        }}
      >
        Transacciones
      </Text>

      <FlatList
        data={transactions}
        keyExtractor={(item) => item.id}

        renderItem={({ item }) => (

          <TouchableOpacity

            onLongPress={() =>
              eliminar(item.id)
            }

            style={{
              backgroundColor: '#ddd',
              padding: 15,
              borderRadius: 10,
              marginBottom: 10
            }}
          >

            <Text>

              {item.tipo === 'ingreso'
                ? '+'
                : '-'}

              ${item.monto}

            </Text>

            <Text>
              {item.categoria}
            </Text>

            <Text>
              {item.cuenta}
            </Text>

          </TouchableOpacity>

        )}

      />

    </View>

  );

}