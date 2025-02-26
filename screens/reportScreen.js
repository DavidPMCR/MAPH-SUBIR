import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, TextInput } from 'react-native';
import axios from 'axios';
import { Picker } from '@react-native-picker/picker';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import API from '../controller/API';

const months = {  
  enero: 1, febrero: 2, marzo: 3, abril: 4, mayo: 5, junio: 6, 
  julio: 7, agosto: 8, septiembre: 9, octubre: 10, noviembre: 11, diciembre: 12,
};

const ConsultationReport = ({ route }) => {
  const { user } = route.params;
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [consultations, setConsultations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [reportType, setReportType] = useState('');
  const [year, setYear] = useState('');
  const [month, setMonth] = useState('');

  const fetchPatients = async () => {
    try {
      const response = await axios.get(`${API}/patient/empresa/${user.id_empresa}`);
      setPatients(response.data.data || []);
    } catch (error) {
      console.error('❌ Error al cargar los pacientes:', error.message);
      Alert.alert('Error', 'No se pudieron cargar los pacientes.');
      setPatients([]);
    }
  };

  const fetchConsultations = async (cedula) => {
    if (!cedula) {
      setConsultations([]);
      return;
    }
    
    setLoading(true);
    try {
      const response = await axios.get(`${API}/consultation/${cedula}`);
      setConsultations(response.data.data || []);
    } catch (error) {
      console.error('Error al cargar las consultas:', error.message);
      Alert.alert('Aviso', 'Paciente no posee consultas.');
      setConsultations([]);
    } finally {
      setLoading(false);
    }
  };

  const generateCSVFile = async () => {
    try {
        if (!reportType) {
            Alert.alert("Error", "Seleccione un tipo de reporte.");
            return;
        }

        if (reportType === 'consultations') {
            if (!consultations.length) {
                Alert.alert('Aviso', 'No hay consultas para generar el archivo.');
                return;
            }

            const keys = Object.keys(consultations[0]);
            const headers = keys.join(',') + '\n';
            const content = consultations.map((consulta) => keys.map((key) => consulta[key]).join(',')).join('\n');

            const filePath = `${FileSystem.documentDirectory}historial_consultas_${selectedPatient}.csv`;
            await FileSystem.writeAsStringAsync(filePath, headers + content, { encoding: FileSystem.EncodingType.UTF8 });
            
            if (await Sharing.isAvailableAsync()) {
                await Sharing.shareAsync(filePath);
                Alert.alert("✅ Éxito", "El reporte se generó correctamente.");
            }

        } else if (reportType === 'monthly' || reportType === 'detailed') {
            if (!year || !month || !months[month]) {
                Alert.alert('', 'Por favor ingrese un año válido y seleccione un mes.');
                return;
            }

            const url = reportType === 'monthly' 
                ? `${API}/report/${year}/${months[month]}/${user.id_empresa}`
                : `${API}/report/agrupado/${year}/${months[month]}/${user.id_empresa}`;

            const response = await axios.get(url);
            const reportData = response.data.data;

            if (!reportData || (Array.isArray(reportData) && reportData.length === 0)) {
                console.error("❌ La API no devolvió datos válidos:", response.data);
                Alert.alert("Error", "No se recibieron datos del servidor.");
                return;
            }

            const reportObject = Array.isArray(reportData) ? reportData[0] : reportData;
            const { anio, mes, total_consultas, monto_total_mensual, detalles } = reportObject;

            console.log(`✅ Datos obtenidos: Año ${anio}, Mes ${mes}, Consultas ${total_consultas}, Monto Total ${monto_total_mensual}`);

            let headers, content;
            if (detalles && Array.isArray(detalles) && detalles.length > 0) {
                const keys = Object.keys(detalles[0]);
                headers = keys.join(',') + ',Total Consultas,Monto Total Mensual\n';
                content = detalles.map((item) => keys.map((key) => item[key]).join(',')).join('\n') + 
                          `\nTotal Consultas:,${total_consultas},Monto Total Mensual:,${monto_total_mensual}`;
            } else {
                headers = "anio,mes,total_consultas,monto_total_mensual\n";
                content = `${anio},${mes},${total_consultas},${monto_total_mensual}`;
            }

            const filePath = `${FileSystem.documentDirectory}reporte_${reportType}_${anio}_${mes}.csv`;
            await FileSystem.writeAsStringAsync(filePath, headers + content, { encoding: FileSystem.EncodingType.UTF8 });

            if (await Sharing.isAvailableAsync()) {
                await Sharing.shareAsync(filePath);
                Alert.alert("✅ Éxito", "El reporte se generó correctamente.");
            }
        }
    } catch (error) {
        console.error('Error al generar el archivo CSV:', error.message);
        Alert.alert('❌ Error', 'No se pudo generar el archivo de reporte verique que año o mes sean correctos o posean consultas.');
    }
};


  useEffect(() => {
    fetchPatients();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Generar Reporte</Text>

      <Picker selectedValue={reportType} onValueChange={(itemValue) => setReportType(itemValue)} style={styles.picker}>
        <Picker.Item label="Seleccione un tipo de reporte" value="" />
        <Picker.Item label="Reporte de consultas por paciente" value="consultations" />
        <Picker.Item label="Ganancias totales mensuales" value="monthly" />
        <Picker.Item label="Reporte detallado tipo consulta" value="detailed" />
      </Picker>

      {reportType === 'consultations' && (
        <Picker selectedValue={selectedPatient} onValueChange={(itemValue) => {
          setSelectedPatient(itemValue);
          fetchConsultations(itemValue);
        }} style={styles.picker}>
          <Picker.Item label="Seleccione un paciente" value={null} />
          {patients.map((patient) => (
            <Picker.Item key={patient.id_cedula} label={`${patient.nombre} ${patient.apellidos}`} value={patient.id_cedula} />
          ))}
        </Picker>
      )}

      {(reportType === 'monthly' || reportType === 'detailed') && (
        <>
          <TextInput 
            style={styles.input} 
            placeholder="Año" 
            keyboardType="numeric" 
            value={year} 
            onChangeText={setYear} 
          />

          <Picker 
            selectedValue={month} 
            onValueChange={(itemValue) => setMonth(itemValue)} 
            style={styles.picker}
          >
            <Picker.Item label="Seleccione un mes" value="" />
            {Object.keys(months).map((monthName) => (
              <Picker.Item key={monthName} label={monthName} value={monthName} />
            ))}
          </Picker>
          
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
  container: { flex: 1, padding: 20, backgroundColor: '#f8f9fa' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  picker: { marginBottom: 20, backgroundColor: '#fff' },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 10, marginBottom: 20, backgroundColor: '#fff' },
  downloadButton: { backgroundColor: '#007bff', padding: 15, borderRadius: 8, alignItems: 'center', marginTop: 20 },
  buttonText: { color: '#fff', fontWeight: 'bold' },
});

export default ConsultationReport;
