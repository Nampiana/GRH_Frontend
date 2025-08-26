// ✅ Hook CRUD prêt à coller
import { useEffect, useState } from "react";
import ParametreGenereauxService from "../../services/parametreGenereaux/parametreGenereauxService";

function useParametreGenereaux() {
    const [parametres, setParametres] = useState([]);
    const [loading, setLoading] = useState(false);

    const fetchParametres = () => {
        setLoading(true);
        ParametreGenereauxService.getAll()
            .then((res) => setParametres(res.data || []))
            .catch((err) => console.error(err))
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        fetchParametres();
    }, []);

    const createParametre = (data, callback = () => { }) => {
        ParametreGenereauxService.create(data)
            .then(() => {
                fetchParametres();
                callback();
            })
            .catch((err) => console.error(err));
    };

    const updateParametre = (id, data, callback = () => { }) => {
        ParametreGenereauxService.update(id, data)
            .then(() => {
                fetchParametres();
                callback();
            })
            .catch((err) => console.error(err));
    };

    const deleteParametre = (id, callback = () => { }) => {
        ParametreGenereauxService.delete(id)
            .then(() => {
                fetchParametres();
                callback();
            })
            .catch((err) => console.error(err));
    };

    return {
        parametres,
        loading,
        fetchParametres,
        createParametre,
        updateParametre,
        deleteParametre,
        setParametres,
    };
}

export default useParametreGenereaux;
