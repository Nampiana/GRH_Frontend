import { useState, useEffect } from "react";
import SoldeCongeServices from "../../services/soldeConge/soldeConge";

function useSoldeConge() {
  const [soldeConge, setSoldeConge] = useState([]);

  const fetchSoldeConge = () => {
    SoldeCongeServices.getAll()
      .then((res) => {
        setSoldeConge(res.data);
      })
      .catch((err) => console.error(err));
  };

  useEffect(() => {
    fetchSoldeConge();
  }, []);

  const createSoldeConge = (data, callback = () => {}) => {
    SoldeCongeServices.create(data)
      .then(() => {
        fetchSoldeConge();
        callback();
      })
      .catch((err) => console.error(err));
  };

  const updateSoldeConge = (id, data, callback = () => {}) => {
    SoldeCongeServices.update(id, data)
      .then(() => {
        fetchSoldeConge();
        callback();
      })
      .catch((err) => console.error(err));
  };

  const deleteSoldeConge = (id, callback = () => {}) => {
    SoldeCongeServices.delete(id)
      .then(() => {
        fetchSoldeConge();
        callback();
      })
      .catch((err) => console.error(err));
  };

  return {
    soldeConge,
    fetchSoldeConge,
    createSoldeConge,
    updateSoldeConge,
    deleteSoldeConge,
  };
}

export default useSoldeConge;
