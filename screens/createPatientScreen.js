import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Modal, Alert } from 'react-native';
import axios from 'axios';
import { Picker } from '@react-native-picker/picker';

const CreatePatientScreen = ({ route }) => {
  const { user } = route.params; // Usuario logueado
  const [formData, setFormData] = useState({
    id_cedula: '',
    tipo_cedula: '',
    id_empresa: user.id_empresa,
    nombre: '',
    apellidos: '',
    conocido_como: '',
    correo: '',
    telefono: '',
    telefono_emergencia: '',
    residencia: '',
    observaciones: ''
  });

  const [isEditing, setIsEditing] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [patients, setPatients] = useState([]); // Lista de pacientes
  const [selectedPatient, setSelectedPatient] = useState(''); // Paciente seleccionado

  // Cargar pacientes
  const fetchPatients = async () => {
    try {
      const response = await axios.get('http://192.168.1.98:3001/patient');
      setPatients(response.data.data);
    } catch (error) {
      console.error('Error al cargar los pacientes:', error.message);
      Alert.alert('Error', 'No se pudieron cargar los pacientes.');
    }
  };

  // Manejar la selección de un paciente desde el combo box
  const handleSelectPatient = (id_cedula) => {
    setSelectedPatient(id_cedula);

    // Si se selecciona un valor en blanco, limpiar el formulario
    if (!id_cedula) {
      setFormData({
        id_cedula: '',
        tipo_cedula: '',
        id_empresa: user.id_empresa,
        nombre: '',
        apellidos: '',
        conocido_como: '',
        correo: '',
        telefono: '',
        telefono_emergencia: '',
        residencia: '',
        observaciones: '',
      });
      setIsEditing(false); // Deshabilitar modo de edición si está activo
      return;
    }

    // Cargar los datos del paciente seleccionado
    const patient = patients.find((p) => p.id_cedula === id_cedula);
    if (patient) {
      setFormData({ ...patient });
      setIsEditing(false);
    }
  };


  // Guardar paciente actualizado
  const handleSavePatient = async () => {
    try {
      // Validar campos obligatorios
      if (
        !formData.id_cedula ||
        !formData.tipo_cedula ||
        !formData.nombre ||
        !formData.apellidos
      ) {
        Alert.alert('Error', 'Por favor complete todos los campos obligatorios.');
        console.log('Error: Campos obligatorios incompletos', formData);
        return;
      }

      // Construir el payload en el formato requerido
      const payload = {
        id_cedula: formData.id_cedula,
        tipo_cedula: formData.tipo_cedula,
        id_empresa: formData.id_empresa,
        nombre: formData.nombre,
        apellidos: formData.apellidos,
        conocido_como: formData.conocido_como || '', // Valor por defecto si está vacío
        correo: formData.correo || 'no posee',
        telefono: formData.telefono || '0',
        telefono_emergencia: formData.telefono_emergencia || '0',
        residencia: formData.residencia || '',
        observaciones: formData.observaciones || 'ninguna',
      };

    

      // Llamada al backend
      const response = await axios.patch(`http://192.168.1.98:3001/patient`, payload);

      // Verificar la respuesta del servidor
     // console.log('Respuesta del servidor:', response);

      if (response.status === 200 || response.status === 201) {
        Alert.alert('Éxito', 'Paciente actualizado correctamente.');
        setIsEditing(false);
        setFormData({
          id_cedula: '',
          tipo_cedula: '',
          id_empresa: user.id_empresa,
          nombre: '',
          apellidos: '',
          conocido_como: '',
          correo: '',
          telefono: '',
          telefono_emergencia: '',
          residencia: '',
          observaciones: '',
        });
        fetchPatients(); // Recargar la lista de pacientes
      } else {
        console.log('Error: Respuesta inesperada del servidor', response);
        throw new Error('Respuesta inesperada del servidor.');
      }
    } catch (error) {
      console.error('Error al actualizar el paciente:', error.message);
      console.log('Detalles del error:', error.response || error);
      Alert.alert('Error', 'No se pudo actualizar el paciente.');
    }
  };

  // Eliminar paciente
  const handleDeletePatient = async () => {
    try {
      if (!formData.id_cedula) {
        Alert.alert('Error', 'No hay paciente seleccionado para eliminar.');
        return;
      }

      // Mostrar alerta de confirmación
      Alert.alert(
        'Confirmar Eliminación',
        '¿Está seguro de que desea eliminar este paciente?',
        [
          { text: 'Cancelar', style: 'cancel' }, // Botón para cancelar
          {
            text: 'Eliminar',
            onPress: async () => {
              try {
                const response = await axios.delete(
                  `http://192.168.1.98:3001/patient/${formData.id_cedula}`
                );
                console.log('Respuesta del servidor al eliminar paciente:', response);

                if (response.status === 200 || response.status === 201) {
                  Alert.alert('Éxito', 'Paciente eliminado correctamente.');
                  // Limpiar formulario después de eliminar
                  setFormData({
                    id_cedula: '',
                    tipo_cedula: '',
                    id_empresa: user.id_empresa,
                    nombre: '',
                    apellidos: '',
                    conocido_como: '',
                    correo: '',
                    telefono: '',
                    telefono_emergencia: '',
                    residencia: '',
                    observaciones: '',
                  });
                  fetchPatients(); // Recargar la lista de pacientes
                } else {
                  throw new Error('Error inesperado en la eliminación del paciente.');
                }
              } catch (error) {
                console.error('Error al eliminar el paciente:', error.message);
                Alert.alert('Error', 'No se pudo eliminar el paciente.');
              }
            },
          },
        ],
        { cancelable: true } // Permite cerrar la alerta sin seleccionar una opción
      );
    } catch (error) {
      console.error('Error al eliminar el paciente:', error.message);
      Alert.alert('Error', 'No se pudo eliminar el paciente.');
    }
  };



  // Crear nuevo paciente
  const handleCreatePatient = async () => {
    try {
      if (!formData.id_cedula || !formData.nombre || !formData.apellidos || !formData.tipo_cedula) {
        Alert.alert('Error', 'Por favor complete todos los campos obligatorios.');
        return;
      }

      await axios.post('http://192.168.1.98:3001/patient/', formData);
      Alert.alert('Paciente creado exitosamente.');

      setFormData({
        id_cedula: '',
        tipo_cedula: '',
        id_empresa: user.id_empresa,
        nombre: '',
        apellidos: '',
        conocido_como: '',
        correo: '',
        telefono: '',
        telefono_emergencia: '',
        residencia: '',
        observaciones: '',
      }); // Limpiar formulario
      setIsModalVisible(false);
      fetchPatients(); // Recargar pacientes
    } catch (error) {
      console.error('Error al crear el paciente:', error.message);
      Alert.alert('Error', 'No se pudo crear el paciente.');
    }
  };

  useEffect(() => {
    fetchPatients();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Gestión de Pacientes</Text>

      {/* Combo Box para seleccionar pacientes */}
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

      {/* Formulario de paciente */}
      <ScrollView>
        {Object.entries({
        
          id_cedula: 'Cédula',
          tipo_cedula: 'Tipo de Cédula',
          nombre: 'Nombre',
          apellidos: 'Apellidos',
          conocido_como: 'Conocido como',
          correo: 'Correo',
          telefono: 'Teléfono',
          telefono_emergencia: 'Teléfono de Emergencia',
          residencia: 'Residencia',
          observaciones: 'Observaciones',
        }).map(([key, label]) => (
          <TextInput
            key={key}
            style={[styles.input, isEditing ? styles.editable : styles.readOnly]}
            value={formData[key]}
            editable={isEditing}
            onChangeText={(value) => setFormData({ ...formData, [key]: value })}
            placeholder={label}
          />
        ))}
      </ScrollView>


      {/* Botones */}
      <View style={styles.buttonContainer}>
        {/* Botón para editar paciente */}
        <TouchableOpacity
          style={[
            styles.editButton,
            !formData.id_cedula && styles.disabledButton, // Deshabilitar si no hay datos
          ]}
          onPress={() => setIsEditing((prev) => !prev)} // Alternar modo edición
          disabled={!formData.id_cedula} // Deshabilitar si no hay datos del paciente
        >
          <Text style={styles.buttonText}>{isEditing ? 'Cancelar Edición' : 'Editar Paciente'}</Text>
        </TouchableOpacity>

        {/* Botón para finalizar edición o eliminar paciente */}
        <TouchableOpacity
          style={[
            isEditing ? styles.saveButton : styles.finalizeButton, // Cambiar estilo según el estado
            !formData.id_cedula && styles.disabledButton, // Deshabilitar si no hay datos
          ]}
          onPress={
            isEditing ? handleSavePatient : handleDeletePatient // Guardar cambios o eliminar
          }
          disabled={!formData.id_cedula} // Deshabilitar si no hay datos del paciente
        >
          <Text style={styles.buttonText}>
            {isEditing ? 'Finalizar Edición' : 'Eliminar Paciente'}
          </Text>
        </TouchableOpacity>

        {/* Botón para crear paciente */}
        <TouchableOpacity
          style={[
            styles.createButton,
            formData.id_cedula && styles.disabledButton, // Deshabilitar si hay datos
          ]}
          onPress={() => setIsModalVisible(true)} // Mostrar modal para crear paciente
          disabled={!!formData.id_cedula} // Deshabilitar si ya hay datos de un paciente seleccionado
        >
          <Text style={styles.buttonText}>Crear Paciente</Text>
        </TouchableOpacity>
      </View>



      {/* Modal */}
      <Modal visible={isModalVisible} transparent={true} animationType="slide">
        <View style={styles.modalContainer}>
          <ScrollView contentContainerStyle={styles.modalContent}>
            <Text style={styles.modalTitle}>Nuevo Paciente</Text>

            {/* Campo Cédula */}
            <TextInput
              style={styles.input}
              value={formData.id_cedula}
              onChangeText={(value) => setFormData({ ...formData, id_cedula: value })}
              placeholder="Cédula*"
            />

            {/*  Tipo de Cédula (Picker) DEBAJO de "Cédula" */}
            <Text style={styles.label}>Tipo de Cédula*</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={formData.tipo_cedula}
                onValueChange={(value) => setFormData({ ...formData, tipo_cedula: value })}
                mode="dropdown"
              >
                <Picker.Item label="Tipo de cédula" value="" />
                <Picker.Item label="Físico Nacional" value="N" />
                <Picker.Item label="Extranjero" value="E" />
                <Picker.Item label="Nacionalizado" value="NA" />
                <Picker.Item label="Pasaporte" value="P" />
              </Picker>
            </View>

            {/*  Campos de texto restantes */}
            {Object.entries({
              nombre: 'Nombre*',
              apellidos: 'Apellidos*',
              conocido_como: 'Conocido como',
              correo: 'Correo',
              telefono: 'Teléfono',
              telefono_emergencia: 'Teléfono de Emergencia',
              residencia: 'Residencia',
              observaciones: 'Observaciones',
            }).map(([key, label]) => (
              <TextInput
                key={key}
                style={styles.input}
                value={formData[key]}
                onChangeText={(value) => setFormData({ ...formData, [key]: value })}
                placeholder={label}
              />
            ))}

            {/*Botones */}
            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.cancelButton} onPress={() => setIsModalVisible(false)}>
                <Text style={styles.buttonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveButton} onPress={handleCreatePatient}>
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

export default CreatePatientScreen;
