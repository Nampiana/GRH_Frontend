import React, { useRef, useState, useEffect } from "react";
import Webcam from "react-webcam";
import axios from "axios";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const FacialCapture = ({ employerId, pointage, createPointage, updatePointage }) => {
  const webcamRef = useRef(null);
  const [faceExists, setFaceExists] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Vérifier si un visage est déjà enregistré
    axios
      .get(`http://localhost:8000/faces/${employerId}.jpg`)
      .then(() => setFaceExists(true))
      .catch(() => setFaceExists(false));
  }, [employerId]);

  const captureAndSend = async () => {
    setLoading(true);

    const imageSrc = webcamRef.current.getScreenshot();
    if (!imageSrc) {
      toast.error("Échec de la capture de l'image.");
      setLoading(false);
      return;
    }

    const blob = await (await fetch(imageSrc)).blob();
    const formData = new FormData();
    formData.append("file", blob, "photo.jpg");

    if (!faceExists) {
      // Étape 1 : Enregistrer le visage s'il n'existe pas
      formData.append("employer_id", employerId);
      try {
        await axios.post("http://localhost:8000/register", formData);
        setFaceExists(true);
        toast.success("✅ Votre visage a été enregistré avec succès ! Vous pouvez maintenant pointer.");
      } catch (error) {
        toast.error("❌ Erreur lors de l'enregistrement de votre visage.");
      }
      setLoading(false);
      return;
    }

    // Étape 2 : Reconnaître le visage et enregistrer le pointage
    try {
      const res = await axios.post("http://localhost:8000/recognize", formData);
      const matchedId = res.data.employerId;

      if (!matchedId || matchedId !== employerId) {
        toast.error("❌ Visage non reconnu ou ne correspond pas à votre profil.");
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
        // Pointage d'arrivée
        await createPointage({ idEmployerSociete: employerId, dateArriver: now });
        toast.success("✅ Pointage d'arrivée enregistré avec succès !");
      } else if (!todayPointage.dateDepart) {
        // Pointage de départ
        await updatePointage(todayPointage.id, { dateDepart: now });
        toast.success("✅ Pointage de départ enregistré avec succès !");
      } else {
        // Déjà pointé
        toast.info("⏱️ Vous avez déjà pointé votre arrivée et votre départ aujourd'hui.");
      }
    } catch (error) {
      console.error("Erreur de reconnaissance ou de pointage :", error);
      toast.error("❌ Une erreur s'est produite lors de la reconnaissance faciale.");
    } finally {
      setLoading(false);
    }
  };

  const lastPointage = pointage
    .filter((p) => p.idEmployerSociete === employerId)
    .sort((a, b) => new Date(b.dateArriver) - new Date(a.dateArriver))[0];

  const buttonText = faceExists
    ? lastPointage && !lastPointage.dateDepart
      ? "📸 Pointer mon départ"
      : "📸 Pointer mon arrivée"
    : "📸 Enregistrer mon visage";

  const buttonClass = faceExists && lastPointage && !lastPointage.dateDepart
    ? "btn-danger"
    : "btn-primary";

  return (
    <div className="card shadow-lg border-0 p-4 mb-4 text-center">
      <div className="card-body">
        <h5 className="card-title text-center mb-4 fw-bold text-primary">
          <i className="icofont-face-smile me-2"></i> Reconnaissance Faciale
        </h5>
        <div className="d-flex justify-content-center mb-4">
          <div className="webcam-container" style={{ borderRadius: '15px', overflow: 'hidden', border: '3px solid #6777ef', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }}>
            <Webcam
              audio={false}
              ref={webcamRef}
              screenshotFormat="image/jpeg"
              screenshotQuality={0.9}
              videoConstraints={{ facingMode: "user" }}
              width={320}
              height={240}
            />
          </div>
        </div>
        <button
          onClick={captureAndSend}
          className={`btn ${buttonClass} btn-lg shadow-sm`}
          style={{ width: '100%', maxWidth: '300px' }}
          disabled={loading}
        >
          {loading ? (
            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
          ) : (
            <i className="me-2"></i>
          )}
          {loading ? "Analyse en cours..." : buttonText}
        </button>
      </div>
    </div>
  );
};

export default FacialCapture;