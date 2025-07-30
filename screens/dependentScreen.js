import React, { useState, useEffect } from "react";
import { View, Text, TextInput, FlatList, TouchableOpacity, Modal, StyleSheet, Alert } from "react-native";
import axios from "axios";
import { FontAwesome } from "@expo/vector-icons";
import  API from '../controller/API';

const DependentScreen = ({ route, navigation }) => {
    const { id_empresa } = route.params;
    const [dependientes, setDependientes] = useState([]);
    const [modalVisible, setModalVisible] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [selectedDependiente, setSelectedDependiente] = useState(null);
    const [newDependiente, setNewDependiente] = useState({
        id_cedula: "",
        nombre: "",
        contrasena: ""
    });

    useEffect(() => {
        fetchDependientes();
    }, []);

    const fetchDependientes = async () => {
        try {
            const response = await axios.get(`${API}/user/dependientes/${id_empresa}`);
            setDependientes(response.data.data);
        } catch (error) {
            console.error("Error cargando dependientes:", error.message);
            
        }
        
    };

    const handleAddDependiente = async () => {
        try {
            console.log("Datos enviados:", {
                ...newDependiente,
                id_empresa,
                rol: "D"
            });
    
            const response = await axios.post(`${API}/user`, {
                ...newDependiente,
                id_empresa,
                rol: "D"
            });
    
            if (response.data && response.data.code === "500") {
                Alert.alert("Error", response.data.data);
            } else {
                console.log("Respuesta del servidor:", response.data);
                setModalVisible(false);
                fetchDependientes();
                Alert.alert("Éxito", "Dependiente agregado");
            }
        } catch (error) {
            console.error("Error agregando dependiente:", error.message);
    
            if (error.response) {
                console.error("Error del servidor:", error.response.data);
                if (error.response.status === 500) {
                    Alert.alert("Error", "Máximo de dependientes agregados");
                }
            }
        }
    };
    

    const handleUpdateDependiente = async () => {
        if (!newDependiente.contrasena) {
            Alert.alert("Error", "La contraseña no puede estar en blanco");
            return;
        }

        try {
            await axios.patch(`${API}/auth/change-password`, {
                id_cedula: selectedDependiente.id_cedula,
                contrasena: newDependiente.contrasena
            });

            setModalVisible(false);
            fetchDependientes();
            Alert.alert("Éxito", "Dependiente actualizado");
        } catch (error) {
            console.error("Error actualizando dependiente:", error.message);
        }
    };

    const handleDeleteDependiente = async (id_cedula) => {
        Alert.alert(
            "Confirmación",
            "¿Estás seguro que deseas eliminar este dependiente?",
            [
                { text: "Cancelar", style: "cancel" },
                {
                    text: "Eliminar",
                    onPress: async () => {
                        try {
                            const response = await axios.delete(`${API}/user/delete/adm/${id_cedula}`);
    
                            if (response.status === 200) {
                                // 🔹 Actualiza la lista de dependientes después de eliminar
                                setDependientes((prevDependientes) =>
                                    prevDependientes.filter(dependiente => dependiente.id_cedula !== id_cedula)
                                );
    
                                Alert.alert("Éxito", "Dependiente eliminado");
                            } else {
                                Alert.alert("Error", "No se pudo eliminar el dependiente");
                            }
                        } catch (error) {
                            console.error("❌ Error eliminando dependiente:", error.message);
                            Alert.alert("Error", "Hubo un problema al eliminar el dependiente");
                        }
                    },
                    style: "destructive"
                }
            ]
        );
    };
    
   
    const openEditModal = (dependiente) => {
        setSelectedDependiente(dependiente);
        setNewDependiente({
            id_cedula: dependiente.id_cedula,
            nombre: dependiente.nombre,
            contrasena: ""
        });
        setIsEditing(true);
        setModalVisible(true);
    };

    const closeModal = () => {
        setModalVisible(false);
        setIsEditing(false);
        setNewDependiente({
            id_cedula: "",
            nombre: "",
            contrasena: ""
        });
    };

    return (
        <View style={styles.container}>
        <Text style={styles.title}>Dependientes</Text>
    
        {/* 📌 Mostrar mensaje si no hay dependientes */}
        {dependientes.length === 0 ? (
            <View style={styles.noDependentsContainer}>
                <Text style={styles.noDependentsText}>No hay dependientes registrados para mostrar</Text>
            </View>
        ) : (
            <FlatList
                data={dependientes}
                keyExtractor={(item) => item.id_cedula}
                renderItem={({ item }) => (
                    <View style={styles.dependienteItem}>
                        <View style={styles.dependienteInfo}>
                            <Text style={styles.dependienteText}>
                                <Text style={styles.label}>Cédula:</Text> {item.id_cedula}
                            </Text>
                            <Text style={styles.dependienteText}>
                                <Text style={styles.label}>Nombre:</Text> {item.nombre}
                            </Text>
                        </View>
                        <View style={styles.buttonContainer}>
                            <TouchableOpacity 
                                style={styles.editButton} 
                                onPress={() => openEditModal(item)}
                            >
                                <FontAwesome name="edit" size={20} color="#fff" />
                            </TouchableOpacity>
                            <TouchableOpacity 
                                style={styles.deleteButton} 
                                onPress={() => handleDeleteDependiente(item.id_cedula)}
                            >
                                <FontAwesome name="trash" size={20} color="#fff" />
                            </TouchableOpacity>
                        </View>
                    </View>
                )}
            />
        )}
    
        <TouchableOpacity style={styles.addButton} onPress={() => setModalVisible(true)}>
            <Text style={styles.buttonText}>Agregar Dependiente</Text>
        </TouchableOpacity>

            {/* Modal para agregar/editar dependiente */}
            <Modal visible={modalVisible} animationType="slide" transparent={true}>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContainer}>
                        <Text style={styles.modalTitle}>{isEditing ? "Editar Dependiente" : "Nuevo Dependiente"}</Text>

                        <Text style={styles.inputLabel}>Cédula</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Ingrese la cédula"
                            value={newDependiente.id_cedula}
                            onChangeText={(text) => setNewDependiente({ ...newDependiente, id_cedula: text })}
                        />

                        <Text style={styles.inputLabel}>Nombre</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Ingrese el nombre"
                            value={newDependiente.nombre}
                            onChangeText={(text) => setNewDependiente({ ...newDependiente, nombre: text })}
                        />

                        <Text style={styles.inputLabel}>Contraseña</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Ingrese la contraseña"
                            secureTextEntry
                            value={newDependiente.contrasena}
                            onChangeText={(text) => setNewDependiente({ ...newDependiente, contrasena: text })}
                        />
                        
                        <View style={styles.modalButtons}>
                            <TouchableOpacity 
                                style={styles.saveButton} 
                                onPress={isEditing ? handleUpdateDependiente : handleAddDependiente}
                            >
                                <Text style={styles.buttonText}>{isEditing ? "Actualizar" : "Guardar"}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.cancelButton} onPress={closeModal}>
                                <Text style={styles.buttonText}>Cancelar</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20, backgroundColor: "#f8f9fa" },
    title: { fontSize: 22, fontWeight: "bold", textAlign: "center", marginBottom: 10 },
    
    dependienteItem: { 
        flexDirection: "row", 
        justifyContent: "space-between", 
        alignItems: "center", 
        padding: 15, 
        backgroundColor: "#fff", 
        borderRadius: 8, 
        marginBottom: 10, 
        elevation: 3 
    },
    dependienteInfo: { flex: 1 },
    dependienteText: { fontSize: 16, marginBottom: 5 },
    label: { fontWeight: "bold" },

    buttonContainer: { flexDirection: "row", gap: 10 },
    editButton: { backgroundColor: "#ffc107", padding: 10, borderRadius: 5 },
    deleteButton: { backgroundColor: "#dc3545", padding: 10, borderRadius: 5 },

    addButton: { backgroundColor: "#007bff", padding: 15, borderRadius: 8, alignItems: "center", marginTop: 20 },
    buttonText: { color: "#fff", fontWeight: "bold" },

    modalOverlay: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "rgba(0,0,0,0.5)" },
    modalContainer: { width: "90%", padding: 20, backgroundColor: "white", borderRadius: 10 },
    modalTitle: { fontSize: 20, fontWeight: "bold", textAlign: "center", marginBottom: 20 },
    
    inputLabel: { fontSize: 14, fontWeight: "bold", marginTop: 10 },
    input: { height: 50, borderColor: "#ccc", borderWidth: 1, borderRadius: 8, paddingHorizontal: 15, backgroundColor: "#fff" },
    
    modalButtons: { flexDirection: "row", justifyContent: "space-between", marginTop: 20 },
    saveButton: { backgroundColor: "#28a745", padding: 15, borderRadius: 8, flex: 1, marginRight: 10, alignItems: "center" },
    cancelButton: { backgroundColor: "#d9534f", padding: 15, borderRadius: 8, flex: 1, marginLeft: 10, alignItems: "center" },
    noDependentsContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 20, // Espaciado lateral para evitar bordes pegados
    },
    noDependentsText: {
        textAlign: "center",
        fontSize: 16,
        color: "#888", // Color gris claro
        marginTop: 10,
    },
    
});

export default DependentScreen;
