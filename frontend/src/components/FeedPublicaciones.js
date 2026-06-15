import React, { useState, useEffect, useRef } from 'react';

// Sub-component for individual post map to isolate Leaflet map initialization logic
const PostMap = ({ lat, lng, id }) => {
    const mapRef = useRef(null);

    useEffect(() => {
        if (!window.L) return;

        const mapId = `map-${id}`;
        const container = document.getElementById(mapId);
        if (!container) return;

        // Initialize map
        const map = window.L.map(mapId, {
            center: [lat, lng],
            zoom: 15,
            zoomControl: true,
            scrollWheelZoom: false
        });
        mapRef.current = map;

        // Add OpenStreetMap layer (Standard colorful maps)
        window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; OpenStreetMap contributors',
            maxZoom: 19
        }).addTo(map);

        // Fix leaflet blank/white container rendering issue in React hidden tabs
        setTimeout(() => {
            map.invalidateSize();
        }, 250);

        // Add Marker
        window.L.marker([lat, lng]).addTo(map)
            .bindPopup("Ubicación del Reporte")
            .openPopup();

        return () => {
            if (mapRef.current) {
                mapRef.current.remove();
                mapRef.current = null;
            }
        };
    }, [lat, lng, id]);

    return (
        <div 
            id={`map-${id}`} 
            style={{ height: '200px', width: '100%' }} 
            className="rounded-3 shadow-sm border border-secondary mt-2"
        ></div>
    );
};

