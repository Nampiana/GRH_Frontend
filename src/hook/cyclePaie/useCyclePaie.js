import { useState } from "react";
import CyclePaieService from "../../services/cyclePaie/cyclePaieService";

function useCyclePaie() {
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState("");

    const ouvrirMois = (idSociete, periode, cb = () => { }) => {
        setBusy(true); setError("");
        return CyclePaieService.ouvrir({ idSociete, periode })
            .then((r) => cb(r.data))
            .catch((e) => setError(e?.response?.data?.message || "Ouverture échouée"))
            .finally(() => setBusy(false));
    };

    const cloturerMois = (moisPaieId, cb = () => { }) => {
        setBusy(true); setError("");
        return CyclePaieService.cloturer(moisPaieId)
            .then((r) => cb(r.data))
            .catch((e) => setError(e?.response?.data?.message || "Clôture échouée"))
            .finally(() => setBusy(false));
    };

    return { busy, error, setError, ouvrirMois, cloturerMois };
}

export default useCyclePaie;
