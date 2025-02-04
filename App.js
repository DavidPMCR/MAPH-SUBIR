import React from 'react';
import AppNavigator from './AppNavigator'; // Tu archivo de navegación
import { UserProvider } from './controller/UserContext'; // Proveedor del contexto para el usuario

const App = () => {
  return (
    <UserProvider>
      <AppNavigator /> {/* Navegador envuelto por el contexto */}
    </UserProvider>
  );
};

export default App;