const FeedPublicaciones = ({ 
    publicaciones, 
    usuarioActivo, 
    onActionCompleted, 
    API_URL, 
    onOpenUserSelector,
    isAdmin
}) => {
    const [comentariosAbiertos, setComentariosAbiertos] = useState({});
    const [mapasAbiertos, setMapasAbiertos] = useState({});
    
    // Comment inputs state
    const [comentarioTexto, setComentarioTexto] = useState({});
    
    // Clean-up action state (post ID being resolved)
    const [resolvingPostId, setResolvingPostId] = useState(null);
    const [fotoDespues, setFotoDespues] = useState('');
    const [fotoDespuesPreview, setFotoDespuesPreview] = useState('');
    const [errorResolving, setErrorResolving] = useState('');
    const [loadingResolve, setLoadingResolve] = useState(false);

    // Filters state
    const [filtroCategoria, setFiltroCategoria] = useState('');
    const [filtroSeveridad, setFiltroSeveridad] = useState('');
    const [filtroEstado, setFiltroEstado] = useState('');

    const handleDeletePost = async (postId) => {
        if (window.confirm('¿Estás seguro de que deseas eliminar este reporte permanentemente?')) {
            try {
                const res = await fetch(`${API_URL}/api/publicaciones/${postId}`, {
                    method: 'DELETE'
                });
                if (res.ok) {
                    onActionCompleted();
                } else {
                    const data = await res.json();
                    alert(data.message || 'Error al eliminar el reporte.');
                }
            } catch (err) {
                console.error('Error deleting post:', err);
                alert('Error de conexión con el servidor.');
            }
        }
    };

    const handleDeleteComment = async (postId, commentId) => {
        if (window.confirm('¿Estás seguro de que deseas eliminar este comentario?')) {
            try {
                const res = await fetch(`${API_URL}/api/publicaciones/${postId}/comment/${commentId}`, {
                    method: 'DELETE'
                });
                if (res.ok) {
                    onActionCompleted();
                } else {
                    const data = await res.json();
                    alert(data.message || 'Error al eliminar el comentario.');
                }
            } catch (err) {
                console.error('Error deleting comment:', err);
                alert('Error de conexión con el servidor.');
            }
        }
    };

    const toggleComentarios = (postId) => {
        setComentariosAbiertos(prev => ({
            ...prev,
            [postId]: !prev[postId]
        }));
    };

    const toggleMapa = (postId) => {
        setMapasAbiertos(prev => ({
            ...prev,
            [postId]: !prev[postId]
        }));
    };

    const handleLike = async (postId) => {
        if (!usuarioActivo) {
            alert('Debes seleccionar un usuario para dar "Me gusta".');
            onOpenUserSelector();
            return;
        }

        try {
            const res = await fetch(`${API_URL}/api/publicaciones/${postId}/like`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ usuarioId: usuarioActivo._id })
            });

            if (res.ok) {
                onActionCompleted(); // Refresh feed
            }
        } catch (err) {
            console.error('Error at handleLike:', err);
        }
    };

    const handleCommentSubmit = async (e, postId) => {
        e.preventDefault();
        
        if (!usuarioActivo) {
            alert('Debes seleccionar un usuario para comentar.');
            onOpenUserSelector();
            return;
        }

        const texto = comentarioTexto[postId];
        if (!texto || !texto.trim()) return;

        try {
            const res = await fetch(`${API_URL}/api/publicaciones/${postId}/comment`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    usuarioId: usuarioActivo._id,
                    texto
                })
            });

            if (res.ok) {
                setComentarioTexto(prev => ({ ...prev, [postId]: '' }));
                onActionCompleted(); // Refresh feed
            }
        } catch (err) {
            console.error('Error commenting:', err);
        }
    };

    const handleCommentChange = (postId, val) => {
        setComentarioTexto(prev => ({
            ...prev,
            [postId]: val
        }));
    };

    const handleUpdateEstado = async (postId, nuevoEstado) => {
        if (!usuarioActivo) {
            alert('Debes seleccionar un usuario para cambiar el estado.');
            onOpenUserSelector();
            return;
        }

        if (nuevoEstado === 'Limpiado') {
            setResolvingPostId(postId);
            setFotoDespues('');
            setFotoDespuesPreview('');
            setErrorResolving('');
            return;
        }

        try {
            const res = await fetch(`${API_URL}/api/publicaciones/${postId}/estado`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    estado: nuevoEstado,
                    usuarioId: usuarioActivo._id
                })
            });

            if (res.ok) {
                onActionCompleted();
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleFotoDespuesChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onloadend = () => {
            setFotoDespues(reader.result);
            setFotoDespuesPreview(reader.result);
        };
        reader.readAsDataURL(file);
    };

    const handleResolveSubmit = async (e) => {
        e.preventDefault();
        setErrorResolving('');
        
        if (!fotoDespues) {
            setErrorResolving('Debes subir una foto que demuestre que el lugar está limpio.');
            return;
        }

        setLoadingResolve(true);

        try {
            const res = await fetch(`${API_URL}/api/publicaciones/${resolvingPostId}/estado`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    estado: 'Limpiado',
                    usuarioId: usuarioActivo._id,
                    fotoDespues
                })
            });

            if (res.ok) {
                setResolvingPostId(null);
                setFotoDespues('');
                setFotoDespuesPreview('');
                onActionCompleted();
            } else {
                const data = await res.json();
                setErrorResolving(data.message || 'Error al guardar la resolución.');
            }
        } catch (err) {
            setErrorResolving('Error de red al actualizar.');
            console.error(err);
        } finally {
            setLoadingResolve(false);
        }
    };

    // Filter publications client-side (or we can let the backend do it, but client-side is super fast and smooth!)
    const publicacionesFiltradas = publicaciones.filter(p => {
        const matchCat = !filtroCategoria || p.categoria === filtroCategoria;
        const matchSev = !filtroSeveridad || p.severidad === filtroSeveridad;
        const matchEst = !filtroEstado || p.estado === filtroEstado;
        return matchCat && matchSev && matchEst;
    });

    return (
        <div className="container py-4">
            {/* Header / Filter Toolbar */}
            <div className="glass-card p-3 mb-4">
                <div className="row align-items-center g-3">
                    <div className="col-md-3">
                        <h4 className="m-0 fw-bold"><i className="bi bi-filter-square-fill text-emerald me-2"></i>Filtrar Muro</h4>
                    </div>
                    <div className="col-md-3">
                        <select 
                            className="form-select form-control-custom py-1"
                            value={filtroCategoria}
                            onChange={(e) => setFiltroCategoria(e.target.value)}
                        >
                            <option value="">Todas las Categorías</option>
                            <option value="Basura">Basura</option>
                            <option value="Escombros">Escombros</option>
                            <option value="Fuga de Agua">Fuga de Agua</option>
                            <option value="Graffiti">Graffiti</option>
                            <option value="Otro">Otro</option>
                        </select>
                    </div>
                    <div className="col-md-3">
                        <select 
                            className="form-select form-control-custom py-1"
                            value={filtroSeveridad}
                            onChange={(e) => setFiltroSeveridad(e.target.value)}
                        >
                            <option value="">Todas las Severidades</option>
                            <option value="Baja">Severidad: Baja</option>
                            <option value="Media">Severidad: Media</option>
                            <option value="Alta">Severidad: Alta</option>
                        </select>
                    </div>
                    <div className="col-md-3">
                        <select 
                            className="form-select form-control-custom py-1"
                            value={filtroEstado}
                            onChange={(e) => setFiltroEstado(e.target.value)}
                        >
                            <option value="">Todos los Estados</option>
                            <option value="Pendiente">Pendiente</option>
                            <option value="En Proceso">En Proceso</option>
                            <option value="Limpiado">Limpiado (Resueltos)</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Main Feed */}
            <div className="row justify-content-center">
                <div className="col-lg-8">
                    {publicacionesFiltradas.length === 0 ? (
                        <div className="glass-card text-center py-5 text-muted">
                            <i className="bi bi-mailbox2 display-4"></i>
                            <h5 className="mt-3 text-light">No hay reportes que coincidan con los filtros</h5>
                            <p className="small">Sé el primero en reportar un lugar sucio en la comunidad.</p>
                        </div>
                    ) : (
                        publicacionesFiltradas.map((p) => {
                            const yaDioLike = usuarioActivo && p.likes.includes(usuarioActivo._id);
                            const inicial = p.usuarioNombre ? p.usuarioNombre.charAt(0).toUpperCase() : 'U';
                            
                            // Badge severity class
                            let badgeSevClass = "badge-low";
                            if (p.severidad === 'Media') badgeSevClass = "badge-medium";
                            if (p.severidad === 'Alta') badgeSevClass = "badge-high";

                            // Badge status class
                            let badgeEstClass = "badge-pending";
                            if (p.estado === 'En Proceso') badgeEstClass = "badge-process";
                            if (p.estado === 'Limpiado') badgeEstClass = "badge-cleaned";

                            return (
                                <div key={p._id} className="glass-card p-4 mb-4">
                                    {/* Card Header */}
                                    <div className="d-flex align-items-center justify-content-between mb-3">
                                        <div className="d-flex align-items-center">
                                            <div className="avatar-placeholder me-3">
                                                {inicial}
                                            </div>
                                            <div>
                                                <h6 className="mb-0 fw-bold text-white">{p.usuarioNombre}</h6>
                                                <small className="text-muted" style={{ fontSize: '0.75rem' }}>
                                                    {new Date(p.createdAt).toLocaleDateString()} a las {new Date(p.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                                </small>
                                            </div>
                                        </div>

                                        {/* Status & Severity badges */}
                                        <div className="d-flex align-items-center gap-2">
                                            <span className={`badge-custom ${badgeSevClass}`}>{p.severidad}</span>
                                            <span className={`badge-custom ${badgeEstClass}`}>{p.estado}</span>
                                            {isAdmin && (
                                                <button
                                                    className="btn btn-outline-danger btn-sm border-0 ms-2 p-1 d-flex align-items-center justify-content-center rounded-circle"
                                                    onClick={() => handleDeletePost(p._id)}
                                                    title="Eliminar Publicación"
                                                    style={{ width: '30px', height: '30px', transition: 'all 0.2s' }}
                                                >
                                                    <i className="bi bi-trash-fill"></i>
                                                </button>
                                            )}
                                        </div>
                                    </div>

                                    {/* Card Content */}
                                    <div className="mb-3">
                                        <h4 className="fw-bold text-white mb-2">{p.titulo}</h4>
                                        <p className="text-light" style={{ whiteSpace: 'pre-line', fontSize: '0.95rem' }}>{p.descripcion}</p>
                                        
                                        {/* Location info */}
                                        <div className="d-flex align-items-center justify-content-between p-2 rounded bg-dark-50 border border-secondary mb-3 small" style={{ backgroundColor: 'rgba(15, 23, 42, 0.4)' }}>
                                            <div className="text-secondary">
                                                <i className="bi bi-geo-alt-fill text-danger me-2"></i>
                                                <strong>Lugar:</strong> {p.ubicacionNombre}
                                            </div>
                                            <button 
                                                className="btn btn-sm btn-outline-info border-0 p-1 px-2"
                                                onClick={() => toggleMapa(p._id)}
                                            >
                                                <i className="bi bi-map me-1"></i> {mapasAbiertos[p._id] ? 'Ocultar Mapa' : 'Ver Mapa'}
                                            </button>
                                        </div>

                                        {/* Map box */}
                                        {mapasAbiertos[p._id] && (
                                            <div className="mb-3">
                                                <PostMap lat={p.latitud} lng={p.longitud} id={p._id} />
                                            </div>
                                        )}

                                        {/* Images container (Before and After) */}
                                        {p.estado === 'Limpiado' ? (
                                            <div className="row g-2">
                                                <div className="col-sm-6">
                                                    <div className="position-relative border border-secondary rounded overflow-hidden shadow">
                                                        <div className="position-absolute top-0 start-0 bg-danger text-white py-1 px-3 small fw-bold" style={{ borderBottomRightRadius: '8px' }}>
                                                            ANTES (SUCIO)
                                                        </div>
                                                        <img 
                                                            src={p.imagen} 
                                                            alt="Antes" 
                                                            className="w-100 object-fit-cover" 
                                                            style={{ height: '240px' }} 
                                                        />
                                                    </div>
                                                </div>
                                                <div className="col-sm-6">
                                                    <div className="position-relative border border-success rounded overflow-hidden shadow">
                                                        <div className="position-absolute top-0 start-0 bg-success text-white py-1 px-3 small fw-bold" style={{ borderBottomRightRadius: '8px' }}>
                                                            DESPUÉS (LIMPIO)
                                                        </div>
                                                        <img 
                                                            src={p.fotoDespues} 
                                                            alt="Despues" 
                                                            className="w-100 object-fit-cover" 
                                                            style={{ height: '240px' }} 
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="border border-secondary rounded overflow-hidden shadow">
                                                <img 
                                                    src={p.imagen} 
                                                    alt="Zona sucia" 
                                                    className="w-100 object-fit-cover" 
                                                    style={{ maxHeight: '400px' }} 
                                                />
                                            </div>
                                        )}
                                    </div>

                                    {/* Action Buttons Panel */}
                                    <div className="d-flex align-items-center justify-content-between border-top border-bottom border-secondary py-2 mb-3">
                                        <button 
                                            className={`btn btn-link-custom border-0 bg-transparent flex-grow-1 text-center d-flex justify-content-center align-items-center p-2 rounded transition-all ${
                                                yaDioLike ? 'text-success fw-bold' : 'text-secondary'
                                            }`}
                                            onClick={() => handleLike(p._id)}
                                            style={{ textDecoration: 'none' }}
                                        >
                                            <i className={`bi ${yaDioLike ? 'bi-hand-thumbs-up-fill' : 'bi-hand-thumbs-up'} me-2 fs-5`}></i>
                                            {p.likes.length > 0 ? `${p.likes.length} ` : ''}Me gusta
                                        </button>

                                        <button 
                                            className="btn btn-link-custom border-0 bg-transparent flex-grow-1 text-secondary text-center d-flex justify-content-center align-items-center p-2 rounded transition-all"
                                            onClick={() => toggleComentarios(p._id)}
                                            style={{ textDecoration: 'none' }}
                                        >
                                            <i className="bi bi-chat-square-text me-2 fs-5"></i>
                                            {p.comentarios.length > 0 ? `${p.comentarios.length} ` : ''}Comentarios
                                        </button>

                                        {/* State actions */}
                                        {p.estado !== 'Limpiado' && (
                                            <div className="dropdown flex-grow-1">
                                                <button 
                                                    className="btn btn-link-custom border-0 bg-transparent w-100 text-secondary text-center d-flex justify-content-center align-items-center p-2 rounded transition-all dropdown-toggle"
                                                    type="button"
                                                    data-bs-toggle="dropdown"
                                                    aria-expanded="false"
                                                >
                                                    <i className="bi bi-check-circle-fill me-2 fs-5 text-warning"></i>
                                                    Gestionar
                                                </button>
                                                <ul className="dropdown-menu dropdown-menu-dark">
                                                    {p.estado === 'Pendiente' && (
                                                        <li>
                                                            <button 
                                                                className="dropdown-item" 
                                                                onClick={() => handleUpdateEstado(p._id, 'En Proceso')}
                                                            >
                                                                <i className="bi bi-clock-history text-info me-2"></i>Marcar En Proceso
                                                            </button>
                                                        </li>
                                                    )}
                                                    <li>
                                                        <button 
                                                            className="dropdown-item" 
                                                            onClick={() => handleUpdateEstado(p._id, 'Limpiado')}
                                                        >
                                                            <i className="bi bi-check-circle text-success me-2"></i>Reportar Limpiado
                                                        </button>
                                                    </li>
                                                </ul>
                                            </div>
                                        )}
                                    </div>

                                    {/* Comments Section */}
                                    {comentariosAbiertos[p._id] && (
                                        <div className="mt-3 p-3 rounded-3" style={{ backgroundColor: 'rgba(15, 23, 42, 0.3)' }}>
                                            <h6 className="text-secondary small mb-3"><i className="bi bi-chat-dots me-2"></i>Comentarios de la Comunidad</h6>
                                            
                                            {p.comentarios.length === 0 ? (
                                                <p className="text-muted small py-2">No hay comentarios en este reporte. Sé el primero.</p>
                                            ) : (
                                                <div className="mb-3" style={{ maxHeight: '200px', overflowY: 'auto' }}>
                                                    {p.comentarios.map((c) => {
                                                        const inCom = c.usuarioNombre ? c.usuarioNombre.charAt(0).toUpperCase() : '?';
                                                        return (
                                                            <div key={c._id} className="d-flex mb-3 align-items-start">
                                                                <div 
                                                                    className="avatar-placeholder me-2 shadow-sm"
                                                                    style={{ width: '28px', height: '28px', fontSize: '0.75rem' }}
                                                                >
                                                                    {inCom}
                                                                </div>
                                                                <div className="p-2 rounded bg-dark-50 text-light border border-secondary flex-grow-1" style={{ backgroundColor: 'rgba(30, 41, 59, 0.5)', fontSize: '0.85rem' }}>
                                                                    <div className="d-flex justify-content-between align-items-center mb-1">
                                                                        <div>
                                                                            <span className="fw-bold text-white">{c.usuarioNombre}</span>
                                                                            <span className="text-muted ms-2" style={{ fontSize: '0.7rem' }}>
                                                                                {new Date(c.createdAt).toLocaleDateString()}
                                                                            </span>
                                                                        </div>
                                                                        {isAdmin && (
                                                                            <button
                                                                                type="button"
                                                                                className="btn btn-link text-danger p-0 border-0 m-0 leading-none lh-1"
                                                                                onClick={() => handleDeleteComment(p._id, c._id)}
                                                                                title="Eliminar comentario"
                                                                                style={{ textDecoration: 'none' }}
                                                                            >
                                                                                <i className="bi bi-trash-fill small"></i>
                                                                            </button>
                                                                        )}
                                                                    </div>
                                                                    <p className="mb-0">{c.texto}</p>
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            )}

                                            {/* Add Comment Form */}
                                            <form onSubmit={(e) => handleCommentSubmit(e, p._id)} className="d-flex gap-2">
                                                <input
                                                    type="text"
                                                    className="form-control form-control-custom py-1 small"
                                                    placeholder={usuarioActivo ? "Escribe un comentario..." : "Selecciona un usuario para comentar"}
                                                    value={comentarioTexto[p._id] || ''}
                                                    onChange={(e) => handleCommentChange(p._id, e.target.value)}
                                                    disabled={!usuarioActivo}
                                                    required
                                                />
                                                <button 
                                                    type="submit" 
                                                    className="btn btn-primary-custom py-1 px-3 d-flex align-items-center"
                                                    disabled={!usuarioActivo}
                                                >
                                                    <i className="bi bi-send-fill"></i>
                                                </button>
                                            </form>
                                        </div>
                                    )}
                                </div>
                            );
                        })
                    )}
                </div>
            </div>

            {/* Resolve/Clean-up Form Modal overlay (custom popup design) */}
            {resolvingPostId && (
                <div 
                    className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center px-3"
                    style={{ 
                        backgroundColor: 'rgba(15, 23, 42, 0.85)', 
                        zIndex: 2000,
                        backdropFilter: 'blur(5px)'
                    }}
                >
                    <div className="glass-card p-4 w-100" style={{ maxWidth: '500px' }}>
                        <h4 className="fw-bold mb-3 text-success">
                            <i className="bi bi-check-circle-fill me-2"></i>Reportar Zona Limpia
                        </h4>
                        <p className="text-secondary small mb-4">
                            ¡Qué gran iniciativa! Sube una foto para corroborar que la zona ha sido limpiada exitosamente por la comunidad.
                        </p>

                        {errorResolving && (
                            <div className="alert alert-danger py-2">{errorResolving}</div>
                        )}

                        <form onSubmit={handleResolveSubmit}>
                            <div className="mb-4">
                                <label className="form-label text-secondary small">Foto del Lugar Limpiado *</label>
                                <input
                                    type="file"
                                    className="form-control form-control-custom"
                                    accept="image/*"
                                    onChange={handleFotoDespuesChange}
                                    required
                                />
                            </div>

                            {fotoDespuesPreview && (
                                <div className="mb-4 text-center p-2 border border-secondary rounded bg-dark">
                                    <img 
                                        src={fotoDespuesPreview} 
                                        alt="Lugar limpio preview" 
                                        className="img-fluid rounded"
                                        style={{ maxHeight: '180px', objectFit: 'cover' }}
                                    />
                                </div>
                            )}

                            <div className="d-flex justify-content-end gap-2">
                                <button
                                    type="button"
                                    className="btn btn-secondary-custom btn-sm"
                                    onClick={() => setResolvingPostId(null)}
                                    disabled={loadingResolve}
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="btn btn-success btn-sm px-4 fw-bold"
                                    disabled={loadingResolve || !fotoDespues}
                                    style={{ borderRadius: '8px' }}
                                >
                                    {loadingResolve ? (
                                        <>
                                            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                            Guardando...
                                        </>
                                    ) : 'Guardar Reporte de Limpieza'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FeedPublicaciones;
