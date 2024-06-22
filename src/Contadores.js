import React, { useState, useEffect } from 'react';
import { collection, getDocs, doc, getDoc, addDoc } from 'firebase/firestore';
import { db } from './firebase';
import './Contadores.css';

function Contadores({ barrios }) {
    const [contadores, setContadores] = useState([]);
    const [selectedBarrio, setSelectedBarrio] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [newContadorData, setNewContadorData] = useState({
        numero_contador: '',
        propietario: '',
        ubicacion: '',
    });
    const [errors, setErrors] = useState({
        numero_contador: '',
        propietario: '',
        ubicacion: '',
    });

    const fetchContadores = async () => {
        try {
            const contadoresRef = collection(db, 'Contadores');
            const querySnapshot = await getDocs(contadoresRef);
            const contadoresData = [];

            for (const contador of querySnapshot.docs) {
                const contadorData = contador.data();
                const ubicacionId = contadorData.ubicacion;
                const ubicacionRef = doc(db, 'Barrios', ubicacionId);
                const ubicacionSnapshot = await getDoc(ubicacionRef);
                const ubicacionData = ubicacionSnapshot.data();
                const nombreBarrio = ubicacionData ? ubicacionData.nombre_barrio : 'Nombre no encontrado';

                contadoresData.push({
                    ...contadorData,
                    nombreBarrio: nombreBarrio
                });
            }

            setContadores(contadoresData);
        } catch (error) {
            console.error('Error fetching contadores:', error);
        }
    };

    useEffect(() => {
        fetchContadores();
    }, []);

    const handleBarrioChange = (e) => {
        setSelectedBarrio(e.target.value);
    };

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
    };

    const openModal = () => setShowModal(true);

    const closeModal = () => {
        setShowModal(false);
        // Limpiar los datos del nuevo contador al cerrar el modal
        setNewContadorData({
            numero_contador: '',
            propietario: '',
            ubicacion: '',
        });
        // Limpiar los errores al cerrar el modal
        setErrors({
            numero_contador: '',
            propietario: '',
            ubicacion: '',
        });
    };

    const handleNewContadorChange = (e) => {
        setNewContadorData({
            ...newContadorData,
            [e.target.name]: e.target.value,
        });
    };
    
    const handleUbicacionChange = (e) => {
        setNewContadorData({
            ...newContadorData,
            ubicacion: e.target.value,
        });
    };

    const registrarContador = async () => {
        try {
            // Validación básica de datos
            let formIsValid = true;
            const errorsCopy = { ...errors };
    
            if (!newContadorData.numero_contador) {
                errorsCopy.numero_contador = 'El número de contador es requerido';
                formIsValid = false;
            } else {
                errorsCopy.numero_contador = '';
            }
    
            if (!newContadorData.propietario) {
                errorsCopy.propietario = 'El propietario es requerido';
                formIsValid = false;
            } else {
                errorsCopy.propietario = '';
            }
    
            if (!newContadorData.ubicacion) {
                errorsCopy.ubicacion = 'La ubicación es requerida';
                formIsValid = false;
            } else {
                errorsCopy.ubicacion = '';
            }
    
            setErrors(errorsCopy);
    
            if (!formIsValid) {
                console.error('Por favor complete todos los campos requeridos.');
                return;
            }
    
            // Verificar si el número de contador ya existe
            const contadoresRef = collection(db, 'Contadores');
            const querySnapshot = await getDocs(contadoresRef);
            const contadorExists = querySnapshot.docs.some(doc => doc.data().numero_contador === newContadorData.numero_contador);
    
            if (contadorExists) {
                setErrors({
                    ...errors,
                    numero_contador: 'El número de contador ya está registrado'
                });
                return;
            }
    
            // Agregar el nuevo contador a Firestore
            await addDoc(contadoresRef, newContadorData);
    
            // Cerrar el modal y refrescar la lista de contadores
            closeModal();
            fetchContadores(); // Puedes implementar esta función para actualizar la lista de contadores
        } catch (error) {
            console.error('Error al registrar contador:', error);
        }
    };

    const filteredContadores = contadores.filter(contador => {
        const matchesBarrio = !selectedBarrio || contador.ubicacion === selectedBarrio;
        const matchesSearchTerm = contador.numero_contador.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesBarrio && matchesSearchTerm;
    });

    return (
        <div className="contadores-table-container">
            <h2>Contadores</h2>
            <div className="contadores-actions">
                <button onClick={openModal}>Registrar Contador</button>
                <select onChange={handleBarrioChange} value={selectedBarrio}>
                    <option value="">Todos los Barrios</option>
                    {barrios.map(barrio => (
                        <option key={barrio.id} value={barrio.id}>{barrio.nombre_barrio}</option>
                    ))}
                </select>
                <input
                    type="text"
                    placeholder="Buscar por Número de Contador"
                    value={searchTerm}
                    onChange={handleSearchChange}
                />
            </div>
            <table className="contadores-table">
                <thead>
                    <tr>
                        <th>Número Contador</th>
                        <th>Propietario</th>
                        <th>Nombre Barrio</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredContadores.map((contador, index) => (
                        <tr key={index}>
                            <td>{contador.numero_contador}</td>
                            <td>{contador.propietario}</td>
                            <td>{contador.nombreBarrio}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
            {showModal && (
                <div className="modal">
                    <div className="modal-content">
                        <span className="close" onClick={closeModal}>&times;</span>
                        <h2>Registrar Contador</h2>
                        <label>Número de Contador:</label>
                        <input
                            type="text"
                            name="numero_contador"
                            value={newContadorData.numero_contador}
                            onChange={handleNewContadorChange}
                            placeholder='Ejemplo: 121465491'
                            className={errors.numero_contador ? 'input-error' : ''}
                        />
                        {errors.numero_contador && <p className="error-message">{errors.numero_contador}</p>}
                        <label>Propietario:</label>
                        <input
                            type="text"
                            name="propietario"
                            value={newContadorData.propietario}
                            onChange={handleNewContadorChange}
                            placeholder='Propietario'
                            className={errors.propietario ? 'input-error' : ''}
                        />
                        {errors.propietario && <p className="error-message">{errors.propietario}</p>}
                        <label>Ubicación:</label>
                        <select
                            onChange={handleUbicacionChange}
                            value={newContadorData.ubicacion}
                            className={errors.ubicacion ? 'input-error' : ''}
                        >
                            <option value="">Seleccionar Barrio</option>
                            {barrios.map(barrio => (
                                <option key={barrio.id} value={barrio.id}>{barrio.nombre_barrio}</option>
                            ))}
                        </select>
                        {errors.ubicacion && <p className="error-message">{errors.ubicacion}</p>}
                        <button onClick={registrarContador}>Registrar</button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Contadores;
