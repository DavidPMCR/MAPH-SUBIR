import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Alert, ActivityIndicator, TextInput } from 'react-native';
import axios from 'axios';
import { Picker } from '@react-native-picker/picker';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';

const months = {
  enero: 1,
  febrero: 2,
  marzo: 3,
  abril: 4,
  mayo: 5,
  junio: 6,
  julio: 7,
  agosto: 8,
  septiembre: 9,
  octubre: 10,
  noviembre: 11,
  diciembre: 12,
};

const ConsultationReport = () => {
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [consultations, setConsultations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [reportType, setReportType] = useState(''); // Tipo de reporte seleccionado
  const [year, setYear] = useState('');
  const [month, setMonth] = useState('');

  const fetchPatients = async () => {
    try {
      const response = await axios.get('http://192.168.1.98:3001/patient');
      setPatients(response.data.data);
    } catch (error) {
      console.error('Error al cargar los pacientes:', error.message);
      Alert.alert('Alerta', 'No se pudieron cargar los pacientes.');
    }
  };

  const fetchConsultations = async (cedula) => {
    if (!cedula) {
      setConsultations([]); // Limpiar consultas si no hay paciente seleccionado
      return;
    }
    
    setLoading(true);
    try {
      const response = await axios.get(`http://192.168.1.98:3001/consultation/${cedula}`);
      
      if (response.data.data.length === 0) {
        setConsultations([]); // Limpiar si el paciente no tiene consultas
      } else {
        setConsultations(response.data.data);
      }
    } catch (error) {
      console.error('Error al cargar las consultas:', error.message);
      Alert.alert('Aviso', 'Paciente no posee consultas.');
      setConsultations([]); // Limpiar en caso de error
    } finally {
      setLoading(false);
    }
  };

  const generateCSVFile = async () => {
    try {
      if (reportType === 'consultations') {
        if (!consultations.length) {
          Alert.alert('Aviso', 'No hay consultas para generar el archivo.');
          return;
        }

        const keys = Object.keys(consultations[0]);
        const headers = keys.join(',') + '\n';
        const content = consultations
          .map((consulta) => keys.map((key) => consulta[key]).join(','))
          .join('\n');

        const filePath = `${FileSystem.documentDirectory}historial_consultas_${selectedPatient}.csv`;
        await FileSystem.writeAsStringAsync(filePath, headers + content, {
          encoding: FileSystem.EncodingType.UTF8,
        });
        if (await Sharing.isAvailableAsync()) await Sharing.shareAsync(filePath);

      } else if (reportType === 'monthly') {
        if (!year || !month || !months[month.toLowerCase()]) {
          Alert.alert('Error', 'Por favor ingrese un año válido y un mes válido.');
          return;
        }

        const response = await axios.get(`http://192.168.1.98:3001/report/${year}/${months[month.toLowerCase()]}`);
        const data = response.data.data;
        const keys = Object.keys(data[0]);
        const headers = keys.join(',') + '\n';
        const content = data.map((item) => keys.map((key) => item[key]).join(',')).join('\n');

        const filePath = `${FileSystem.documentDirectory}ganancias_mensuales_${year}_${months[month.toLowerCase()]}.csv`;
        await FileSystem.writeAsStringAsync(filePath, headers + content, {
          encoding: FileSystem.EncodingType.UTF8,
        });
        if (await Sharing.isAvailableAsync()) await Sharing.shareAsync(filePath);

      } else if (reportType === 'detailed') {
        if (!year || !month || !months[month.toLowerCase()]) {
          Alert.alert('Error', 'Por favor ingrese un año válido y un mes válido.');
          return;
        }

        const response = await axios.get(`http://192.168.1.98:3001/report/agrupado/${year}/${months[month.toLowerCase()]}`);
        const { detalles, total_consultas, monto_total_mensual } = response.data.data;
        const keys = Object.keys(detalles[0]);
        const headers = keys.join(',') + ',Total Consultas,Monto Total Mensual\n';
        const content = detalles
          .map((item) => keys.map((key) => item[key]).join(','))
          .join('\n') + `\nTotal Consultas:,${total_consultas},Monto Total Mensual:,${monto_total_mensual}`;

        const filePath = `${FileSystem.documentDirectory}reporte_detallado_${year}_${months[month.toLowerCase()]}.csv`;
        await FileSystem.writeAsStringAsync(filePath, headers + content, {
          encoding: FileSystem.EncodingType.UTF8,
        });
        if (await Sharing.isAvailableAsync()) await Sharing.shareAsync(filePath);
      }
    } catch (error) {
      console.error('Error al generar el archivo CSV:', error.message);
      Alert.alert('Error', 'No se pudo generar el archivo CSV.');
    }
  };

  useEffect(() => {
    fetchPatients();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Generar Reporte</Text>

      <Picker
        selectedValue={reportType}
        onValueChange={(itemValue) => setReportType(itemValue)}
        style={styles.picker}
      >
        <Picker.Item label="Seleccione un tipo de reporte" value="" />
        <Picker.Item label="Reporte de consultas por paciente" value="consultations" />
        <Picker.Item label="Ganancias totales mensuales" value="monthly" />
        <Picker.Item label="Reporte detallado tipo consulta" value="detailed" />
      </Picker>

      {reportType === 'consultations' && (
        <Picker
          selectedValue={selectedPatient}
          onValueChange={(itemValue) => {
            setSelectedPatient(itemValue);
            fetchConsultations(itemValue);
          }}
          style={styles.picker}
        >
          <Picker.Item label="Seleccione un paciente" value={null} />
          {patients.map((patient) => (
            <Picker.Item
              key={patient.id_cedula}
              label={`${patient.nombre || "Nombre"} ${patient.apellidos || "Apellido"}`}
              value={patient.id_cedula}
            />
          ))}
        </Picker>
      )}

      {reportType === 'consultations' && selectedPatient && consultations.length > 0 && (
        <FlatList
          data={consultations}
          keyExtractor={(item) => item.id_consulta.toString()}
          renderItem={({ item }) => (
            <View style={styles.consultationCard}>
              <Text>ID Consulta: {item.id_consulta}</Text>
              <Text>Tipo: {item.tipoconsulta}</Text>
              <Text>Fecha: {new Date(item.fecha_consulta).toLocaleDateString()}</Text>
              <Text>Monto: {item.monto_consulta}</Text>
            </View>
          )}
        />
      )}

      {(reportType === 'monthly' || reportType === 'detailed') && (
        <>
          <TextInput
            style={styles.input}
            placeholder="Año"
            keyboardType="numeric"
            value={year}
            onChangeText={(text) => setYear(text)}
          />
          <TextInput
            style={styles.input}
            placeholder="Mes (ej. enero)"
            value={month}
            onChangeText={(text) => setMonth(text)}
          />
        </>
      )}

      {reportType && (
        <TouchableOpacity style={styles.downloadButton} onPress={generateCSVFile}>
          <Text style={styles.buttonText}>Generar Reporte</Text>
        </TouchableOpacity>
      )}
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
  picker: {
    marginBottom: 20,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    backgroundColor: '#fff',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    marginBottom: 20,
    backgroundColor: '#fff',
  },
  consultationCard: {
    backgroundColor: '#e9ecef',
    padding: 15,
    marginBottom: 10,
    borderRadius: 8,
  },
  downloadButton: {
    backgroundColor: '#007bff',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default ConsultationReport;
