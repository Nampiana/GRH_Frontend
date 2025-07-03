import React, { createContext, useState, useEffect } from 'react';
import AuthServices from '../services/auth/AuthServices';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLogged, setIsLogged] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [alertMessage, setAlertMessage] = useState(null);

  const navigate = useNavigate();

  const login = async (credentials) => {
    setIsLoading(true);
    try {
      const res = await AuthServices.login(credentials);
      console.log(res);
  
      const userData = {
        username: res.data.nom,
        email: res.data.email
      };
  
      setUser(userData);
      setIsLogged(true);
      localStorage.setItem('access_token', res.data.token);
      localStorage.setItem('user', JSON.stringify(userData));
  
      console.log("user", userData);
  
      // Redirection en fonction du rôle
      if (userData) {
        navigate('/societe');
      } else {
        navigate('/');
      }
    } catch (err) {
      console.error('Erreur de connexion :', err.response?.data?.error);
      setAlertMessage({ type: "danger", text: err.response?.data?.error || "Erreur de connexion !" });
      toast.error(err.response?.data?.error || "Erreur inconnue", {
        position: "top-right",
        theme: "colored",
        className: "toast-message",
      });
    } finally {
      setIsLoading(false);
    }
  };
  

  const logout = () => {
    AuthServices.logout()
      .then(() => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('user');

        setIsLogged(false);
        setUser(null);

        navigate('/login');
      })
      .catch((err) => {
        console.error('Erreur de déconnexion :', err);
        localStorage.removeItem('access_token');
        localStorage.removeItem('user');
        navigate('/login');
      });
  };

  useEffect(() => {
    if (alertMessage) {
      const timer = setTimeout(() => setAlertMessage(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [alertMessage]);

  useEffect(() => {
    const token = localStorage.getItem('access_token');    
    if (token) {
      setIsLogged(true);
      AuthServices.checkToken(token)
        .then((res) => {
          const userData = res.data.user;
  
          if (userData.etat_active === 0) {
            setIsLogged(false);
            setUser(null);
            setAlertMessage({ type: "danger", text: "Votre compte est désactivé. Veuillez contacter l'administrateur." });
            toast.error("Votre compte est désactivé. Veuillez contacter l'administrateur.", {
              position: "top-right",
              theme: "colored",
              className: "toast-message",
            });
            navigate('/login'); // Redirige vers la page de connexion
            return;
          }
  
          setUser(userData);
  
          if (userData.role === 1) {
            navigate('/users');
          } else if (userData.role === 2) {
            navigate('/usage/list');
          }
        })
        .catch(() => {
          setIsLogged(false);
          setUser(null);
        });
    } else {
      console.log("pas de token");
      navigate('/login');
    }
  }, [navigate]);
  

  return (
    <AuthContext.Provider
      value={{
        user,
        isLogged,
        isLoading,
        login,
        logout,
        setIsLoading,
        alertMessage,
        setAlertMessage,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};