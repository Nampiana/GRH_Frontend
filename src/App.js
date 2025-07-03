import './App.css';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import HomePage from "./pages/auth/HomePage";
import HomePages from "./pages/auth/HomePages";
import Login from "./pages/auth/Login"
import Societe from "./pages/societe/societe"
import CreateSociete from "./pages/societe/createSociete"

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
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
