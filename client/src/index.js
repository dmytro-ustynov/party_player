import React from 'react';
import ReactDOM from 'react-dom';
import {
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom";
import './index.css';
import {AuthProvider} from "./components/auth/context";
import PageNotFound from "./pages/PageNotFound/PageNotFound";
import HomePage from "./pages/HomePage/HomePage";
import LoginPage from "./components/auth/Login/LoginPage";
import LandingPage from "./pages/LandingPage/LandingPage";


ReactDOM.render(
        <AuthProvider>
        <div className='app-wrapper'>
            <BrowserRouter>
                <Routes>
                    <Route exact path='/' element={<HomePage />}/>
                    <Route path='/login' element={<LoginPage />}/>
                    <Route path='/welcome' element={<LandingPage />}/>
                    <Route path='/*' element={<PageNotFound />}/>
                </Routes>
            </BrowserRouter>
        </div>
    </AuthProvider>
    , document.getElementById('root'));
