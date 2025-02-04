import React, { useState } from 'react';
import { View, TextInput, Text, StyleSheet, Alert, TouchableOpacity, ImageBackground } from 'react-native';
import axios from 'axios';

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
      await axios.post('http://192.168.1.98:3001/sendEmail/resetPassword', emailData);
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
    resizeMode: 'cover', // Ajusta la imagen para que cubra toda la pantalla
    justifyContent: 'center',
  },
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.85)', // Fondo semi-transparente para mejorar la legibilidad
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#333',
  },
  input: {
    height: 50,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 15,
    paddingHorizontal: 10,
    backgroundColor: '#fff',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  button: {
    backgroundColor: '#007bff',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  backText: {
    marginTop: 20,
    textAlign: 'center',
    color: '#007bff',
    textDecorationLine: 'underline',
  },
  errorText: {
    color: 'red',
    marginBottom: 10,
    textAlign: 'center',
  },
});

export default ForgotPasswordScreen;
