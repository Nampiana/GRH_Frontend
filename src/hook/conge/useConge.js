import { useState, useEffect } from "react";
import CongeServices from "../../services/conge/congeService";

function useConge() {
  const [conge, setConge] = useState([]);

  const fetchConge = () => {
    CongeServices.getAll()
      .then((res) => {
        setConge(res.data);
      })
      .catch((err) => console.error(err));
  };

  useEffect(() => {
    fetchConge();
  }, []);

  const createConge = (data, callback = () => {}) => {
    CongeServices.create(data)
      .then(() => {
        fetchConge();
        callback();
      })
      .catch((err) => console.error(err));
  };

  const updateConge = (id, data, callback = () => {}) => {
    CongeServices.update(id, data)
      .then(() => {
        fetchConge();
        callback();
      })
      .catch((err) => console.error(err));
  };

  const deleteConge = (id, callback = () => {}) => {
    CongeServices.delete(id)
      .then(() => {
        fetchConge();
        callback();
      })
      .catch((err) => console.error(err));
  };

  const uploadJustificatif = async (file) => {
    try {
      const res = await CongeServices.uploadJustificatif(file);
      return res.data;
    } catch (err) {
      console.error("Erreur upload:", err);
      return "";
    }
  };

  return {
    conge,
    fetchConge,
    createConge,
    updateConge,
    deleteConge,
    uploadJustificatif,
  };
}

export default useConge;
