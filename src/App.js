import './App.css';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import HomePage from "./pages/auth/HomePage";
import HomePages from "./pages/auth/HomePages";
import Login from "./pages/auth/Login";
import Societe from "./pages/societe/societe";
import CreateSociete from "./pages/societe/createSociete";
import Departement from "./pages/departement/departement";
import Service from "./pages/service/service";
import Poste from "./pages/poste/poste";
import Categorie from "./pages/categorie/Categorie";
import EmployerSociete from "./pages/employerSociete/EmployerSociete";
import Conge from "./pages/conge/conge";
import Pointage from "./pages/pointage/pointage";
import Profil from "./pages/profil/profil";
import Parametre from "./pages/parametre/parametre";
import Contrat from "./pages/contrat/GestionContrat";
import MonContrat from "./pages/contrat/MonContrat";
import Sanction from "./pages/sanction/sanction";
import Paie from "./pages/paie/PaieEmployer";
import ParametreGenereaux from "./pages/parametreGenereaux/ParametreGenereaux";
import RubriquePaie from "./pages/rubriquePaie/RubriquePaie";
import RubriqueCategorie from "./pages/rubriqueCategorie/RubriqueCategorie";
import MoisPaie from "./pages/paie/MoisPaie";
import Bulletin from "./pages/paie/BulletinsMois";
import MesBulletin from "./pages/paie/MesBulletins";
import Turnover from "./pages/turnover/TurnoverPage";


function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Routes des authentification*/}
          <Route path="/" element={<HomePage />} />
          <Route path="/home" element={<HomePages />} />
          <Route path="/login" element={<Login />} />

          {/* Routes des societe*/}
          <Route path="/societe" element={<Societe />} />
          <Route path="/create-societe" element={<CreateSociete />} />

          {/* Routes des departement*/}
          <Route path="/departement" element={<Departement />} />

          {/* Routes des service*/}
          <Route path="/service" element={<Service />} />

          {/* Routes des poste*/}
          <Route path="/poste" element={<Poste />} />

          {/* Routes des categorie*/}
          <Route path="/categorie" element={<Categorie />} />

          {/* Routes des employer societe*/}
          <Route path="/employerSociete" element={<EmployerSociete />} />

          {/* Routes des conge*/}
          <Route path="/conge" element={<Conge />} />

          {/* Routes des pointage*/}
          <Route path="/pointage" element={<Pointage />} />

          {/* Routes des pointage*/}
          <Route path="/profil" element={<Profil />} />

          {/* Routes des parametre*/}
          <Route path="/parametre" element={<Parametre />} />

          {/* Routes des contrat*/}
          <Route path="/contrat" element={<Contrat />} />
          <Route path="/MonContrat" element={<MonContrat />} />

          {/* Routes des sanction*/}
          <Route path="/sanction" element={<Sanction />} />

          {/* Routes des paie*/}
          <Route path="/paie" element={<Paie />} />

          {/* Routes des parametre genereaux*/}
          <Route path="/parametreGenereaux" element={<ParametreGenereaux />} />

          {/* Routes des rubrique*/}
          <Route path="/rubriquePaie" element={<RubriquePaie />} />
          {/* Routes des rubrique categorie*/}
          <Route path="/rubriqueCategorie" element={<RubriqueCategorie />} />

          {/* Routes des mois paie*/}
          <Route path="/moispaie" element={<MoisPaie />} />

          {/* Routes des bulletin de paie*/}
          <Route path="/bulletin" element={<Bulletin />} />
          <Route path="/mesbulletin" element={<MesBulletin />} />


          {/* Routes des TURNOVER*/}
          <Route path="/turnover" element={<Turnover />} />

        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
