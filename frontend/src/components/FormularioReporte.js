import React, { useState, useEffect, useRef } from 'react';

const FormularioReporte = ({ usuarioActivo, onReportCreated, API_URL, setVistaActiva }) => {
    const [titulo, setTitulo] = useState('');
    const [descripcion, setDescripcion] = useState('');
    const [categoria, setCategoria] = useState('Basura');
    const [severidad, setSeveridad] = useState('Media');
    const [ubicacionNombre, setUbicacionNombre] = useState('');
    const [latitud, setLatitud] = useState(19.4326); // CDMX default
    const [longitud, setLongitud] = useState(-99.1332);
    const [imagen, setImagen] = useState('');
    const [imgPreview, setImgPreview] = useState('');
    
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    
    const mapRef = useRef(null);
    const markerRef = useRef(null);

    // Initial Geolocation to center the map closer to the user
    useEffect(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setLatitud(position.coords.latitude);
                    setLongitud(position.coords.longitude);
                },
                (err) => console.log('Geolocation not accepted/available, using default center.')
            );
        }
    }, []);

    // Initialize Leaflet Map
    useEffect(() => {
        if (!window.L) return;

        // Container clean-up before initializing
        const mapContainer = document.getElementById('map-create');
        if (!mapContainer) return;

        // Initialize Map
        const map = window.L.map('map-create').setView([latitud, longitud], 14);
        mapRef.current = map;

        // Add OpenStreetMap layer (Standard colorful maps)
        window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
            maxZoom: 19
        }).addTo(map);

        // Fix leaflet blank/white container rendering issue in React hidden tabs
        setTimeout(() => {
            map.invalidateSize();
        }, 250);

        // Add initial marker
        const marker = window.L.marker([latitud, longitud], { draggable: true }).addTo(map);
        markerRef.current = marker;

        // Update coordinates on dragend
        marker.on('dragend', () => {
            const position = marker.getLatLng();
            setLatitud(position.lat.toFixed(6));
            setLongitud(position.lng.toFixed(6));
        });

        // Click map to reposition marker
        map.on('click', (e) => {
            const { lat, lng } = e.latlng;
            marker.setLatLng([lat, lng]);
            setLatitud(lat.toFixed(6));
            setLongitud(lng.toFixed(6));
        });

        return () => {
            if (mapRef.current) {
                mapRef.current.remove();
                mapRef.current = null;
            }
        };
    }, [latitud, longitud]);

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (file.size > 5 * 1024 * 1024) {
            setError('La imagen es demasiado grande. El límite es 5MB.');
            return;
        }

        const reader = new FileReader();
        reader.onloadend = () => {
            setImagen(reader.result);
            setImgPreview(reader.result);
        };
        reader.readAsDataURL(file);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        
        if (!usuarioActivo) {
            setError('Debes tener un perfil seleccionado para poder realizar una publicación.');
            return;
        }

        if (!titulo || !descripcion || !ubicacionNombre || !imagen) {
            setError('Por favor, completa todos los campos (incluyendo la foto).');
            return;
        }

        setLoading(true);

        try {
            const res = await fetch(`${API_URL}/api/publicaciones`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    usuarioId: usuarioActivo._id,
                    titulo,
                    descripcion,
                    categoria,
                    severidad,
                    ubicacionNombre,
                    latitud: Number(latitud),
                    longitud: Number(longitud),
                    imagen
                })
            });

            const data = await res.json();
            if (res.ok) {
                // Clear fields
                setTitulo('');
                setDescripcion('');
                setUbicacionNombre('');
                setImagen('');
                setImgPreview('');
                
                if (onReportCreated) onReportCreated();
                setVistaActiva('feed'); // Go back to feed
            } else {
                setError(data.message || 'Error al guardar la publicación.');
            }
        } catch (err) {
            setError('Error de comunicación con el servidor backend.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container py-4">
            <div className="row justify-content-center">
                <div className="col-lg-10">
                    <div className="glass-card p-4">
                        <div className="d-flex align-items-center mb-4 pb-2 border-bottom border-secondary">
                            <i className="bi bi-trash-fill text-emerald fs-2 me-3" style={{ color: 'var(--accent-primary)' }}></i>
                            <div>
                                <h2 className="mb-0 fw-bold text-white">Reportar un Lugar Sucio</h2>
                                <p className="text-secondary mb-0 small">Registra un foco de contaminación para que la comunidad colabore en limpiarlo.</p>
                            </div>
                        </div>

                        {!usuarioActivo && (
                            <div className="alert alert-warning mb-4">
                                <i className="bi bi-exclamation-triangle-fill me-2"></i>
                                <strong>¡Importante!</strong> No tienes un perfil activo. Selecciona o crea uno en la pestaña <strong>Comunidad</strong> o en la barra de navegación para poder publicar.
                            </div>
                        )}

                        {error && <div className="alert alert-danger mb-4">{error}</div>}

                        <form onSubmit={handleSubmit}>
                            <div className="row">
                                {/* Columna Izquierda - Detalles del Reporte */}
                                <div className="col-md-6 mb-4">
                                    <h5 className="text-light mb-3"><i className="bi bi-card-text me-2"></i>Detalles del Reporte</h5>
                                    
                                    <div className="mb-3">
                                        <label className="form-label text-secondary small">Título del Reporte *</label>
                                        <input
                                            type="text"
                                            className="form-control form-control-custom"
                                            placeholder="Ej. Acumulación de basura en parque central"
                                            value={titulo}
                                            onChange={(e) => setTitulo(e.target.value)}
                                            required
                                        />
                                    </div>

                                    <div className="mb-3">
                                        <label className="form-label text-secondary small">Descripción detallada *</label>
                                        <textarea
                                            className="form-control form-control-custom"
                                            rows="4"
                                            placeholder="Describe qué tipo de desechos hay, la cantidad aproximada, riesgos asociados, etc."
                                            value={descripcion}
                                            onChange={(e) => setDescripcion(e.target.value)}
                                            required
                                        ></textarea>
                                    </div>

                                    <div className="row mb-3">
                                        <div className="col-6">
                                            <label className="form-label text-secondary small">Categoría *</label>
                                            <select
                                                className="form-select form-control-custom"
                                                value={categoria}
                                                onChange={(e) => setCategoria(e.target.value)}
                                            >
                                                <option value="Basura">Basura / Desechos</option>
                                                <option value="Escombros">Escombros / Escombreras</option>
                                                <option value="Fuga de Agua">Fuga de Agua / Aguas negras</option>
                                                <option value="Graffiti">Graffiti / Vandalismo</option>
                                                <option value="Otro">Otro Foco de Infección</option>
                                            </select>
                                        </div>
                                        <div className="col-6">
                                            <label className="form-label text-secondary small">Severidad *</label>
                                            <select
                                                className="form-select form-control-custom"
                                                value={severidad}
                                                onChange={(e) => setSeveridad(e.target.value)}
                                            >
                                                <option value="Baja">Baja (Molestia menor)</option>
                                                <option value="Media">Media (Impacto al entorno)</option>
                                                <option value="Alta">Alta (Riesgo sanitario/urgente)</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div className="mb-3">
                                        <label className="form-label text-secondary small">Subir Foto del Lugar Sucio *</label>
                                        <input
                                            type="file"
                                            className="form-control form-control-custom"
                                            accept="image/*"
                                            onChange={handleImageChange}
                                            required
                                        />
                                        <small className="text-muted d-block mt-1">Formatos permitidos: JPG, PNG. Máx 5MB.</small>
                                    </div>

                                    {imgPreview && (
                                        <div className="mb-3 text-center border rounded-3 p-2 bg-dark">
                                            <p className="text-secondary small mb-1">Vista Previa:</p>
                                            <img
                                                src={imgPreview}
                                                alt="Preview"
                                                className="img-fluid rounded"
                                                style={{ maxHeight: '200px', objectFit: 'cover' }}
                                            />
                                        </div>
                                    )}
                                </div>

                                {/* Columna Derecha - Ubicación y Mapa */}
                                <div className="col-md-6 mb-4 d-flex flex-column">
                                    <h5 className="text-light mb-3"><i className="bi bi-geo-alt-fill me-2"></i>Ubicación Geográfica</h5>
                                    
                                    <div className="mb-3">
                                        <label className="form-label text-secondary small">Dirección / Referencia de Texto *</label>
                                        <input
                                            type="text"
                                            className="form-control form-control-custom"
                                            placeholder="Ej. Calle Juárez frente al OXXO, Col. Centro"
                                            value={ubicacionNombre}
                                            onChange={(e) => setUbicacionNombre(e.target.value)}
                                            required
                                        />
                                    </div>

                                    <p className="text-secondary small mb-2">
                                        Haz clic o arrastra el marcador en el mapa para registrar las coordenadas exactas:
                                    </p>
                                    
                                    <div 
                                        id="map-create" 
                                        style={{ height: '250px', width: '100%', marginBottom: '15px' }}
                                        className="flex-grow-1 shadow-sm rounded-3"
                                    ></div>

                                    <div className="row text-center bg-dark p-2 rounded-3 border border-secondary small">
                                        <div className="col-6 text-secondary border-end">
                                            Lat: <span className="text-white fw-medium">{latitud}</span>
                                        </div>
                                        <div className="col-6 text-secondary">
                                            Lng: <span className="text-white fw-medium">{longitud}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="d-flex justify-content-end gap-3 mt-4 pt-3 border-top border-secondary">
                                <button
                                    type="button"
                                    className="btn btn-secondary-custom"
                                    onClick={() => setVistaActiva('feed')}
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="btn btn-primary-custom px-5"
                                    disabled={loading || !usuarioActivo}
                                >
                                    {loading ? (
                                        <>
                                            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                            Publicando...
                                        </>
                                    ) : 'Publicar Reporte'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FormularioReporte;
