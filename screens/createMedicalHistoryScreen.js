import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Modal, Alert } from 'react-native';
import axios from 'axios';
import { Picker } from '@react-native-picker/picker';

const MedicalHistoryScreen = ({ route }) => {
  const { user } = route.params; // Usuario logueado
  const [formData, setFormData] = useState({
  
    id_cedula: '',
    id_empresa: user.id_empresa,
    app: '',
    apf: '',
    aqx: '',
    tx: '',
    observaciones: '',
  });

  const [isEditing, setIsEditing] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [patients, setPatients] = useState([]); // Lista de pacientes
  const [selectedPatient, setSelectedPatient] = useState(''); // Paciente seleccionado

  // Cargar lista de pacientes
  const fetchPatients = async () => {
    try {
      const response = await axios.get('http://192.168.1.98:3001/patient');
      setPatients(response.data.data);
    } catch (error) {
      console.error('Error al cargar los pacientes:', error.message);
      Alert.alert('Error', 'No se pudieron cargar los pacientes.');
    }
  };

  // Cargar historial médico por cédula
const fetchMedicalHistory = async (cedula) => {
    try {
      const response = await axios.get(`http://192.168.1.98:3001/mh/${cedula}`);
      if (response.data.code === "200" && response.data.data) {
        const medicalData = response.data.data; // Aquí están los datos reales del historial médico
        console.log("trae esto del backend", response.data);
        console.log("campo apf", medicalData.apf); // Ahora debería mostrar el valor correcto
        
        // Establecer los datos en el estado
        setFormData({
          id_cedula: medicalData.id_cedula || '',
          id_empresa: medicalData.id_empresa || user.id_empresa,
          app: medicalData.app || '',
          apf: medicalData.apf || '',
          aqx: medicalData.aqx || '',
          tx: medicalData.tx || '',
          observaciones: medicalData.observaciones || '',
        });
      } else {
        // Si no se encuentra historial médico, limpiar los campos
        Alert.alert('Aviso', 'No se encontró un historial médico para el paciente seleccionado.');
        setFormData({
          id_cedula: '',
          id_empresa: user.id_empresa,
          app: '',
          apf: '',
          aqx: '',
          tx: '',
          observaciones: '',
        });
        setSelectedPatient(''); // Limpia el paciente seleccionado
      }
    } catch (error) {
     // console.error('Error al cargar el historial médico:', error.message);
       Alert.alert( 'Selecione un paciente.');
      // En caso de error, también limpiar los campos
      setFormData({
        id_cedula: '',
        id_empresa: user.id_empresa,
        app: '',
        apf: '',
        aqx: '',
        tx: '',
        observaciones: '',
      });
    }
  };
  
  

  // Manejar selección de paciente
  const handleSelectPatient = (id_cedula) => {
    setSelectedPatient(id_cedula);
    fetchMedicalHistory(id_cedula); // Cargar el historial médico del paciente seleccionado
  };

 
  // Guardar historial médico desde el modal
const handleSaveHistory = async () => {
    try {
      if (!formData.id_cedula || !formData.app || !formData.apf) {
        Alert.alert('Error', 'Por favor complete todos los campos obligatorios.');
        return;
      }
  
      const payload = { ...formData };
      const response = await axios.post('http://192.168.1.98:3001/mh', payload);
  
      if (response.status === 200 || response.status === 201) {
        Alert.alert('Éxito', 'Historial médico creado correctamente.');
        setIsModalVisible(false); // Cierra el modal
        setFormData({
          id_cedula: '',
          id_empresa: user.id_empresa,
          app: '',
          apf: '',
          aqx: '',
          tx: '',
          observaciones: '',
        });
      } else {
        throw new Error('Respuesta inesperada del servidor.');
      }
    } catch (error) {
      console.error('Error al crear el historial médico:', error.message);
      Alert.alert('Error', 'Paciente ya posee un historial médico registrado..');
    }
  };
  
  // Actualizar historial médico
  const handleUpdateHistory = async () => {
    const { id_cedula } = formData;
  
    if (!id_cedula) {
      Alert.alert('Error', 'No se puede actualizar el historial médico sin una cédula válida.');
      return;
    }
  
    try {
      // Imprimir los datos que se van a enviar para depuración
      console.log('Datos del formulario enviados:', formData);
  
      // Realizar la solicitud PATCH con el cuerpo de los datos
      const response = await axios.patch('http://192.168.1.98:3001/mh', formData);
  
      if (response.status === 200 || response.status === 201) {
        Alert.alert('Éxito', 'Historial médico actualizado correctamente.');
        setIsEditing(false); // Salir del modo de edición
      } else {
        throw new Error('Error inesperado al actualizar el historial médico.');
      }
    } catch (error) {
      // Manejo detallado de errores
      if (error.response) {
        console.error('Datos del error:', error.response.data);
   
      } else if (error.request) {
        console.error('Solicitud enviada pero no se recibió respuesta:', error.request);
      } else {
        console.error('Error al configurar la solicitud:', error.message);
      }
      Alert.alert('Error', 'No se pudo actualizar el historial médico.');
    }
  };
  
  

 
 // Eliminar historial médico
const handleDeleteHistory = async () => {
    const { id_cedula } = formData; // Obtén id_cedula desde formData
  
    if (!id_cedula) {
      Alert.alert('Error', 'Paciente no posee historial médico para eliminar.');
      return;
    }
  
    // Mostrar cuadro de confirmación
    Alert.alert(
      'Confirmar eliminación',
      '¿Estás seguro de que deseas eliminar este historial médico?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Aceptar',
          onPress: async () => {
            try {
              console.log("Cédula enviada:", id_cedula); // Muestra la cédula para depuración
              const response = await axios.delete(`http://192.168.1.98:3001/mh/${id_cedula}`);
              if (response.status === 200 || response.status === 201) {
                Alert.alert('Éxito', 'Historial médico eliminado correctamente.');
                setFormData({
                  id_cedula: '',
                  id_empresa: user.id_empresa,
                  app: '',
                  apf: '',
                  aqx: '',
                  tx: '',
                  observaciones: '',
                });
                setSelectedPatient(''); // Limpia el paciente seleccionado
              } else {
                throw new Error('Error inesperado en la eliminación del historial médico.');
              }
            } catch (error) {
              console.error('Error al eliminar el historial médico:', error.message);
              Alert.alert('Error', 'No se pudo eliminar el historial médico.');
            }
          },
        },
      ],
      { cancelable: false } // Evitar cerrar el cuadro de diálogo al hacer clic fuera
    );
  };
  

  // Cargar pacientes al iniciar
  useEffect(() => {
    fetchPatients();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Gestión de Historial Médico</Text>

      {/* Combo Box para seleccionar paciente */}
      <Text style={styles.label}>Seleccionar Paciente:</Text>
      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={selectedPatient}
          onValueChange={(value) => handleSelectPatient(value)}
        >
          <Picker.Item label="Seleccione un paciente" value="" />
          {patients.map((patient) => (
            <Picker.Item
              key={patient.id_cedula}
              label={`${patient.nombre} ${patient.apellidos}`}
              value={patient.id_cedula}
            />
          ))}
        </Picker>
      </View>

      {/* Formulario de historial médico */}
      <ScrollView>
        {Object.entries({
          id_cedula: 'Cédula*',
          app: 'APP*',
          apf: 'APF*',
          aqx: 'AQX',
          tx: 'TX',
          observaciones: 'Observaciones',
        }).map(([key, label]) => (
          <TextInput
            key={key}
            style={[
              styles.input,
              isEditing ? styles.editable : styles.readOnly,
              ['app', 'apf', 'aqx', 'tx', 'observaciones'].includes(key) ? styles.textArea : null,
            ]}
            value={formData[key]}
            editable={isEditing}
            multiline={['app', 'apf', 'aqx', 'tx', 'observaciones'].includes(key)}
            numberOfLines={4}
            onChangeText={(value) => setFormData({ ...formData, [key]: value })}
            placeholder={label}
          />
        ))}
      </ScrollView>

      <View style={styles.buttonContainer}>
  {/* Botón de Editar */}
  <TouchableOpacity
    style={[styles.editButton, !selectedPatient && styles.disabledButton]} // Azul si hay paciente seleccionado
    onPress={() => setIsEditing(true)} // Habilitar edición
    disabled={!selectedPatient} // Deshabilitado si no hay paciente seleccionado
  >
    <Text style={styles.buttonText}>Editar</Text>
  </TouchableOpacity>

  {/* Botón central dinámico: Guardar Cambios o Eliminar */}
  <TouchableOpacity
    style={[
      isEditing ? styles.saveButton : styles.finalizeButton, // Verde si editando, rojo si no
      !selectedPatient && styles.disabledButton, // Deshabilitar si no hay paciente seleccionado
    ]}
    onPress={isEditing ? handleUpdateHistory : handleDeleteHistory} // Guardar o eliminar según modo
    disabled={!selectedPatient} // Deshabilitar si no hay paciente seleccionado
  >
    <Text style={styles.buttonText}>{isEditing ? 'Guardar Cambios' : 'Eliminar Historial'}</Text>
  </TouchableOpacity>

  {/* Botón de Crear Nuevo */}
  {!isEditing && !selectedPatient && (
    <TouchableOpacity
      style={styles.createButton} // Verde siempre
      onPress={() => setIsModalVisible(true)} // Mostrar modal para crear nuevo
    >
      <Text style={styles.buttonText}>Crear Nuevo</Text>
    </TouchableOpacity>
  )}
</View>



      {/* Modal */}
<Modal visible={isModalVisible} transparent={true} animationType="slide">
  <View style={styles.modalContainer}>
    <ScrollView contentContainerStyle={styles.modalContent}>
      <Text style={styles.modalTitle}>Nuevo Historial Médico</Text>

      {/* Selector de pacientes */}
      <Text style={styles.label}>Paciente*:</Text>
      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={formData.id_cedula}
          onValueChange={(value) => setFormData({ ...formData, id_cedula: value })}
        >
          <Picker.Item label="Selecciona un paciente" value="" />
          {patients.map((patient) => (
            <Picker.Item
              key={patient.id_cedula}
              label={`${patient.nombre} ${patient.apellidos}`}
              value={patient.id_cedula}
            />
          ))}
        </Picker>
      </View>

      {/* Campos del historial médico */}
      {Object.entries({
        app: 'APP*',
        apf: 'APF*',
        aqx: 'AQX',
        tx: 'TX',
        observaciones: 'Observaciones',
      }).map(([key, label]) => (
        <TextInput
          key={key}
          style={[
            styles.input,
            ['app', 'apf', 'aqx', 'tx', 'observaciones'].includes(key) ? styles.textArea : null,
          ]}
          value={formData[key]}
          onChangeText={(value) => setFormData({ ...formData, [key]: value })}
          placeholder={label}
          multiline={['app', 'apf', 'aqx', 'tx', 'observaciones'].includes(key)}
          numberOfLines={4}
        />
      ))}

      {/* Botones del modal */}
      <View style={styles.modalButtons}>
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => setIsModalVisible(false)}
        >
          <Text style={styles.buttonText}>Cancelar</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.saveButton}
          onPress={handleSaveHistory}
        >
          <Text style={styles.buttonText}>Guardar</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  </View>
