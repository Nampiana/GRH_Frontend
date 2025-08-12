// src/hook/contrat/useContrat.js
import { useEffect, useState } from "react";
import ContratService from "../../services/contrat/contratService";

function useContrat() {
  const [contrats, setContrats] = useState([]);

  const fetchContrats = () => {
    ContratService.getAll()
      .then((res) => setContrats(res.data))
      .catch((err) => console.error(err));
  };

  useEffect(() => {
    fetchContrats();
  }, []);

  const createContrat = (data, callback = () => {}) => {
    ContratService.create(data)
      .then(() => {
        fetchContrats();
        callback();
      })
      .catch((err) => console.error(err));
  };

  const deleteContrat = (id, callback = () => {}) => {
    ContratService.delete(id)
      .then(() => {
        fetchContrats();
        callback();
      })
      .catch((err) => console.error(err));
  };

  const updateContrat = (id, data, file, callback = () => {}) => {
  ContratService.updateWithFile(id, data, file)
    .then(() => {
      fetchContrats();
      callback();
    })
    .catch((err) => console.error(err));
};

  return { contrats, fetchContrats, createContrat, deleteContrat, updateContrat };
}

export default useContrat;
