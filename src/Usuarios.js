import React, { useState, useEffect } from 'react';
import { collection, getDocs, addDoc, query, where } from 'firebase/firestore';
import { db } from './firebase';
import './Usuarios.css';

function Usuarios() {
    const [usuarios, setUsuarios] = useState([]);
    const [searchUsuario, setSearchUsuario] = useState('');
    const [searchEmpleado, setSearchEmpleado] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [newUsuarioData, setNewUsuarioData] = useState({
        nombre_usuario: '',
        contraseña: '',
        nombre_empleado: '',
        puesto: ''
    });
    const [errors, setErrors] = useState({});

    const fetchUsuarios = async () => {
        const usuariosRef = collection(db, 'Usuarios');
        const usuariosSnapshot = await getDocs(usuariosRef);
        const usuariosList = usuariosSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setUsuarios(usuariosList);
    };

    useEffect(() => {
        fetchUsuarios();
    }, []);

    const handleSearchUsuarioChange = (e) => {
        setSearchUsuario(e.target.value);
    };

    const handleSearchEmpleadoChange = (e) => {
        setSearchEmpleado(e.target.value);
    };

    const openModal = () => setShowModal(true);

    const closeModal = () => {
        setShowModal(false);
        setNewUsuarioData({
            nombre_usuario: '',
            contraseña: '',
            nombre_empleado: '',
            puesto: ''
        });
        setErrors({});
    };

    const handleNewUsuarioChange = (e) => {
        const { name, value } = e.target;
        setNewUsuarioData({
            ...newUsuarioData,
            [name]: name === 'nombre_usuario' ? value.toLowerCase() : value,
        });
    };

    const registrarUsuario = async () => {
        try {
            const newErrors = {};

            // Validar campos vacíos
            if (!newUsuarioData.nombre_usuario) {
                newErrors.nombre_usuario = 'El nombre de usuario es requerido';
            }

            if (!newUsuarioData.contraseña) {
                newErrors.contraseña = 'La contraseña es requerida';
            }

            if (!newUsuarioData.nombre_empleado) {
                newErrors.nombre_empleado = 'El nombre del empleado es requerido';
            }

            if (!newUsuarioData.puesto) {
                newErrors.puesto = 'El puesto es requerido';
            }

            setErrors(newErrors);

            // Si hay errores, no continuar con el registro
            if (Object.keys(newErrors).length > 0) {
                console.error('Por favor complete todos los campos requeridos.');
                return;
            }

            const usuariosRef = collection(db, 'Usuarios');

            // Verificar si el nombre de usuario ya existe
            const usuarioQuery = query(usuariosRef, where('nombre_usuario', '==', newUsuarioData.nombre_usuario));
            const usuarioSnapshot = await getDocs(usuarioQuery);
            if (!usuarioSnapshot.empty) {
                setErrors(prevErrors => ({ ...prevErrors, nombre_usuario: 'El nombre de usuario ya existe' }));
                console.error('El nombre de usuario ya existe');
                return;
            }

            // Verificar si el nombre de empleado ya existe
            const empleadoQuery = query(usuariosRef, where('nombre_empleado', '==', newUsuarioData.nombre_empleado));
            const empleadoSnapshot = await getDocs(empleadoQuery);
            if (!empleadoSnapshot.empty) {
                setErrors(prevErrors => ({ ...prevErrors, nombre_empleado: 'El nombre de empleado ya existe' }));
                console.error('El nombre de empleado ya existe');
                return;
            }

            await addDoc(usuariosRef, newUsuarioData);

            closeModal();
            fetchUsuarios();
        } catch (error) {
            console.error('Error al registrar usuario:', error);
        }
    };

    const filteredUsuarios = usuarios.filter(usuario => {
        const matchesUsuario = usuario.nombre_usuario.toLowerCase().includes(searchUsuario.toLowerCase());
        const matchesEmpleado = usuario.nombre_empleado.toLowerCase().includes(searchEmpleado.toLowerCase());
        return matchesUsuario && matchesEmpleado;
    });

    return (
        <div className="usuarios-table-container">
            <h2>Usuarios</h2>
            <div className="usuarios-actions">
                <button onClick={openModal}>Registrar Usuario</button>
                <input
                    type="text"
                    placeholder="Buscar por Nombre de Usuario"
                    value={searchUsuario}
                    onChange={handleSearchUsuarioChange}
                />
                <input
                    type="text"
                    placeholder="Buscar por Nombre de Empleado"
                    value={searchEmpleado}
                    onChange={handleSearchEmpleadoChange}
                />
            </div>
            <table className="usuarios-table">
                <thead>
                    <tr>
                        <th>Nombre de Usuario</th>
                        <th>Contraseña</th>
                        <th>Nombre Empleado</th>
                        <th>Puesto</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredUsuarios.map((usuario, index) => (
                        <tr key={index}>
                            <td>{usuario.nombre_usuario}</td>
                            <td>{usuario.contraseña}</td>
                            <td>{usuario.nombre_empleado}</td>
                            <td>{usuario.puesto}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
            {showModal && (
                <div className="modal">
                    <div className="modal-content">
                        <span className="close" onClick={closeModal}>&times;</span>
                        <h2>Registrar Usuario</h2>
                        <label>Nombre de Usuario:</label>
                        <input 
                            type="text" 
                            name="nombre_usuario" 
                            value={newUsuarioData.nombre_usuario} 
                            onChange={handleNewUsuarioChange} 
                            placeholder='ejem. juan123'
                            className={errors.nombre_usuario ? 'input-error' : ''}
                        />
                        {errors.nombre_usuario && <p className="error-message">{errors.nombre_usuario}</p>}
                        <label>Contraseña:</label>
                        <input 
                            type="text" 
                            name="contraseña" 
                            value={newUsuarioData.contraseña} 
                            onChange={handleNewUsuarioChange} 
                            placeholder='contraseña'
                            className={errors.contraseña ? 'input-error' : ''}
                        />
                        {errors.contraseña && <p className="error-message">{errors.contraseña}</p>}
                        <label>Nombre Empleado:</label>
                        <input 
                            type="text" 
                            name="nombre_empleado" 
                            value={newUsuarioData.nombre_empleado} 
                            onChange={handleNewUsuarioChange} 
                            placeholder='ejem. Juan Pérez'
                            className={errors.nombre_empleado ? 'input-error' : ''}
                        />
                        {errors.nombre_empleado && <p className="error-message">{errors.nombre_empleado}</p>}
                        <label>Puesto:</label>
                        <input 
                            type="text" 
                            name="puesto" 
                            value={newUsuarioData.puesto} 
                            onChange={handleNewUsuarioChange} 
                            placeholder='ejem. Gerente'
                            className={errors.puesto ? 'input-error' : ''}
                        />
                        {errors.puesto && <p className="error-message">{errors.puesto}</p>}
                        <button onClick={registrarUsuario}>Registrar</button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Usuarios;
