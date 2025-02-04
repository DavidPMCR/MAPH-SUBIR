import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, Modal } from 'react-native';
import { Calendar } from 'react-native-calendars';
import axios from 'axios';
import { Picker } from '@react-native-picker/picker';

const AgendaScreen = ({ navigation, route }) => {
  const { user } = route.params; // Usuario logueado pasado como parámetro
  const [selectedDate, setSelectedDate] = useState(''); // Fecha seleccionada en el calendario
  const [events, setEvents] = useState([]); // Lista de citas/eventos
  const [isModalVisible, setIsModalVisible] = useState(false); // Control del modal
  const [patients, setPatients] = useState([]); // Lista de pacientes obtenidos del backend
  const [emailPaciente, setEmailPaciente] = useState('');// email del paciente
  const [newAppointment, setNewAppointment] = useState({
    id_empresa: user.id_empresa, // ID de la empresa del usuario logueado
    id_cedula_usuario: user.id_cedula, // ID del usuario logueado
    id_cedula_paciente: '', // Paciente seleccionado
    fecha: '', // Fecha de la cita
    hora_inicio: '', // Hora inicial
    hora_final: '', // Hora final
  });

  // Función para cargar las citas desde el backend
  const fetchEvents = async () => {
    try {
      const response = await axios.get('http://192.168.1.98:3001/diary');
      const loadedEvents = response.data.data.map((event) => ({
        id: event.numero_cita.toString(),
        date: event.fecha.split('T')[0], // Solo se toma la parte de la fecha
        title: `${event.nombre_usuario} - ${event.nombre_paciente}`,
        time: `${event.hora_inicio} - ${event.hora_final}`,
      }));
      setEvents(loadedEvents);
    } catch (error) {
      console.error('Error al cargar las citas:', error.message);
      Alert.alert('Error', 'No se pudieron cargar las citas.');
    }
  };

  // Función para cargar pacientes desde el backend
  const fetchPatients = async () => {
    try {
      const response = await axios.get('http://192.168.1.98:3001/patient');
      setPatients(response.data.data); // Guardar la lista de pacientes
    } catch (error) {
      console.error('Error al cargar los pacientes:', error.message);
      Alert.alert('Error', 'No se pudieron cargar los pacientes.');
    }
  };

  // Función para guardar una nueva cita y enviar correo de confirmacion
  const handleSaveAppointment = async () => {
    const { id_cedula_paciente, fecha, hora_inicio, hora_final } = newAppointment;

    // Validar que todos los campos obligatorios estén llenos
    if (!id_cedula_paciente || !fecha || !hora_inicio || !hora_final) {
      Alert.alert(
        'Error',
        'Por favor completa todos los campos obligatorios: Paciente, Fecha, Hora Inicial y Hora Final.'
      );
      return;
    }

    try {
      const response = await axios.post('http://192.168.1.98:3001/diary', newAppointment);
      if (response.status === 200 || response.status === 201) {
        Alert.alert('Éxito', 'Cita creada exitosamente.');

        // Si el paciente tiene correo, enviamos la confirmación
        if (emailPaciente && emailPaciente !== 'Correo no registrado') {
          const emailData = {
            email: emailPaciente,
            reason: `📅 Confirmación de Cita:\n
            - 🏥 Paciente: ${patients.find(p => p.id_cedula === id_cedula_paciente)?.nombre || "Paciente"}
            - 👤 Asignado por: ${user.nombre} ${user.apellidos}
            - 📆 Fecha: ${fecha}
            - ⏰ Horario: ${hora_inicio} - ${hora_final}`
          };

          await axios.post('http://192.168.1.98:3001/sendEmail/cita', emailData)
            .then(() => {
              Alert.alert('Correo Enviado', 'Se ha enviado la confirmación al correo del paciente.');
              console.log('Correo enviado correctamente');
            })
            .catch(error => {
              console.error('Error al enviar correo:', error.message);
              Alert.alert('Error', 'No se pudo enviar el correo de confirmación.');
            });
        } else {
          console.log('Paciente sin correo registrado. No se envió confirmación.');
        }

        // Limpiar los campos del modal después de guardar
        setNewAppointment({
          id_empresa: user.id_empresa,
          id_cedula_usuario: user.id_cedula,
          id_cedula_paciente: '',
          fecha: '',
          hora_inicio: '',
          hora_final: '',

        });
        setEmailPaciente(''); // Se limpia el correo aquí
        setIsModalVisible(false); // Cerrar el modal
        fetchEvents(); // Recargar las citas
      }
    } catch (error) {
      console.error('Error al crear la cita:', error.message);
      Alert.alert('Error', 'No se pudo crear la cita. Verifica los datos.');
    }
  };


  // Función para eliminar una cita
  const handleDeleteAppointment = async (id) => {
    Alert.alert(
      'Confirmar eliminación',
      '¿Estás seguro de que deseas eliminar esta cita?',
      [
        {
          text: 'Cancelar',
          style: 'cancel', // Botón de cancelar
        },
        {
          text: 'Eliminar',
          style: 'destructive', // Botón de eliminar (rojo en iOS)
          onPress: async () => {
            try {
              const response = await axios.delete(`http://192.168.1.98:3001/diary/${id}`);
              if (response.status === 200) {
                Alert.alert('Éxito', 'La cita ha sido eliminada.');
                fetchEvents(); // Recargar las citas después de eliminar
              }
            } catch (error) {
              console.error('Error al eliminar la cita:', error.message);
              Alert.alert('Error', 'No se pudo eliminar la cita. Inténtalo nuevamente.');
            }
          },
        },
      ]
    );
  };


  // Función para manejar la selección de fecha en el calendario
  const handleDatePress = (date) => {
    setSelectedDate(date); // Establecer la fecha seleccionada
    setNewAppointment({
      ...newAppointment,
      fecha: date, // Actualizar la fecha en la nueva cita
    });
  };

  // Renderizar cada evento/cita del día seleccionado
  const renderEventItem = ({ item }) => {
    if (item.date === selectedDate) {
      // "NombreUsuario - NombrePaciente ApellidosPaciente"
      const [assignedUser, patientInfo] = item.title.split(' - ');
      const [patientFirstName, ...patientLastNames] = patientInfo.split(' '); // Divide en nombre y apellidos

      return (
        <TouchableOpacity
          style={styles.eventItem}
          onPress={() => navigation.navigate('createConsultationScreen', { user })}
        >
          <View style={styles.eventInfo}>
            <Text style={styles.eventTitle}>Asignado: {assignedUser}</Text>
            <Text style={styles.eventTitle}>
              Paciente: {patientFirstName} {patientLastNames.join(' ')} {/* Incluye los apellidos */}
            </Text>
            <Text style={styles.eventTime}>Hora: {item.time}</Text>
          </View>
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => handleDeleteAppointment(item.id)}
          >
            <Text style={styles.deleteButtonText}>Eliminar</Text>
          </TouchableOpacity>
        </TouchableOpacity>
      );
    }
    return null;
  };


  // Cargar eventos y pacientes al montar el componente
  useEffect(() => {
    fetchEvents();
    fetchPatients();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Agenda</Text>

      {/* Calendario */}
      <Calendar
        onDayPress={(day) => handleDatePress(day.dateString)}
        markedDates={{
          [selectedDate]: { selected: true, selectedColor: '#007bff' },
          ...events.reduce((acc, event) => {
            acc[event.date] = { marked: true, dotColor: '#007bff' };
            return acc;
          }, {}),
        }}
        theme={{
          selectedDayBackgroundColor: '#007bff',
          todayTextColor: '#007bff',
          arrowColor: '#007bff',
        }}
      />

      {/* Lista de eventos */}
      <FlatList
        data={events}
        renderItem={renderEventItem}
        keyExtractor={(item) => item.id}
        style={styles.eventList}
        ListEmptyComponent={
          selectedDate && (
            <Text style={styles.noEventsText}>No hay eventos para esta fecha.</Text>
          )
        }
      />

      {/* Botón para crear nueva cita-modal */}
      <TouchableOpacity style={styles.addButton} onPress={() => setIsModalVisible(true)}>
        <Text style={styles.addButtonText}>Crear Cita</Text>
      </TouchableOpacity>

      {/* Modal para crear cita */}
      <Modal visible={isModalVisible} transparent={true} animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Nueva Cita</Text>

            {/* Campo de paciente */}
            <Text>Paciente:</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={newAppointment.id_cedula_paciente}
                onValueChange={(itemValue) => {
                  const selectedPatient = patients.find(patient => patient.id_cedula === itemValue);
                  setNewAppointment({ ...newAppointment, id_cedula_paciente: itemValue });
                  setEmailPaciente(selectedPatient?.correo || 'Correo no registrado'); // Mostrar el correo o "Correo no registrado"
                }}
              >
                <Picker.Item label="Selecciona un paciente" value="" />
                {patients.map((patient) => (
                  <Picker.Item
                    key={patient.id_cedula}
                    label={`${patient.nombre} ${patient.apellidos} (cc: ${patient.conocido_como})`}
                    value={patient.id_cedula}
                  />
                ))}
              </Picker>
            </View>

            {/* Campo de correo electrónico */}
            <Text>Correo Electrónico:</Text>
            <View style={styles.emailContainer}>
              <Text style={[styles.emailText, !emailPaciente && styles.placeholder]}>
                {emailPaciente || "Correo Electrónico"}
              </Text>
            </View>

            {/* Campo de hora inicial */}
            <Text>Hora Inicial:</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={newAppointment.hora_inicio}
                onValueChange={(itemValue) =>
                  setNewAppointment({ ...newAppointment, hora_inicio: itemValue })
                }
              >
                <Picker.Item label="Selecciona la hora inicial" value="" />
                {Array.from({ length: 24 }, (_, i) => (
                  <Picker.Item key={i} label={`${i}:00`} value={`${i}:00`} />
                ))}
              </Picker>
            </View>

            {/* Campo de hora final */}
            <Text>Hora Final:</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={newAppointment.hora_final}
                onValueChange={(itemValue) =>
                  setNewAppointment({ ...newAppointment, hora_final: itemValue })
                }
              >
                <Picker.Item label="Selecciona la hora final" value="" />
                {Array.from({ length: 24 }, (_, i) => (
                  <Picker.Item key={i} label={`${i}:00`} value={`${i}:00`} />
                ))}
              </Picker>
            </View>

            {/* Botones del modal */}
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setIsModalVisible(false)}
              >
                <Text style={styles.buttonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.saveButton}
                onPress={handleSaveAppointment}
              >
                <Text style={styles.buttonText}>Guardar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  eventList: {
    marginTop: 20,
  },
  eventItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#e0f7fa',
    borderRadius: 8,
    marginBottom: 10,
  },
  eventInfo: {
    flex: 1,
  },
  deleteButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#dc3545',
    borderRadius: 8,
  },
  deleteButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  noEventsText: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
    color: '#888',
  },
  addButton: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#28a745',
    borderRadius: 8,
    alignItems: 'center',
  },
  addButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    width: '80%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    marginBottom: 10,
    backgroundColor: '#fff',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  cancelButton: {
    backgroundColor: '#dc3545',
    padding: 15,
    borderRadius: 8,
    width: '48%',
  },
  saveButton: {
    backgroundColor: '#28a745',
    padding: 15,
    borderRadius: 8,
    width: '48%',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center',
  },

  emailContainer: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
    backgroundColor: '#fff',
  },
  emailText: {
    fontSize: 16,
    color: '#333',
  },
});

export default AgendaScreen;
