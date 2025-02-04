import React, { useState } from 'react';
import { View, TextInput, Text, StyleSheet, Alert, TouchableOpacity, Switch, ScrollView, ImageBackground } from 'react-native';
import axios from 'axios';

const CreateUserRequestScreen = ({ navigation }) => {
  const [userData, setUserData] = useState({
    id_cedula: '',
    nombre: '',
    apellidos: '',
    telefono: '',
    correo: ''
  });

  const [hasCompany, setHasCompany] = useState(false);
  const [companyData, setCompanyData] = useState({
    nombre: '',
    cedula: '',
    telefono: '',
    correo: ''
  });

  const [error, setError] = useState('');

  const handleInputChange = (field, value) => {
    setUserData({ ...userData, [field]: value });
  };

  const handleCompanyInputChange = (field, value) => {
    setCompanyData({ ...companyData, [field]: value });
  };

  const handleCreateUserRequest = async () => {
    if (!userData.id_cedula.trim() || !userData.nombre.trim() || !userData.apellidos.trim() || !userData.telefono.trim() || !userData.correo.trim()) {
      setError('Por favor completa todos los campos obligatorios.');
      return;
    }

    if (hasCompany && (!companyData.nombre.trim() || !companyData.cedula.trim() || !companyData.telefono.trim() || !companyData.correo.trim())) {
      setError('Por favor completa los datos de la empresa.');
      return;
    }

    const emailData = {
      email: 'SOPORTEMAPH@GMAIL.COM',
      reason: `🆕 Solicitud de Creación de Usuario\n
      - 🆔 Cédula: ${userData.id_cedula}
      - 👤 Nombre: ${userData.nombre} ${userData.apellidos}
      - 📞 Teléfono: ${userData.telefono}
      - 📧 Correo: ${userData.correo}

      ${hasCompany ? `
      🏢 Información de la Empresa:
      - 🏢 Nombre: ${companyData.nombre}
      - 🆔 Cédula Empresa: ${companyData.cedula}
      - 📞 Teléfono: ${companyData.telefono}
      - 📧 Correo: ${companyData.correo}
      ` : ''}
      `
    };

    try {
      await axios.post('http://192.168.1.98:3001/sendEmail/createUser', emailData);
      Alert.alert('Éxito', 'Tu solicitud ha sido enviada correctamente.');
      navigation.navigate('loginScreen');
    } catch (error) {
      setError('Error al enviar la solicitud.');
      console.error('Error enviando solicitud:', error.message);
    }
  };

  return (
    <ImageBackground source={require('../assets/logo.png')} style={styles.background}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Solicitud de Creación de Usuario</Text>

        {/* Datos del usuario */}
        <TextInput style={styles.input} placeholder="Cédula" value={userData.id_cedula} onChangeText={(text) => handleInputChange('id_cedula', text)} keyboardType="numeric" />
        <TextInput style={styles.input} placeholder="Nombre" value={userData.nombre} onChangeText={(text) => handleInputChange('nombre', text)} />
        <TextInput style={styles.input} placeholder="Apellidos" value={userData.apellidos} onChangeText={(text) => handleInputChange('apellidos', text)} />
        <TextInput style={styles.input} placeholder="Teléfono" value={userData.telefono} onChangeText={(text) => handleInputChange('telefono', text)} keyboardType="phone-pad" />
        <TextInput style={styles.input} placeholder="Correo" value={userData.correo} onChangeText={(text) => handleInputChange('correo', text)} keyboardType="email-address" />

        {/* Switch para empresa */}
        <View style={styles.switchContainer}>
          <Text style={styles.label}>¿Tiene una empresa registrada?</Text>
          <Switch value={hasCompany} onValueChange={(value) => setHasCompany(value)} />
        </View>

        {/* Datos de la empresa (si aplica) */}
        {hasCompany && (
          <>
            <TextInput style={styles.input} placeholder="Nombre de la Empresa" value={companyData.nombre} onChangeText={(text) => handleCompanyInputChange('nombre', text)} />
            <TextInput style={styles.input} placeholder="Cédula de la Empresa" value={companyData.cedula} onChangeText={(text) => handleCompanyInputChange('cedula', text)} keyboardType="numeric" />
            <TextInput style={styles.input} placeholder="Teléfono de la Empresa" value={companyData.telefono} onChangeText={(text) => handleCompanyInputChange('telefono', text)} keyboardType="phone-pad" />
            <TextInput style={styles.input} placeholder="Correo de la Empresa" value={companyData.correo} onChangeText={(text) => handleCompanyInputChange('correo', text)} keyboardType="email-address" />
          </>
        )}

        {/* Mostrar errores si los hay */}
        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        {/* Botón de enviar */}
        <TouchableOpacity style={styles.button} onPress={handleCreateUserRequest}>
          <Text style={styles.buttonText}>Enviar Solicitud</Text>
        </TouchableOpacity>

        {/* Botón de volver */}
        <TouchableOpacity onPress={() => navigation.navigate('loginScreen')}>
          <Text style={styles.backText}>Volver</Text>
        </TouchableOpacity>
      </ScrollView>
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
    flexGrow: 1,
    padding: 20,
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
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  label: {
    fontSize: 16,
    color: '#333',
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

export default CreateUserRequestScreen;
