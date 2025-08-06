import React, { useRef, useState, useEffect } from "react";
import Webcam from "react-webcam";
import axios from "axios";

const FacialCapture = ({ employerId, pointage, createPointage, updatePointage }) => {
  const webcamRef = useRef(null);
  const [faceExists, setFaceExists] = useState(false);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    axios
      .get(`http://localhost:8000/faces/${employerId}.jpg`)
      .then(() => setFaceExists(true))
      .catch(() => setFaceExists(false));
  }, [employerId]);

  const showMessage = (text) => {
    setMessage(text);
    setTimeout(() => setMessage(""), 2000); // Efface après 2 secondes
  };

  const captureAndSend = async () => {
    setLoading(true);
    setMessage("");

    const imageSrc = webcamRef.current.getScreenshot();
    const blob = await (await fetch(imageSrc)).blob();
    const formData = new FormData();
    formData.append("file", blob, "photo.jpg");

    if (!faceExists) {
      formData.append("employer_id", employerId);
      await axios.post("http://localhost:8000/register", formData);
      setFaceExists(true);
      showMessage("✅ Visage enregistré. Vous pouvez maintenant pointer.");
      setLoading(false);
      return;
    }

    const res = await axios.post("http://localhost:8000/recognize", formData);
    const matchedId = res.data.employerId;

    if (!matchedId || matchedId !== employerId) {
      showMessage("❌ Visage non reconnu ou ne correspond pas à votre profil.");
      setLoading(false);
      return;
    }

    const now = new Date().toISOString();
    const todayPointage = pointage.find(
      (p) =>
        p.idEmployerSociete === employerId &&
        new Date(p.dateArriver).toDateString() === new Date().toDateString()
    );

    if (!todayPointage) {
      createPointage({ idEmployerSociete: employerId, dateArriver: now }, () => {
        showMessage("✅ Arrivée enregistrée avec succès !");
        setLoading(false);
      });
    } else if (!todayPointage.dateDepart) {
      updatePointage(todayPointage.id, { dateDepart: now }, () => {
        showMessage("✅ Départ enregistré avec succès !");
        setLoading(false);
      });
    } else {
      showMessage("⏱️ Vous avez déjà pointé arrivée et départ aujourd'hui.");
      setLoading(false);
    }
  };

  return (
    <div className="text-center">
      <Webcam
        ref={webcamRef}
        screenshotFormat="image/jpeg"
        width={320}
        height={240}
      />
      <br />
      <button
        className="btn btn-primary mt-2"
        onClick={captureAndSend}
        disabled={loading}
      >
        {loading ? "Analyse..." : "📸 Scanner et Pointer"}
      </button>
      {message && <div className="alert alert-info mt-3">{message}</div>}
    </div>
  );
};

export default FacialCapture;
