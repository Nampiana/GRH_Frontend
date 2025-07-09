import { useEffect, useState } from "react";
import ServiceServices from "../../services/services/service";

function useService() {
  const [services, setServices] = useState([]);

  const fetchServices = () => {
    ServiceServices.getAll()
      .then((res) => setServices(res.data))
      .catch((err) => console.error(err));
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const createService = (data, callback = () => {}) => {
    ServiceServices.create(data)
      .then(() => {
        fetchServices();
        callback();
      })
      .catch((err) => console.error(err));
  };

  const updateService = (id, data, callback = () => {}) => {
    ServiceServices.update(id, data)
      .then(() => {
        fetchServices();
        callback();
      })
      .catch((err) => console.error(err));
  };

  const deleteService = (id, callback = () => {}) => {
    ServiceServices.delete(id)
      .then(() => {
        fetchServices();
        callback();
      })
      .catch((err) => console.error(err));
  };

  return { services, fetchServices, createService, updateService, deleteService };
}

export default useService;
