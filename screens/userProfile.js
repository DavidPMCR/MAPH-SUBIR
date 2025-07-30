import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, ImageBackground } from 'react-native';
import axios from 'axios';
import  API from '../controller/API';

const UserProfile = ({ route, navigation }) => {
  const { user } = route.params;
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ ...user });

  const handleInputChange = (field, value) => {
    setFormData({
      ...formData,
      [field]: value,
    });
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleAccept = async () => {
    try {
      const response = await axios.patch(`${API}/user`, formData);
      if (response.status === 200) {
        alert('Datos actualizados exitosamente');
        setIsEditing(false);
        //navigation.navigate('principalScreen', { user: formData });
      }
    } catch (error) {
      console.error('Error al actualizar los datos:', error.message);
      alert('Hubo un problema al actualizar los datos');
    }
  };

  // 🔹 Validar si el usuario tiene rol "D" (Dependiente)
  const isDependiente = user?.rol?.trim()?.toUpperCase() === "D";

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Perfil Profesional</Text>

      <TextInput
        style={[styles.input, isEditing ? styles.editable : styles.readOnly]}
        value={formData.nombre}
        editable={isEditing}
        onChangeText={(text) => handleInputChange('nombre', text)}
        placeholder="Nombre"
      />

      <TextInput
        style={[styles.input, isEditing ? styles.editable : styles.readOnly]}
        value={formData.apellidos}
        editable={isEditing}
        onChangeText={(text) => handleInputChange('apellidos', text)}
        placeholder="Apellidos"
      />

      <TextInput
        style={[styles.input, isEditing ? styles.editable : styles.readOnly]}
        value={formData.id_cedula}
        editable={false}
        placeholder="Cédula"
      />

      <TextInput
        style={[styles.input, isEditing ? styles.editable : styles.readOnly]}
        value={formData.telefono}
        editable={isEditing}
        onChangeText={(text) => handleInputChange('telefono', text)}
        placeholder="Teléfono"
      />

      <TextInput
        style={[styles.input, isEditing ? styles.editable : styles.readOnly]}
        value={formData.correo}
        editable={isEditing}
        onChangeText={(text) => handleInputChange('correo', text)}
        placeholder="Correo"
      />

      <View style={styles.buttonContainer}>
        {!isEditing ? (
          <TouchableOpacity style={styles.editButton} onPress={handleEdit}>
            <Text style={styles.buttonText}>Editar</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.acceptButton} onPress={handleAccept}>
            <Text style={styles.buttonText}>Aceptar</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* 🔹 Solo mostrar este botón si el usuario NO es dependiente */}
      {!isDependiente && (
        <TouchableOpacity
          style={styles.dependientesButton}
          onPress={() => navigation.navigate("dependentScreen", { id_empresa: user.id_empresa })}
        >
          <Text style={styles.buttonText}>Ver Dependientes</Text>
        </TouchableOpacity>
      )}

      <ImageBackground
        source={require('../assets/logo.png')}
        style={styles.background}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#f8f9fa',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    height: 50,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 15,
    paddingHorizontal: 15,
    backgroundColor: '#f8f9fa',
    color: '#333',
  },
  readOnly: {
    backgroundColor: '#e9ecef',
  },
  editable: {
    backgroundColor: '#fff',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 20,
  },
  editButton: {
    backgroundColor: '#007bff',
    padding: 15,
    borderRadius: 8,
  },
  acceptButton: {
    backgroundColor: '#28a745',
    padding: 15,
    borderRadius: 8,
  },
  dependientesButton: {
    backgroundColor: '#17a2b8',
    padding: 15,
    borderRadius: 8,
    marginTop: 20,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  background: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    resizeMode: 'cover',
    marginTop: 20,
  },
});

export default UserProfile;
