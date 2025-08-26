import { useEffect, useState } from "react";
import SanctionService from "../../services/sanction/sanctionService";

function useSanction() {
  const [sanctions, setSanctions] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchSanctions = () => {
    setLoading(true);
    SanctionService.getAll()
      .then((res) => setSanctions(res.data || []))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchSanctions();
  }, []);

  const createSanction = (data, callback = () => {}) => {
    SanctionService.create(data)
      .then(() => {
        fetchSanctions();
        callback();
      })
      .catch((err) => console.error(err));
  };

  const updateSanction = (id, data, callback = () => {}) => {
    SanctionService.update(id, data)
      .then(() => {
        fetchSanctions();
        callback();
      })
      .catch((err) => console.error(err));
  };

  const deleteSanction = (id, callback = () => {}) => {
    SanctionService.delete(id)
      .then(() => {
        fetchSanctions();
        callback();
      })
      .catch((err) => console.error(err));
  };

  return { sanctions, loading, fetchSanctions, createSanction, updateSanction, deleteSanction };
}

export default useSanction;
