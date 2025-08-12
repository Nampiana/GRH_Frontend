import { useEffect, useState } from "react";
import SanctionServices from "../../services/sanction/sanctionService";

function useSanction() {
    const [saction, setSanction] = useState([]);

    const fetchSanction = () => {
        SanctionServices.getAll()
            .then((res) => setSanction(res.data))
            .catch((err) => console.error(err));
    };

    useEffect(() => {
        fetchSanction();
    }, []);

    const createSanction = (data, callback = () => { }) => {
        SanctionServices.create(data)
            .then(() => {
                fetchSanction();
                callback();
            })
            .catch((err) => console.error(err));
    };

    const updateSanction = (id, data, callback = () => { }) => {
        SanctionServices.create(data)
            .update(id, data)
            .then(() => {
                fetchSanction();
                callback();
            })
            .catch((err) => console.error(err));
    };

    const deleteSanction = (id, callback = () => { }) => {
        SanctionServices.delete(id)
            .then(() => {
                fetchSanction();
                callback();
            })
            .catch((err) => console.error(err));
    };

    return { saction, fetchSanction, createSanction, updateSanction, deleteSanction };
}

export default useSanction;
