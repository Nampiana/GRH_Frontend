import { useEffect, useState } from "react";
import PosteServices from "../../services/poste/posteService";

function usePoste() {
  const [postes, setPostes] = useState([]);

  const fetchPostes = () => {
    PosteServices.getAll()
      .then((res) => setPostes(res.data))
      .catch((err) => console.error(err));
  };

  useEffect(() => {
    fetchPostes();
  }, []);

  const createPoste = (data, callback = () => {}) => {
    PosteServices.create(data)
      .then(() => {
        fetchPostes();
        callback();
      })
      .catch((err) => console.error(err));
  };

  const updatePoste = (id, data, callback = () => {}) => {
    PosteServices.update(id, data)
      .then(() => {
        fetchPostes();
        callback();
      })
      .catch((err) => console.error(err));
  };

  const deletePoste = (id, callback = () => {}) => {
    PosteServices.delete(id)
      .then(() => {
        fetchPostes();
        callback();
      })
      .catch((err) => console.error(err));
  };

  return { postes, fetchPostes, createPoste, updatePoste, deletePoste };
}

export default usePoste;
