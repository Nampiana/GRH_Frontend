import { useEffect, useState } from "react";
import SocieteServices from "../../services/societe/societeService";

function useSociete() {
  const [societe, setSociete] = useState([]);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);

  const fetchSociete = (page = 0, size = 6) => {
    SocieteServices.getAllPaginated(page, size)
      .then(res => {
        console.log("societe",res);  
        if (res.data && res.data.content) {
          setSociete(res.data.content);
          setTotalPages(res.data.totalPages);
          setCurrentPage(res.data.number);
        } else {
          console.error("Réponse invalide du backend.");
        }
      })
      .catch(err => console.error(err));
  };

  useEffect(() => {
    fetchSociete();
  }, []);

  const createSociete = (data, callback = () => { }) => {
    SocieteServices.create(data)
      .then(() => {
        fetchSociete(currentPage);
        callback();
      })
      .catch((err) => console.error(err));
  };

  const updateSociete = (id, data, callback = () => { }) => {
    SocieteServices.update(id, data)
      .then(() => {
        fetchSociete(currentPage);
        callback();
      })
      .catch((err) => console.error(err));
  };

  const deleteSociete = (id, callback = () => { }) => {
    SocieteServices.delete(id)
      .then(() => {
        fetchSociete(currentPage);
        callback();
      })
      .catch((err) => console.error(err));
  };

  const searchSociete = (keyword, page = 0, size = 6) => {
    SocieteServices.search(keyword, page, size)
      .then(res => {
        if (res.data && res.data.content) {
          setSociete(res.data.content);
          setTotalPages(res.data.totalPages);
          setCurrentPage(res.data.number);
        } else {
          console.error("Réponse invalide du backend (search).");
        }
      })
      .catch(err => console.error(err));
  };


  return { societe, createSociete, updateSociete, deleteSociete, fetchSociete, totalPages, currentPage, setCurrentPage, searchSociete };
}

export default useSociete;

