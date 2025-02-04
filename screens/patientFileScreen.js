import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, Alert, FlatList, TouchableOpacity, Modal } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import axios from 'axios';
import ModalComponent from 'react-native-modal';

const PatientImagesScreen = () => {
  const [patients, setPatients] = useState([]);
  const [selectedCedula, setSelectedCedula] = useState('');
  const [records, setRecords] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

  // Cargar lista de pacientes
  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const response = await axios.get('http://192.168.1.98:3001/patient');
        setPatients(response.data.data);
      } catch (error) {
        console.error('Error al cargar los pacientes:', error.message);
        Alert.alert('Error', 'No se pudieron cargar los pacientes.');
      }
    };
    fetchPatients();
  }, []);

  // Cargar imágenes del paciente
  const fetchPatientImages = async (cedula) => {
    if (!cedula) {
      setRecords([]);
      return;
    }

    try {
      const response = await axios.get(`http://192.168.1.98:3001/api/files/patient/${cedula}`);
      const data = response.data;

      if (data.length === 0) {
        Alert.alert('Aviso', 'No hay imágenes registradas para este paciente.');
        setRecords([]);
        return;
      }

      const formattedRecords = data.map(file => ({
        id: file.id || Math.random().toString(),
        fecha: new Date(file.fecha).toLocaleDateString(),
        detalle: file.detalle || "Sin detalle",
        images: [file.archivos.img1, file.archivos.img2, file.archivos.img3]
          .filter(img => img !== null && img.startsWith('data:image'))
      }));

      //console.log('Registros formateados:', formattedRecords);
      setRecords(formattedRecords);
    } catch (error) {
      console.error('Error al cargar las imágenes:', error.message);
      Alert.alert('Aviso', 'No se encontraron imágenes asociadas al paciente.');
      setRecords([]);
    }
  };

  //  Función para abrir la imagen en pantalla completa
  const openImageZoom = (imageUri) => {
    setSelectedImage(imageUri);
    setIsModalVisible(true);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Seleccionar Paciente</Text>

      {/* Dropdown para seleccionar el paciente */}
      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={selectedCedula}
          onValueChange={(value) => {
            setSelectedCedula(value);
            fetchPatientImages(value);
          }}
          style={styles.picker}
        >
          <Picker.Item label="Seleccione un paciente" value="" />
          {patients.map((patient) => (
            <Picker.Item key={patient.id_cedula} label={`${patient.nombre} ${patient.apellidos}`} value={patient.id_cedula} />
          ))}
        </Picker>
      </View>

      {/* Lista de registros con imágenes */}
      {records.length > 0 ? (
        <FlatList
          data={records}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <View style={styles.recordContainer}>
              <Text style={styles.recordTitle}>📅 {item.fecha}</Text>
              <Text style={styles.recordDetail}>📝 {item.detalle}</Text>
              
              {/* 🔹 Mostrar imágenes con TouchableOpacity para permitir zoom */}
              <View style={styles.imageGrid}>
                {item.images.length > 0 ? (
                  item.images.map((img, index) => (
                    <TouchableOpacity key={index} onPress={() => openImageZoom(img)}>
                      <Image source={{ uri: img }} style={styles.image} />
                    </TouchableOpacity>
                  ))
                ) : (
                  <Text style={styles.noImagesText}>No hay imágenes disponibles</Text>
                )}
              </View>
            </View>
          )}
        />
      ) : (
        <Text style={styles.noImagesText}>No hay imágenes disponibles</Text>
      )}

      {/*  Modal para ver imagen en pantalla completa */}
      <ModalComponent isVisible={isModalVisible} onBackdropPress={() => setIsModalVisible(false)}>
        <View style={styles.modalContent}>
          <TouchableOpacity onPress={() => setIsModalVisible(false)} style={styles.closeButton}>
            <Text style={styles.closeButtonText}>✖ Cerrar</Text>
          </TouchableOpacity>
          <Image source={{ uri: selectedImage }} style={styles.fullscreenImage} />
        </View>
      </ModalComponent>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f8f9fa',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    marginBottom: 15,
    backgroundColor: '#fff',
  },
  picker: {
    height: 50,
    color: '#333',
  },
  recordContainer: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  recordTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#007bff',
  },
  recordDetail: {
    fontSize: 16,
    color: '#333',
    marginBottom: 10,
  },
  imageGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  image: {
    width: '48%',
    aspectRatio: 1,
    margin: '1%',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  noImagesText: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
    color: '#888',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  fullscreenImage: {
    width: 300,
    height: 300,
    resizeMode: 'contain',
  },
  closeButton: {
    alignSelf: 'flex-end',
    padding: 10,
  },
  closeButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'red',
  },
});

export default PatientImagesScreen;
