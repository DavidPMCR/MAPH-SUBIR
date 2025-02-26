import React, { useState } from 'react';
import { View, TextInput, Text, StyleSheet, Alert, TouchableOpacity, ImageBackground } from 'react-native';
import axios from 'axios';
import  API from '../controller/API';

const ForgotPasswordScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [cedula, setCedula] = useState('');
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');

  const handleForgotPassword = async () => {
    if (!email.trim()) {
      setError('El correo electrónico es obligatorio');
      return;
    }
    if (!cedula.trim()) {
      setError('La cédula es obligatoria');
      return;
    }
    if (!reason.trim()) {
      setError('El motivo es obligatorio');
      return;
    }

    // Estructura del mensaje
    const emailData = {
      email: 'SOPORTEMAPH@GMAIL.COM', // Correo de destino fijo
      reason: `🔒 Solicitud de Recuperación de Contraseña\n
      - 📧 Correo de contacto: ${email}
      - 🆔 Cédula: ${cedula}
      - 📝 Motivo: ${reason}`
    };

    try {
      await axios.post(`${API}/sendEmail/resetPassword`, emailData);
      Alert.alert('Éxito', 'Se ha enviado tu solicitud correctamente.');
      navigation.navigate('loginScreen'); // Redirigir a la pantalla de login
    } catch (error) {
      setError('Error al enviar el correo.');
      console.error('Error enviando solicitud:', error.message);
    }
  };

  return (
    <ImageBackground source={require('../assets/logo.png')} style={styles.background}>
      <View style={styles.container}>
        <Text style={styles.title}>Recuperar Contraseña</Text>

        {/* Campo de correo electrónico */}
        <TextInput
          style={styles.input}
          placeholder="Correo electrónico"
          value={email}
          onChangeText={setEmail}
          placeholderTextColor="#888"
          keyboardType="email-address"
        />

        {/* Campo de cédula */}
        <TextInput
          style={styles.input}
          placeholder="Cédula"
          value={cedula}
          onChangeText={setCedula}
          placeholderTextColor="#888"
          keyboardType="numeric"
        />

        {/* Campo de motivo */}
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Motivo"
          value={reason}
          onChangeText={setReason}
          placeholderTextColor="#888"
          multiline
        />

        {/* Mostrar errores si los hay */}
        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        {/* Botón de enviar */}
        <TouchableOpacity style={styles.button} onPress={handleForgotPassword}>
          <Text style={styles.buttonText}>Enviar</Text>
        </TouchableOpacity>

        {/* Botón de volver */}
        <TouchableOpacity onPress={() => navigation.navigate('loginScreen')}>
          <Text style={styles.backText}>Volver</Text>
        </TouchableOpacity>
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
    flexGrow: 1,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.8)', // Fondo semitransparente
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#007bff', // Color celeste
    textAlign: 'center',
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
  button: {
    backgroundColor: '#fdb813', // Mismo color que el botón de login
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    paddingHorizontal: 30,
    marginTop: 10,
  },
  buttonText: {
    color: '#000', // Texto en negro para contraste
    fontSize: 16,
    fontWeight: 'bold',
  },
  backText: {
    marginTop: 20,
    textAlign: 'center',
    color: '#0000ee',
    textDecorationLine: 'underline',
  },
  errorText: {
    color: 'red',
    marginBottom: 10,
    textAlign: 'center',
    fontSize: 14,
  },
});


export default ForgotPasswordScreen;
