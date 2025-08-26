// ✅ Hook CRUD RubriqueCategorie
import { useEffect, useState } from "react";
import RubriqueCategorieService from "../../services/rubriqueCategorie/rubriqueCategorieService";

function useRubriqueCategorie() {
    const [rubriqueCategories, setRubriqueCategories] = useState([]);
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");

    const fetchRubriqueCategories = () => {
        setLoading(true);
        setErrorMsg("");
        RubriqueCategorieService.getAll()
            .then((res) => {
                const list = Array.isArray(res.data) ? res.data : [];
                setRubriqueCategories(list);
            })
            .catch((err) => setErrorMsg(err?.response?.data?.message || "Erreur de chargement"))
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        fetchRubriqueCategories();
    }, []);

    const createRubriqueCategorie = (data, cb = () => { }) => {
        setErrorMsg("");
        RubriqueCategorieService.create(data)
            .then(() => { fetchRubriqueCategories(); cb(); })
            .catch((err) => setErrorMsg(err?.response?.data?.message || "Création échouée"));
    };

    const updateRubriqueCategorie = (id, data, cb = () => { }) => {
        setErrorMsg("");
        RubriqueCategorieService.update(id, data)
            .then(() => { fetchRubriqueCategories(); cb(); })
            .catch((err) => setErrorMsg(err?.response?.data?.message || "Mise à jour échouée"));
    };

    const deleteRubriqueCategorie = (id, cb = () => { }) => {
        setErrorMsg("");
        RubriqueCategorieService.delete(id)
            .then(() => { fetchRubriqueCategories(); cb(); })
            .catch((err) => setErrorMsg(err?.response?.data?.message || "Suppression échouée"));
    };

    return {
        rubriqueCategories,
        loading,
        errorMsg,
        setErrorMsg,
        fetchRubriqueCategories,
        createRubriqueCategorie,
        updateRubriqueCategorie,
        deleteRubriqueCategorie,
    };
}

export default useRubriqueCategorie;
