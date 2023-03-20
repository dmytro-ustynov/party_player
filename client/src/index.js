import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import {BrowserRouter} from "react-router-dom";
import {AuthProvider} from "./components/auth/context";
import {AudioProvider} from "./components/audio/audioReducer";

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <React.StrictMode>
        <BrowserRouter>
            <AuthProvider>
                <AudioProvider>
                    <App/>
                </AudioProvider>
            </AuthProvider>
        </BrowserRouter>
    </React.StrictMode>
);
