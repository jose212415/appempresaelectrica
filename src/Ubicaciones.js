import React, { useState, useEffect } from 'react';
import { collection, getDocs, addDoc, query, where } from 'firebase/firestore';
import { db } from './firebase';
import './Ubicaciones.css';

function Ubicaciones() {
    const [barrios, setBarrios] = useState([]);
    const [contadores, setContadores] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [newBarrioData, setNewBarrioData] = useState({
        nombre_barrio: ''
    });
    const [errors, setErrors] = useState({});

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

        const fetchContadores = async () => {
            try {
                const contadoresRef = collection(db, 'Contadores');
                const querySnapshot = await getDocs(contadoresRef);
                const contadoresData = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                setContadores(contadoresData);
            } catch (error) {
                console.error('Error fetching contadores:', error);
            }
        };

        fetchBarrios();
        fetchContadores();
    }, []);

    const openModal = () => setShowModal(true);
    const closeModal = () => {
        setShowModal(false);
        setNewBarrioData({
            nombre_barrio: ''
        });
        setErrors({}); // Limpiar errores al cerrar el modal
    };

    const handleNewBarrioChange = (e) => {
        setNewBarrioData({
            ...newBarrioData,
            [e.target.name]: e.target.value,
        });
    };

    const validate = async () => {
        const newErrors = {};
    
        if (!newBarrioData.nombre_barrio) {
            newErrors.nombre_barrio = 'El nombre del barrio es requerido';
        } else {
            // Verificar si el nombre del barrio ya existe (ignorando mayúsculas/minúsculas)
            const barrioExistsQuery = query(collection(db, 'Barrios'), where('nombre_barrio_lowercase', '==', newBarrioData.nombre_barrio.toLowerCase()));
            const querySnapshot = await getDocs(barrioExistsQuery);
    
            if (!querySnapshot.empty) {
                newErrors.nombre_barrio = 'El barrio ya está registrado';
            } else {
                newErrors.nombre_barrio = ''; // Limpiar error si pasa la validación
            }
        }
    
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };
    
    const registrarBarrio = async () => {
        if (!validate()) return;
    
        try {
            // Registrar el barrio
            const barrioExistsQuery = query(collection(db, 'Barrios'), where('nombre_barrio_lowercase', '==', newBarrioData.nombre_barrio.toLowerCase()));
            const querySnapshot = await getDocs(barrioExistsQuery);
    
            if (!querySnapshot.empty) {
                // Si aún existe, mostrar error y no registrar
                setErrors({
                    nombre_barrio: 'El barrio ya está registrado'
                });
                return;
            }
    
            const barriosRef = collection(db, 'Barrios');
            await addDoc(barriosRef, {
                nombre_barrio: newBarrioData.nombre_barrio,
                nombre_barrio_lowercase: newBarrioData.nombre_barrio.toLowerCase()
            });
    
            const updatedBarrios = await getDocs(collection(db, 'Barrios'));
            const updatedBarriosData = updatedBarrios.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setBarrios(updatedBarriosData);
    
            closeModal();
        } catch (error) {
            console.error('Error al registrar barrio:', error);
        }
    };

    const barrioContadoresCount = barrios.map(barrio => {
        const contadoresCount = contadores.filter(contador => contador.ubicacion === barrio.id).length;
        return {
            ...barrio,
            contadoresCount
        };
    });

    return (
        <div className="contadores-table-container">
            <h2>Ubicaciones</h2>
            <div className="contadores-actions">
                <button onClick={openModal}>Registrar Ubicación</button>
            </div>
            <table className="contadores-table">
                <thead>
                    <tr>
                        <th>Nombre Barrio</th>
                        <th>Número de Contadores</th>
                    </tr>
                </thead>
                <tbody>
                    {barrioContadoresCount.map((barrio, index) => (
                        <tr key={index}>
                            <td>{barrio.nombre_barrio}</td>
                            <td>{barrio.contadoresCount}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
            {showModal && (
                <div className="modal">
                    <div className="modal-content">
                        <span className="close" onClick={closeModal}>&times;</span>
                        <h2>Registrar Ubicación</h2>
                        <label>Nombre de la Ubicación:</label>
                        <input
                            type="text"
                            name="nombre_barrio"
                            value={newBarrioData.nombre_barrio}
                            onChange={handleNewBarrioChange}
                            placeholder='Nombre del barrio'
                            className={errors.nombre_barrio ? 'input-error' : 'input-success'}
                        />
                        {errors.nombre_barrio && <span className="error-message">{errors.nombre_barrio}</span>}
                        <button onClick={registrarBarrio}>Registrar</button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Ubicaciones;
