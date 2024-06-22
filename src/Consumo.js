import React, { useState, useEffect } from 'react';
import { collection, getDocs, doc, getDoc} from 'firebase/firestore';
import { db } from './firebase';
import './Consumo.css';

function Consumo() {
    const [selectedBarrio, setSelectedBarrio] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [consumosData, setConsumosData] = useState([]);
    const [barrios, setBarrios] = useState([]);
    const [precioElectricidad, setPrecioElectricidad] = useState(0);
    const [selectedMonth, setSelectedMonth] = useState('');
    const [selectedYear, setSelectedYear] = useState('');
    const [selectedConsumo, setSelectedConsumo] = useState('');
    const [sortByCosto, setSortByCosto] = useState('');

    useEffect(() => {

        /*function convertirFecha(fechaDDMMYYYY) {
            const partesFecha = fechaDDMMYYYY.split('-');
            return `${partesFecha[2]}-${partesFecha[1]}-${partesFecha[0]}`;
        };*/

        const fetchConsumos = async () => {
            const consumosRef = collection(db, 'Consumo');
            const querySnapshot = await getDocs(consumosRef);
            const consumosList = [];

            for (const consumoDoc of querySnapshot.docs) {
                const consumoData = consumoDoc.data();
                const contadorRef = doc(db, 'Contadores', consumoData.contadorId);
                const contadorSnapshot = await getDoc(contadorRef);

                if (contadorSnapshot.exists()) {
                    const contadorData = contadorSnapshot.data();
                    const partesFecha = consumoData.fecha.split('-');
                    const fechaFormateada = `${partesFecha[2]}-${partesFecha[1]}-${partesFecha[0]}`;
                    consumosList.push({
                        ...consumoData,
                        fecha: fechaFormateada,
                        numero_contador: contadorData.numero_contador
                    });
                } else {
                    consumosList.push({
                        ...consumoData,
                        numero_contador: 'Número no encontrado'
                    });
                }
            }

            /*    // Datos simulados
            const mockConsumos = [
                { barrioId: '1', contadorId: '1', consumo: 100, fecha: '31-05-2024', nombre_barrio: 'Barrio 1', propietario: 'Propietario 1', numero_contador: '12345' },
                { barrioId: '1', contadorId: '2', consumo: 500, fecha: '31-05-2024', nombre_barrio: 'Barrio 1', propietario: 'Propietario 2', numero_contador: '67890' },
                { barrioId: '1', contadorId: '3', consumo: 400, fecha: '31-05-2024', nombre_barrio: 'Barrio 1', propietario: 'Propietario 3', numero_contador: '89161' },
                { barrioId: '1', contadorId: '1', consumo: 300, fecha: '30-06-2024', nombre_barrio: 'Barrio 1', propietario: 'Propietario 1', numero_contador: '12345' },
                { barrioId: '1', contadorId: '2', consumo: 1000, fecha: '30-06-2024', nombre_barrio: 'Barrio 1', propietario: 'Propietario 2', numero_contador: '67890' },
                { barrioId: '1', contadorId: '1', consumo: 600, fecha: '31-07-2024', nombre_barrio: 'Barrio 1', propietario: 'Propietario 1', numero_contador: '12345' },
                { barrioId: '1', contadorId: '2', consumo: 1500, fecha: '31-07-2024', nombre_barrio: 'Barrio 1', propietario: 'Propietario 2', numero_contador: '67890' },
                { barrioId: '1', contadorId: '1', consumo: 1200, fecha: '30-08-2024', nombre_barrio: 'Barrio 1', propietario: 'Propietario 1', numero_contador: '12345' },       
                { barrioId: '1', contadorId: '2', consumo: 2000, fecha: '30-08-2024', nombre_barrio: 'Barrio 1', propietario: 'Propietario 2', numero_contador: '67890' },
                { barrioId: '1', contadorId: '3', consumo: 2393, fecha: '30-06-2024', nombre_barrio: 'Barrio 1', propietario: 'Propietario 3', numero_contador: '89161' },
                { barrioId: '1', contadorId: '3', consumo: 90, fecha: '31-07-2024', nombre_barrio: 'Barrio 1', propietario: 'Propietario 3', numero_contador: '89161' },
                // Agrega más datos simulados según sea necesario
            ];

            const mockBarrios = [
                { id: '1', nombre_barrio: 'Barrio 1' },
                { id: '2', nombre_barrio: 'Barrio 2' },
                // Agrega más barrios simulados según sea necesario
            ];

            const mockPrecioElectricidad = 0.12; // Precio simulado de electricidad

            // Simula la lógica de procesamiento de datos
            const consumosList = mockConsumos.map(consumo => ({
                ...consumo,
                fecha: convertirFecha(consumo.fecha),
                numero_contador: consumo.numero_contador || 'Número no encontrado'
            }));*/

            // Calcular consumo como diferencia con el mes anterior para el mismo contador
            // Agrupar consumos por contador
            const consumosPorContador = consumosList.reduce((acc, consumo) => {
                if (!acc[consumo.contadorId]) {
                    acc[consumo.contadorId] = [];
                }
                acc[consumo.contadorId].push(consumo);
                return acc;
            }, {});

            // Calcular diferencias de consumo para cada contador
            Object.values(consumosPorContador).forEach(consumos => {
                consumos.sort((a, b) => new Date(a.fecha) - new Date(b.fecha));

                for (let i = 0; i < consumos.length; i++) {
                    const consumoActual = consumos[i];
                    const mesActual = new Date(consumoActual.fecha).getMonth();
                    
                    // Encontrar el consumo del mes anterior
                    let consumoMesAnterior = null;
                    for (let j = i - 1; j >= 0; j--) {
                        const consumoAnterior = consumos[j];
                        const mesAnterior = new Date(consumoAnterior.fecha).getMonth();
                        
                        if (mesAnterior === mesActual - 1 || (mesAnterior === 11 && mesActual === 0)) {
                            consumoMesAnterior = consumoAnterior;
                            break;
                        }
                    }
                    
                    // Calcular la diferencia con el consumo del mes anterior si está disponible
                    if (consumoMesAnterior && consumoMesAnterior.consumo_total !== null) {
                        consumoActual.consumo_total = consumoActual.consumo;
                        consumoActual.consumo = consumoActual.consumo - consumoMesAnterior.consumo_total;
                    } else {
                        // Si no hay consumo del mes anterior, establecer el consumo total actual como el consumo total
                        consumoActual.consumo_total = consumoActual.consumo;
                    }
                }
            });

            console.log(consumosPorContador);

            setConsumosData(consumosList);
        };

        const fetchPrecioElectricidad = async () => {
            const precioRef = doc(db, 'PrecioElectricidad', 'A8bMsKgC1nRoTlgIgdZQ');
            const precioSnapshot = await getDoc(precioRef);
            if (precioSnapshot.exists()) {
                setPrecioElectricidad(precioSnapshot.data().precio_electricidad);
            } else {
                console.error('Precio de electricidad no encontrado');
            }
        };

        const fetchBarrios = async () => {
            const barriosRef = collection(db, 'Barrios');
            const barriosSnapshot = await getDocs(barriosRef);
            const barriosList = barriosSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setBarrios(barriosList);
        };

        fetchConsumos();
        fetchPrecioElectricidad();
        fetchBarrios();
    }, []);

    const handleBarrioChange = (e) => {
        setSelectedBarrio(e.target.value);
    };

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
    };

    const handleMonthChange = (e) => {
        setSelectedMonth(e.target.value);
    };

    const handleYearChange = (e) => {
        setSelectedYear(e.target.value);
    };

    const handleConsumoChange = (e) => {
        setSelectedConsumo(e.target.value);
    };

    const handleSortByCostoChange = (e) => {
        setSortByCosto(e.target.value);
    };

    const calculateCosto = (consumo) => {
        return consumo.consumo * precioElectricidad;
    };

    let sortedConsumos = [...consumosData];

    if (sortByCosto === 'asc') {
        sortedConsumos.sort((a, b) => {
            const costoA = calculateCosto(a);
            const costoB = calculateCosto(b);
            return costoA - costoB;
        });
    } else if (sortByCosto === 'desc') {
        sortedConsumos.sort((a, b) => {
            const costoA = calculateCosto(a);
            const costoB = calculateCosto(b);
            return costoB - costoA;
        });
    }

    const filteredConsumos = sortedConsumos.filter(consumo => {
        const matchesBarrio = !selectedBarrio || consumo.barrioId === selectedBarrio;
        const matchesSearchTerm = consumo.numero_contador.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesMonth = !selectedMonth || consumo.fecha.includes(selectedMonth);
        const matchesYear = !selectedYear || consumo.fecha.includes(selectedYear);
        let matchesConsumo = true;
        if (selectedConsumo === "10") {
            matchesConsumo = parseFloat(consumo.consumo) < 100;
        }
        else if (selectedConsumo === "100") {
            matchesConsumo = parseFloat(consumo.consumo) >= 100 && parseFloat(consumo.consumo) <= 500;
        } else if (selectedConsumo === "600") {
            matchesConsumo = parseFloat(consumo.consumo) > 500;
        }

        return matchesBarrio && matchesSearchTerm && matchesMonth && matchesYear && matchesConsumo;
    });

    return (
        <div className="contadores-table-container">
            <h2>Consumos</h2>
            <div className="contadores-actions">
                <select onChange={handleBarrioChange} value={selectedBarrio}>
                    <option value="">Todos los Barrios</option>
                    {barrios.map(barrio => (
                        <option key={barrio.id} value={barrio.id}>{barrio.nombre_barrio}</option>
                    ))}
                </select>
                <select onChange={handleMonthChange} value={selectedMonth}>
                    <option value="">Seleccionar Mes</option>
                    <option value="01">Enero</option>
                    <option value="02">Febrero</option>
                    <option value="03">Marzo</option>
                    <option value="04">Abril</option>
                    <option value="05">Mayo</option>
                    <option value="06">Junio</option>
                    <option value="07">Julio</option>
                    <option value="08">Agosto</option>
                    <option value="09">Septiembre</option>
                    <option value="10">Octubre</option>
                    <option value="11">Noviembre</option>
                    <option value="12">Diciembre</option>
                </select>
                <select onChange={handleYearChange} value={selectedYear}>
                    <option value="">Seleccionar Año</option>
                    <option value="2024">2024</option>
                    <option value="2023">2023</option>
                    <option value="2022">2022</option>
                    {/* Add more years as needed */}
                </select>
                <select onChange={handleConsumoChange} value={selectedConsumo}>
                    <option value="">Seleccionar Consumo</option>
                    <option value="10">Menos de 100 kWh</option>
                    <option value="100">Entre 100 y 500 kWh</option>
                    <option value="600">Más de 500 kWh</option>
                </select>
                <select onChange={handleSortByCostoChange} value={sortByCosto}>
                    <option value="">Ordenar por Costo</option>
                    <option value="asc">Menor a Mayor</option>
                    <option value="desc">Mayor a Menor</option>
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
                        <th>Número de Contador</th>
                        <th>Propietario</th>
                        <th>Nombre Barrio</th>
                        <th>Fecha</th>
                        <th>Consumo Total kWh</th>
                        <th>Consumo Mes kWh</th>
                        <th>Costo</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredConsumos.map((consumo, index) => (
                        <tr key={index}>
                            <td>{consumo.numero_contador}</td>
                            <td>{consumo.propietario}</td>
                            <td>{consumo.nombre_barrio}</td>
                            <td>{consumo.fecha}</td>
                            <td>{consumo.consumo_total} kWh</td>
                            <td>{consumo.consumo} kWh</td>
                            <td>Q.{(consumo.consumo * precioElectricidad).toFixed(2)}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default Consumo;
