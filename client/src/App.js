import './App.css';
import {Routes, Route} from "react-router-dom";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";

function App() {
    return (
        <div className="main-container">
            <Routes>
                <Route path="/" element={<HomePage/>}/>
                <Route path="/login" element={<LoginPage/>}/>
                <Route path="/register" element={<RegisterPage/>}/>
                <Route path="/welcome" element={<p>welcome</p>}/>
                <Route path="/sounds" element={<p>redactor w.b. here</p>}/>
                <Route path="/about" element={<p>about</p>}/>
                <Route path="/*" element={<p>not found</p>}/>
            </Routes>
        </div>
    );
}

export default App;
