import React, { useState, useEffect } from 'react';
import logo from './icons/LogoElectricidad.png';
import { collection, getDocs } from 'firebase/firestore';
import { db } from './firebase';
import './Inicio.css';
import Contadores from './Contadores';
import Ubicaciones from './Ubicaciones';
import Consumo from './Consumo';
import Usuarios from './Usuarios';

function Inicio({ handleLogout }) {
    const [currentContent, setCurrentContent] = useState('home');
    const [barrios, setBarrios] = useState([]);
    const [consumos, setConsumos] = useState([]);
    const [usuarios, setUsuarios] = useState([]);

    useEffect(() => {
        const fetchBarrios = async () => {
            try {
                const barriosRef = collection(db, 'Barrios');
                const querySnapshot = await getDocs(barriosRef);
                const barriosData = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                setBarrios(barriosData);
            } catch (error) {
                console.error('Error fetching barrios:', error);
            }
        };

        const fetchConsumos = async () => {
            try {
                const consumosRef = collection(db, 'Consumo');
                const querySnapshot = await getDocs(consumosRef);
                const consumosData = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                setConsumos(consumosData);
            } catch (error) {
                console.error('Error fetching consumos:', error);
            }
        };

        const fetchUsuarios = async () => {
            try {
                const usuriosRef = collection(db, 'Usuarios');
                const querySnapshot = await getDocs(usuriosRef);
                const usuariosData = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                setUsuarios(usuariosData);
            } catch (error) {
                console.error('Error fetching usuarios:', error);
            }
        };

        fetchUsuarios();
        fetchBarrios();
        fetchConsumos();
    }, [barrios]);

    const handleNavigation = (content) => {
        setCurrentContent(content);
    };

    return (
        <div className="Inicio">
            <aside className="left-menu">
                <ul>
                    <li className={currentContent === 'home' ? 'active' : ''} onClick={() => handleNavigation('home')} id='inicio'>Inicio</li>
                    <li className={currentContent === 'contadores' ? 'active' : ''} onClick={() => handleNavigation('contadores')} id='contadores'>Contadores</li>
                    <li className={currentContent === 'ubicaciones' ? 'active' : ''} onClick={() => handleNavigation('ubicaciones')} id='ubicaciones'>Ubicaciones</li>
                    <li className={currentContent === 'consumo' ? 'active' : ''} onClick={() => handleNavigation('consumo')} id='consumo'>Consumo</li>
                    <li className={currentContent === 'usuario' ? 'active' : ''} onClick={() => handleNavigation('usuario')} id='usuarios'>Usuarios</li>
                    <li onClick={handleLogout} id='logout'>Cerrar Sesión</li>
                </ul>
            </aside>
            <main className="home-content">
                {currentContent === 'home' && (
                    <div>
                        <img src={logo} className="home-logo" alt="logo" />
                    </div>
                )}
                {currentContent === 'contadores' && (
                    <Contadores barrios={barrios} />
                )}
                {currentContent === 'ubicaciones' && (
                    <Ubicaciones barrios={barrios} />
                )}
                {currentContent === 'consumo' && (
                    <Consumo barriso={barrios} consumos={consumos}/>
                )}
                {currentContent === 'usuario' && (
                    <Usuarios barriso={usuarios}/>
                )}
            </main>
        </div>
    );
}

export default Inicio;
