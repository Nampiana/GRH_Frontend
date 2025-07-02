import { useEffect, useState } from "react";
import SocieteServices from "../../services/societe/societeService";

function useProduit() {
  const [societe, setSociete] = useState([]);

  function fetchSociete() {
    SocieteServices.getAll()
      .then((res) => {        
        if (Array.isArray(res.data)) {                     
            setSociete(res.data);
        } else {
          console.error("La réponse de l'API n'est pas un tableau.");
        }
      })
      .catch((err) => console.error("Erreur API :", err));
  }
  
  useEffect(() => {
    fetchSociete();
  }, []);

  const createSociete = (data, callback = () => {}) => {
    SocieteServices.create(data)
      .then(() => {
        fetchSociete();
        callback();
      })
      .catch((err) => console.error(err));
  };


  return { societe, createSociete };
}

export default useProduit;
