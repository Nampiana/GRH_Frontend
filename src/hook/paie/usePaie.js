import { useState } from "react";
import PaieService from "../../services/paie/paieService";

function usePaie() {
    const [bulletin, setBulletin] = useState(null);
    const [loading, setLoading] = useState(false);

    const calculer = (idEmployer, moisPaieId) => {
        setLoading(true);
        return PaieService.calculer(idEmployer, moisPaieId)
            .then(res => setBulletin(res.data))
            .catch(err => {
                const msg = err?.response?.data?.error || err.message;
                alert("Erreur calcul: " + msg);
                throw err;
            })
            .finally(() => setLoading(false));
    };

    const enregistrer = (payload, cb = () => { }) => {
        return PaieService.enregistrer(payload)
            .then(() => cb());
    };

    return { bulletin, loading, calculer, enregistrer, setBulletin };
}

export default usePaie;