import { useEffect, useState } from "react";
import EmployerSocieteService from "../../services/employerSociete/employerSocieteService";

function useEmployerSociete() {
  const [employers, setEmployers] = useState([]);

  const fetchEmployers = () => {
    EmployerSocieteService.getAll()
      .then(res => setEmployers(res.data))
      .catch(err => console.error(err));
  };

  const createEmployer = (data, callback = () => {}) => {
    EmployerSocieteService.create(data)
      .then(() => {
        fetchEmployers();
        callback();
      })
      .catch(err => console.error(err));
  };

  const updateEmployer = (id, data, callback = () => {}) => {
    EmployerSocieteService.update(id, data)
      .then(() => {
        fetchEmployers();
        callback();
      })
      .catch(err => console.error(err));
  };

  const deleteEmployer = (id, callback = () => {}) => {
    EmployerSocieteService.delete(id)
      .then(() => {
        fetchEmployers();
        callback();
      })
      .catch(err => console.error(err));
  };

  useEffect(() => {
    fetchEmployers();
  }, []);

  return { employers, fetchEmployers, createEmployer, updateEmployer, deleteEmployer };
}

export default useEmployerSociete;
