import './App.css';
import {Routes, Route} from "react-router-dom";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import RedactorPage from "./pages/RedactorPage";
import LandingPage from "./pages/LandingPage";
import PageNotFound from "./pages/PageNotFound";
import TermsOfUsePage from "./pages/TermsOfUsePage";

function App() {
    return (
        <div className="main-container">
            <Routes>
                <Route path="/" element={<HomePage/>}/>
                <Route path="/login" element={<LoginPage/>}/>
                <Route path="/register" element={<RegisterPage/>}/>
                <Route path="/welcome" element={<LandingPage />}/>
                <Route path="/redactor" element={<RedactorPage />}/>
                <Route path="/terms" element={<TermsOfUsePage />}/>
                <Route path="/about" element={<p>about</p>}/>
                <Route path="/*" element={<PageNotFound />}/>
            </Routes>
        </div>
    );
}

export default App;
