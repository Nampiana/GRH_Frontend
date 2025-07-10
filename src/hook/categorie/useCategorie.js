import { useState, useEffect } from "react";
import CategorieServices from "../../services/categorie/categorie";

function useCategorie() {
  const [categories, setCategories] = useState([]);

  const fetchCategories = () => {
    CategorieServices.getAll()
      .then((res) => {
        setCategories(res.data);
      })
      .catch((err) => console.error(err));
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const createCategorie = (data, callback = () => {}) => {
    CategorieServices.create(data)
      .then(() => {
        fetchCategories();
        callback();
      })
      .catch((err) => console.error(err));
  };

  const updateCategorie = (id, data, callback = () => {}) => {
    CategorieServices.update(id, data)
      .then(() => {
        fetchCategories();
        callback();
      })
      .catch((err) => console.error(err));
  };

  const deleteCategorie = (id, callback = () => {}) => {
    CategorieServices.delete(id)
      .then(() => {
        fetchCategories();
        callback();
      })
      .catch((err) => console.error(err));
  };

  return {
    categories,
    fetchCategories,
    createCategorie,
    updateCategorie,
    deleteCategorie,
  };
}

export default useCategorie;
