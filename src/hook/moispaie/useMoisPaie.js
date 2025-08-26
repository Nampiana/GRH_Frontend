// ✅ Hook CRUD MoisPaie prêt à coller
import { useEffect, useState } from "react";
import MoisPaieService from "../../services/moispaie/moisPaieService";

function useMoisPaie() {
    const [mois, setMois] = useState([]);       // [{id, periode: "YYYY-MM"}]
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");

    const sortDesc = (list) =>
        [...list].sort((a, b) => (b.periode || "").localeCompare(a.periode || ""));

    const fetchMois = () => {
        setLoading(true);
        setErrorMsg("");
        MoisPaieService.getAll()
            .then((res) => {
                const list = Array.isArray(res.data) ? res.data : [];
                setMois(sortDesc(list));
            })
            .catch((err) => setErrorMsg(err?.response?.data?.message || "Erreur de chargement"))
            .finally(() => setLoading(false));
    };

    useEffect(() => { fetchMois(); }, []);

    const createMois = (data, cb = () => { }) => {
        setErrorMsg("");
        MoisPaieService.create(data)
            .then(() => { fetchMois(); cb(); })
            .catch((err) => setErrorMsg(err?.response?.data?.message || "Création échouée (doublon ?)"));
    };

    const updateMois = (id, data, cb = () => { }) => {
        setErrorMsg("");
        MoisPaieService.update(id, data)
            .then(() => { fetchMois(); cb(); })
            .catch((err) => setErrorMsg(err?.response?.data?.message || "Mise à jour échouée"));
    };

    const deleteMois = (id, cb = () => { }) => {
        setErrorMsg("");
        MoisPaieService.delete(id)
            .then(() => { fetchMois(); cb(); })
            .catch((err) => setErrorMsg(err?.response?.data?.message || "Suppression échouée"));
    };

    return { mois, loading, errorMsg, setErrorMsg, fetchMois, createMois, updateMois, deleteMois };
}

export default useMoisPaie;
