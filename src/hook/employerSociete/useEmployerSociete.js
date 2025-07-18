import { useEffect, useState } from "react";
import EmployerSocieteService from "../../services/employerSociete/employerSocieteService";

function useEmployerSociete() {
  const [employers, setEmployers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchEmployers = () => {
    EmployerSocieteService.getAll()
      .then(res => setEmployers(res.data))
      .catch(err => console.error(err));
  };

  const createEmployer = (data, callback = () => { }) => {
    EmployerSocieteService.create(data)
      .then(() => {
        fetchEmployers();
        callback();
      })
      .catch(err => console.error(err));
  };

  const updateEmployer = (id, data, callback = () => { }) => {
    EmployerSocieteService.updateComplete(id, data)
      .then(() => {
        fetchEmployers();
        callback();
      })
      .catch(err => console.error(err));
  };

  const deleteEmployer = (id, callback = () => { }) => {
    EmployerSocieteService.deleteComplete(id)
      .then(() => {
        fetchEmployers();
        callback();
      })
      .catch(err => console.error(err));
  };

  useEffect(() => {
    fetchEmployers();
  }, []);

  const fetchEmployersByUtilisateur = (userId) => {
    setLoading(true);
    EmployerSocieteService.getByUtilisateur(userId)
      .then(res => setEmployers(res.data))
      .catch(err => setError(err))
      .finally(() => setLoading(false));
  };

  return { employers, fetchEmployers, createEmployer, updateEmployer, deleteEmployer, fetchEmployersByUtilisateur };
}

export default useEmployerSociete;