</Modal>

    </View>
  );
};

const styles = StyleSheet.create({
  // Mantén los estilos originales
  textArea: {
    height: 100,
    textAlignVertical: 'top', // Para que el texto comience desde arriba
  },


 container:
  {
    flex: 1,
    padding: 20
  },

  title:
  {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10
  },

  label:
  {
    fontSize: 16,
    marginBottom: 5
  },

  input:
  {
    height: 50,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    padding: 10,
    marginBottom: 10
  },

  pickerContainer:
  {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    marginBottom: 20
  },

  buttonContainer:
  {
    flexDirection: 'row',
    justifyContent: 'space-between'
  },

  editButton:
  {
    flex: 1,
    marginRight: 5,
    backgroundColor: '#007bff',
    padding: 10,
    borderRadius: 5
  },

  createButton:
  {
    flex: 1,
    marginLeft: 5,
    backgroundColor: '#28a745',
    padding: 10,
    borderRadius: 5
  },

  buttonText:
  {
    color: '#fff',
    textAlign: 'center'
  },

  modalContainer:
  {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)'
  },

  modalContent:
  {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 5,
    width: '90%'
  },

  modalTitle:
  {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10
  },

  modalButtons:
  {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20
  },

  cancelButton:
  {
    flex: 1,
    marginRight: 5,
    backgroundColor: '#dc3545',
    padding: 10,
    borderRadius: 5
  },

  saveButton:
    { flex: 1, marginLeft: 5, backgroundColor: '#28a745', padding: 10, borderRadius: 5 },
  readOnly: { backgroundColor: '#e9ecef' },
  editable: { backgroundColor: '#fff' },

  finalizeButton: {
    backgroundColor: '#dc3545', // Rojo para "Eliminar Paciente"
    padding: 15,
    borderRadius: 8,
    flex: 1,
    marginHorizontal: 5,
  },
  disabledButton: {
    backgroundColor: '#6c757d', // Gris para indicar deshabilitado
    opacity: 0.65,
  },

});

export default MedicalHistoryScreen;
