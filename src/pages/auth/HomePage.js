// src/pages/HomePage.js

import { useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../contexts/AuthContext';

const HomePage = () => {
  const { isLogged } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    // Si l'utilisateur est connecté
    if (isLogged) {
      if(localStorage.getItem("user")){
        // console.log(JSON.parse(localStorage.getItem("user")));
        
        const userData = JSON.parse(localStorage.getItem("user"));

        if (userData) {
            navigate("/Societe"); 
        } else {
          navigate("/login");
        }
      }else{
        navigate("/login");
      }
      
    } else {
      navigate("/login");
    }
  }, [isLogged, navigate]);

  return null;
};

export default HomePage;
