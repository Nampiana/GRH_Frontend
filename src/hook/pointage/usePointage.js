import { useState, useEffect } from "react";
import PointageServices from "../../services/pointage/pointageService";

function usePointage() {
  const [pointage, setPointage] = useState([]);

  const fetchPointage = () => {
    PointageServices.getAll()
      .then((res) => setPointage(res.data))
      .catch((err) => console.error(err));
  };

  useEffect(() => {
    fetchPointage();
  }, []);

  const createPointage = (data, callback = () => {}) => {
    PointageServices.create(data)
      .then(() => {
        fetchPointage();
        callback();
      })
      .catch((err) => console.error(err));
  };

  const updatePointage = (id, data, callback = () => {}) => {
    PointageServices.update(id, data)
      .then(() => {
        fetchPointage();
        callback();
      })
      .catch((err) => console.error(err));
  };

  const deletePointage = (id, callback = () => {}) => {
    PointageServices.delete(id)
      .then(() => {
        fetchPointage();
        callback();
      })
      .catch((err) => console.error(err));
  };

  return {
    pointage,
    fetchPointage,
    createPointage,
    updatePointage,
    deletePointage,
  };
}

export default usePointage;
