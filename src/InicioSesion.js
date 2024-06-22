import React, { useState } from 'react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from './firebase';
import logo from './icons/LogoElectricidad.png';
import './InicioSesion.css';
import Inicio from './Inicio';

function InicioSesion() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const adminRef = collection(db, 'Admin');
            const q = query(adminRef, where('usuario', '==', username), where('contraseña', '==', password));
            const querySnapshot = await getDocs(q);

            if (!querySnapshot.empty) {
                // Successful login
                setError('');
                console.log('Login successful');
                setIsLoggedIn(true);
            } else {
                // Incorrect username or password
                setError('Usuario o contraseña incorrectos');
            }
        } catch (err) {
            console.error('Error during login:', err);
            setError('Error during login');
        }
    };

    const handleLogout = () => {
        setIsLoggedIn(false);
    };

    if (isLoggedIn) {
        return <Inicio handleLogout={handleLogout} />; // Render the home component if logged in
    }

    return (
        <div className="InicioSesion">
            <header className="InicioSesion-header">
                <img src={logo} className="App-logo" alt="logo" />
                <form className="login-form" onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="username">Usuario:</label>
                        <input
                            type="text"
                            id="username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="password">Contraseña:</label>
                        <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    <button type="submit" className="login-button">Iniciar Sesión</button>
                </form>
                {error && <p className="error">{error}</p>}
            </header>
        </div>
    );
}

export default InicioSesion;