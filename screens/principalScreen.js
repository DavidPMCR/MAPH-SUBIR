import React, { useState, useEffect } from "react";
import axios from "axios";
import { View, Text, TouchableOpacity, StyleSheet, ImageBackground } from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";

const MenuWithIconsAndLogo = ({ navigation, route }) => {
    const [user, setUser] = useState(route.params?.user || {});

    useEffect(() => {
        const loadUser = async () => {
            if (!user.nombre) { // Si no hay usuario en params, buscar en AsyncStorage
                const storedUser = await AsyncStorage.getItem("user");
                if (storedUser) {
                    setUser(JSON.parse(storedUser));
                }
            }
        };
        loadUser();
    }, []);

    const handleLogout = async () => {
        try {
            const token = await AsyncStorage.getItem("token");

            //  Llamar al backend para cerrar sesión
            await axios.post("http://192.168.1.98:3001/auth/logout", {}, {
                headers: { Authorization: `Bearer ${token}` }
            });

            //  Eliminar el token y los datos del usuario del frontend
            await AsyncStorage.removeItem("token");
            await AsyncStorage.removeItem("user");

            //  Redirigir a la pantalla de login
            navigation.navigate("loginScreen");
        } catch (error) {
            console.error("Error al cerrar sesión:", error.message);
        }
    };

    console.log("Datos completos del usuario en Menu:", user);

    const isDependiente = user?.rol?.trim()?.toUpperCase() === "D";

    return (
        <View style={styles.container}>
            <Text style={styles.welcomeText}>
                Bienvenido: {user.nombre || "Usuario"} {user.apellidos || ""}
            </Text>

            <View style={styles.menuContainer}>
                <TouchableOpacity
                    style={styles.menuButton}
                    onPress={() => navigation.navigate("userProfile", { user })}
                >
                    <FontAwesome name="user" size={24} color="black" />
                    <Text style={styles.menuText}>Perfil Profesional</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.menuButton}
                    onPress={() => navigation.navigate("agendaScreen", { user })}
                >
                    <FontAwesome name="calendar" size={24} color="black" />
                    <Text style={styles.menuText}>Agenda</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.menuButton}
                    onPress={() => navigation.navigate("patientScreen", { user })}
                >
                    <FontAwesome name="users" size={24} color="black" />
                    <Text style={styles.menuText}>Pacientes</Text>
                </TouchableOpacity>

                {!isDependiente && (
                    <TouchableOpacity
                        style={styles.menuButton}
                        onPress={() => navigation.navigate("reportScreen")}
                    >
                        <FontAwesome name="file" size={24} color="black" />
                        <Text style={styles.menuText}>Reportes</Text>
                    </TouchableOpacity>
                )}

                {!isDependiente && (
                    <TouchableOpacity
                        style={styles.menuButton}
                        onPress={() => navigation.navigate("patientFileScreen")}
                    >
                        <FontAwesome name="folder" size={24} color="black" />
                        <Text style={styles.menuText}>Archivos</Text>
                    </TouchableOpacity>
                )}
            </View>

            {/* Botón para cerrar sesión */}
            <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
    <FontAwesome name="sign-out" size={20} color="#444" />
    <Text style={styles.logoutText}>Salir</Text>
</TouchableOpacity>

            <ImageBackground source={require("../assets/logo.png")} style={styles.background} />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f8f9fa",
        justifyContent: "space-between",
    },
    background: {
        height: 200,
        justifyContent: "center",
        alignItems: "center",
        resizeMode: "cover",
    },
    welcomeText: {
        fontSize: 20,
        fontWeight: "bold",
        color: "#000",
        marginTop: 20,
        textAlign: "center",
    },
    menuContainer: {
        flex: 1,
        paddingHorizontal: 20,
        marginTop: 20,
    },
    menuButton: {
        flexDirection: "row",
        alignItems: "center",
        marginVertical: 10,
        backgroundColor: "#e0f7fa",
        padding: 15,
        borderRadius: 10,
        elevation: 3,
    },
    menuText: {
        marginLeft: 10,
        fontSize: 18,
        fontWeight: "bold",
        color: "#000",
    },
    logoutButton: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: "#e0f7fa", // Color suave que combina con el fondo
      padding: 10, // Más pequeño
      borderRadius: 8, // Bordes más redondeados
      justifyContent: "center",
      marginBottom: 10, // Menos margen
      width: "50%" ,
     marginHorizontal: 100, // Espaciado más pequeño
      
  },
  logoutText: {
      marginLeft: 8,
      fontSize: 16, // Letra más pequeña
      fontWeight: "bold",
      color: "#444", // Color más tenue en lugar de blanco
  },
  
});

export default MenuWithIconsAndLogo;
