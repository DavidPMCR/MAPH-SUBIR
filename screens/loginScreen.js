import React, { useState } from 'react';
import { View, TextInput, Button, Text, StyleSheet, ImageBackground, TouchableOpacity } from 'react-native';
import axios from 'axios';
import AsyncStorage from "@react-native-async-storage/async-storage";
import  API from '../controller/API';

const LoginScreen = ({ navigation }) => {
  const [cedula, setCedula] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [error, setError] = useState('');
  

  const handleLogin = async () => {
    try {
        const response = await axios.post(`${API}/auth/login`, {
            id_cedula: cedula,
            contrasena: contrasena,
        });

        console.log("🔹 Respuesta del backend en login:", response.data);

        if (response.data.code == 200) {
            const { user, token } = response.data.data;

            // 🔹 Verificar si el token es recibido
            console.log("✅ Token recibido en frontend:", token);

            // Guardar el token en AsyncStorage
            await AsyncStorage.setItem("token", token);
            await AsyncStorage.setItem("user", JSON.stringify(user));

            navigation.reset({
                index: 0,
                routes: [{ name: "principalScreen", params: { user } }],
            });
        } else {
            setError("Credenciales incorrectas");
        }
    } catch (error) {
        console.error("❌ Error en login:", error.response?.data || error.message);
        setError("Error al autenticar.");
    }
};




  return (
    <ImageBackground
      source={require('../assets/logo.png')}
      style={styles.background}
    >
      <View style={styles.container}>
        <Text style={styles.title}>Inicia Sesión</Text>
        <TextInput
          style={styles.input}
          placeholder="Usuario"
          value={cedula}
          onChangeText={setCedula}
          placeholderTextColor="#888"
        />
        <TextInput
          style={styles.input}
          placeholder="Contraseña"
          secureTextEntry
          value={contrasena}
          onChangeText={setContrasena}
          placeholderTextColor="#888"
        />
        {error ? <Text style={styles.errorText}>{error}</Text> : null}
        <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
          <Text style={styles.loginButtonText}>Inicia Sesión</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('sendCreateUserMailScreen')}>
          <Text style={styles.registerText}>Registrar</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('forgotPasswordScreen')}>
          <Text style={styles.forgotPasswordText}>¿Olvidaste tu contraseña?</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('sendSupportMailScreen')}>
          <Text style={styles.forgotPasswordText}>Solicitud soporte</Text>
        </TouchableOpacity>
        <Text style={styles.pricingText}>1 mes $15</Text>
        <Text style={styles.pricingText}>3 meses $40</Text>
        <Text style={styles.pricingText}>1 año $120</Text>
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
    resizeMode: 'cover',
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.8)', // Fondo semitransparente
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#007bff', // Celeste, igual que en las otras vistas
  },
  input: {
    height: 50,
    width: '80%',
    borderColor: '#007bff', // Borde celeste
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 15,
    paddingHorizontal: 15,
    backgroundColor: '#e9ecef', // Fondo celeste claro
  },
  loginButton: {
    backgroundColor: '#fdb813', // Mismo color del botón de login en otras vistas
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 30,
    marginTop: 10,
  },
  loginButtonText: {
    color: '#000', // Texto en negro para contraste
    fontSize: 16,
    fontWeight: 'bold',
  },
  registerText: {
    marginTop: 20,
    textAlign: 'center',
    color: '#0000ee',
    textDecorationLine: 'underline',
  },
  forgotPasswordText: {
    marginTop: 10,
    textAlign: 'center',
    color: '#0000ee',
    textDecorationLine: 'underline',
  },
  pricingText: {
    marginTop: 10,
    textAlign: 'center',
    color: '#0000ee',
    fontSize: 16,
  },
  errorText: {
    color: 'red',
    marginBottom: 10,
    textAlign: 'center',
    fontSize: 14,
  },
});


export default LoginScreen;
