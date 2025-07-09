// ✅ Hook de gestion des départements prêt à coller
import { useEffect, useState } from "react";
import DepartementServices from "../../services/departement/departement";

function useDepartement() {
  const [departements, setDepartements] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchDepartements = () => {
    setLoading(true);
    DepartementServices.getAll()
      .then(res => {
        setDepartements(res.data);
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchDepartements();
  }, []);

  const createDepartement = (data, callback = () => {}) => {
    DepartementServices.create(data)
      .then(() => {
        fetchDepartements();
        callback();
      })
      .catch(err => console.error(err));
  };

  const updateDepartement = (id, data, callback = () => {}) => {
    DepartementServices.update(id, data)
      .then(() => {
        fetchDepartements();
        callback();
      })
      .catch(err => console.error(err));
  };

  const deleteDepartement = (id, callback = () => {}) => {
    DepartementServices.delete(id)
      .then(() => {
        fetchDepartements();
        callback();
      })
      .catch(err => console.error(err));
  };

  return { departements, loading, createDepartement, updateDepartement, deleteDepartement, fetchDepartements };
}

export default useDepartement;
