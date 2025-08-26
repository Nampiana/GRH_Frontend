// ✅ Hook CRUD RubriquePaie prêt à coller
import { useEffect, useState } from "react";
import RubriqueService from "../../services/rubriquePaie/rubriqueService";

function useRubriquePaie() {
    const [rubriques, setRubriques] = useState([]);
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");

    const fetchRubriques = () => {
        setLoading(true);
        setErrorMsg("");
        RubriqueService.getAll()
            .then((res) => {
                const list = Array.isArray(res.data) ? res.data : [];
                // tri par code
                list.sort((a, b) => (a.code || "").localeCompare(b.code || ""));
                setRubriques(list);
            })
            .catch((err) => setErrorMsg(err?.response?.data?.message || "Erreur de chargement"))
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        fetchRubriques();
    }, []);

    const createRubrique = (data, callback = () => { }) => {
        setErrorMsg("");
        RubriqueService.create(data)
            .then(() => {
                fetchRubriques();
                callback();
            })
            .catch((err) => {
                setErrorMsg(err?.response?.data?.message || "Création échouée (code peut-être déjà utilisé).");
            });
    };

    const updateRubrique = (id, data, callback = () => { }) => {
        setErrorMsg("");
        RubriqueService.update(id, data)
            .then(() => {
                fetchRubriques();
                callback();
            })
            .catch((err) => {
                setErrorMsg(err?.response?.data?.message || "Mise à jour échouée.");
            });
    };

    const deleteRubrique = (id, callback = () => { }) => {
        setErrorMsg("");
        RubriqueService.delete(id)
            .then(() => {
                fetchRubriques();
                callback();
            })
            .catch((err) => {
                setErrorMsg(err?.response?.data?.message || "Suppression échouée.");
            });
    };

    return {
        rubriques,
        loading,
        errorMsg,
        setErrorMsg,
        fetchRubriques,
        createRubrique,
        updateRubrique,
        deleteRubrique,
    };
}

export default useRubriquePaie;
