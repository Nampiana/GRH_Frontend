// src/contexts/AuthContext.js
import React, { createContext, useState, useContext } from "react";

// Création du contexte d'authentification
const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState(null);

  const login = (userData) => {
    setAuth(userData); // Stocke les informations d'utilisateur
  };

  const logout = () => {
    setAuth(null); // Déconnecte l'utilisateur
  };

  return (
    <AuthContext.Provider value={{ auth, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
