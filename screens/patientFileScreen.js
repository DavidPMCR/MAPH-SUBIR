import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, Alert, FlatList, TouchableOpacity } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import axios from 'axios';
import ModalComponent from 'react-native-modal';
import { Ionicons } from '@expo/vector-icons'; // Importamos iconos
import API from '../controller/API';

const PatientImagesScreen = ({ route }) => {
  const { user } = route.params;
  const [patients, setPatients] = useState([]);
  const [selectedCedula, setSelectedCedula] = useState('');
  const [records, setRecords] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

  // Cargar lista de pacientes
  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const response = await axios.get(`${API}/patient/empresa/${user.id_empresa}`);
    
        // 🔹 Verificamos si response.data y response.data.data existen
        if (response.data && Array.isArray(response.data.data) && response.data.data.length > 0) {
          setPatients(response.data.data); // ✅ Si hay pacientes, los guardamos
        } else {
          setPatients([]); // 🔹 Si no hay pacientes, aseguramos que `patients` sea un array vacío
        }
      } catch (error) {
        console.error('❌ Error al cargar los pacientes:', error.message);
        Alert.alert('Error', 'No se pudieron cargar los pacientes.');
        setPatients([]); // 🔹 Si hay un error, evitamos que `patients` sea `undefined`
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
      const response = await axios.get(`${API}/api/files/patient/${cedula}`);
      const data = response.data;
  
     // console.log("🔍 Registros obtenidos del backend:", data); // 🔍 Debugging
  
      if (data.length === 0) {
        Alert.alert("Aviso", "No hay imágenes registradas para este paciente.");
        setRecords([]);
        return;
      }
  
      const formattedRecords = data.map(file => ({
        id: file.id || Math.random().toString(),
        id_registro: file.id_registro || "ID NO ENCONTRADO", // 🔹 Verificar si id_registro está presente
        fecha: new Date(file.fecha).toLocaleDateString(),
        detalle: file.detalle || "Sin detalle",
        images: [file.archivos.img1, file.archivos.img2, file.archivos.img3]
          .filter(img => img !== null && img.startsWith("data:image"))
          .map((img, index) => ({ uri: img, id: `${file.id_registro || "NO_ID"}_${index}` })) // Si no hay ID, mostrar "NO_ID"
      }));
  
      console.log("📌 Registros formateados:", formattedRecords); // 🔍 Debugging
      setRecords(formattedRecords);
    } catch (error) {
      console.error("❌ Error al cargar las imágenes:", error.message);
      Alert.alert("Aviso", "No se encontraron imágenes asociadas al paciente.");
      setRecords([]);
    }
  };
  
  const handleDeleteImage = async (id_registro) => {
    if (!id_registro || isNaN(id_registro)) {
      Alert.alert("Error", "ID de registro inválido.");
      return;
    }
  
    Alert.alert(
      "Confirmar eliminación",
      `¿Estás seguro de que deseas eliminar los archivos...ya que estan asociados a un grupo de maximo 3 y si eliminas 1 los restantes 2 tambien se eliminan ?`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: async () => {
            try {
             // console.log(`🗑 Enviando solicitud para eliminar archivo con ID: ${id_registro}`); // 🔍 Debugging
  
              const response = await axios.delete(`${API}/api/files/${id_registro}`);
  
              //console.log("✅ Respuesta del backend:", response.data); // 🔍 Debugging
  
              if (response.status === 200 && response.data.code === "200") {
                Alert.alert("Éxito", "Archivo eliminado correctamente.");
                fetchPatientImages(selectedCedula); // 🔄 Recargar imágenes después de eliminar
              } else {
                Alert.alert("Error", response.data.message || "No se pudo eliminar el archivo.");
              }
            } catch (error) {
              console.error("❌ Error al eliminar archivo:", error.response?.data || error.message);
  
              if (error.response?.status === 400) {
                Alert.alert("Error", "ID de registro inválido.");
              } else if (error.response?.status === 404) {
                Alert.alert("Error", "Archivo no encontrado.");
              } else {
                Alert.alert("Error", "No se pudo eliminar el archivo.");
              }
            }
          },
        },
      ]
    );
  };
  
  

  // Función para abrir la imagen en pantalla completa
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

              {/* Mostrar imágenes con TouchableOpacity y opción de eliminar */}
              <View style={styles.imageGrid}>
                {item.images.length > 0 ? (
                  item.images.map((img) => (
                    <View key={img.id} style={styles.imageWrapper}>
                      <TouchableOpacity onPress={() => openImageZoom(img.uri)}>
                        <Image source={{ uri: img.uri }} style={styles.image} />
                      </TouchableOpacity>
                      <TouchableOpacity style={styles.deleteButton} onPress={() => handleDeleteImage(item.id_registro)}>
                        <Ionicons name="trash-outline" size={20} color="red" />
                      </TouchableOpacity>
                    </View>
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

      {/* Modal para ver imagen en pantalla completa */}
  {/* Modal para ver imagen en pantalla completa */}
<ModalComponent isVisible={isModalVisible} onBackdropPress={() => setIsModalVisible(false)}>
  <View style={styles.modalContent}>
    {/* Botón de cerrar en la parte superior */}
    <TouchableOpacity onPress={() => setIsModalVisible(false)} style={styles.closeButton}>
      <Ionicons name="close-circle" size={35} color="white" />
    </TouchableOpacity>

    {/* Imagen con zoom */}
    <Image 
      source={{ uri: selectedImage }} 
      style={styles.fullscreenImage} 
      resizeMode="contain"
    />
  </View>
</ModalComponent>

    </View>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    padding: 20, 
    backgroundColor: '#f8f9fa' 
  },
  title: { 
    fontSize: 22, 
    fontWeight: 'bold', 
    marginBottom: 10, 
    textAlign: 'center' 
  },
  pickerContainer: { 
    borderWidth: 1, 
    borderColor: '#ccc', 
    borderRadius: 8, 
    marginBottom: 15, 
    backgroundColor: '#fff' 
  },
  picker: { 
    height: 50, 
    color: '#333' 
  },
  recordContainer: { 
    backgroundColor: '#fff', 
    padding: 15, 
    borderRadius: 10, 
    marginBottom: 15 
  },
  recordTitle: { 
    fontSize: 18, 
    fontWeight: 'bold', 
    marginBottom: 5, 
    color: '#007bff' 
  },
  recordDetail: { 
    fontSize: 16, 
    color: '#333', 
    marginBottom: 10 
  },
  imageGrid: { 
    flexDirection: 'row', 
    flexWrap: 'wrap', 
    justifyContent: 'center' // 🔹 Centra las imágenes
  },
  imageWrapper: { 
    position: 'relative', 
    margin: 5 // 🔹 Mejor separación entre imágenes
  },
  image: { 
    width: 100, 
    height: 100, 
    borderRadius: 8 
  },
  deleteButton: { 
    position: 'absolute', 
    top: -5, 
    right: -5, 
    backgroundColor: 'white', 
    borderRadius: 50, 
    padding: 5 
  },
  noImagesText: { 
    textAlign: 'center', 
    marginTop: 20, 
    fontSize: 16, 
    color: '#888' 
  },

  // 🔥 NUEVOS ESTILOS PARA EL MODAL Y ZOOM 🔥
  modalContent: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)', // 🔹 Fondo oscuro para mejor visibilidad
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  fullscreenImage: {
    width: '100%', 
    height: '80%', // 🔹 Espacio para el botón de cerrar
    resizeMode: 'contain', // 🔹 Mantiene la proporción correcta
  },
  closeButton: {
    position: 'absolute',
    top: 20, // 🔹 Asegura que esté en la parte superior
    right: 20, 
    zIndex: 10, // 🔹 Se asegura que esté por encima de la imagen
    backgroundColor: 'rgba(0,0,0,0.5)', // 🔹 Fondo semitransparente para mejor visibilidad
    borderRadius: 50,
    padding: 5,
  },
});


export default PatientImagesScreen;
