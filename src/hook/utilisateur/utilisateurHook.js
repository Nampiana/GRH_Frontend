import { useEffect, useState } from "react";
import UtilisateurServices  from "../../services/utilisateur/utilisateurService";

function useUtilisateur() {
  const [utilisateur, setUtilisateur] = useState([]);

  const fetchUtilisateur = () => {
    UtilisateurServices.getAll()
      .then((res) => setUtilisateur(res.data))
      .catch((err) => console.error(err));
  };

  useEffect(() => {
    fetchUtilisateur();
  }, []);

  const createUtilisateur = (data, callback = () => {}) => {
    UtilisateurServices.create(data)
      .then(() => {
        fetchUtilisateur();
        callback();
      })
      .catch((err) => console.error(err));
  };

  const updateUtilisateur = (id, data, callback = () => {}) => {
    UtilisateurServices.update(id, data)
      .then(() => {
        fetchUtilisateur();
        callback();
      })
      .catch((err) => console.error(err));
  };

  const deleteUtilisateur = (id, callback = () => {}) => {
    UtilisateurServices.delete(id)
      .then(() => {
        fetchUtilisateur();
        callback();
      })
      .catch((err) => console.error(err));
  };

  return { utilisateur, fetchUtilisateur, createUtilisateur, updateUtilisateur, deleteUtilisateur };
}

export default useUtilisateur;
