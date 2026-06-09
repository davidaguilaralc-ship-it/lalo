import React from 'react';

const Navegacion = ({ vistaActiva, setVistaActiva, usuarioActivo, openUserSelector, isAdmin, onLogout }) => {
    return (
        <nav className="navbar navbar-expand-lg custom-nav navbar-dark sticky-top py-2 px-3">
            <div className="container-fluid">
                <a 
                    className="navbar-brand d-flex align-items-center" 
                    href="#feed" 
                    onClick={(e) => {
                        e.preventDefault();
                        if (usuarioActivo) {
                            setVistaActiva('feed');
                        } else {
                            setVistaActiva('landing');
                        }
                    }}
                >
                    <div 
                        className="d-flex align-items-center justify-content-center me-2" 
                        style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '12px',
                            background: isAdmin 
                                ? 'linear-gradient(135deg, #ef4444, #b91c1c)' 
                                : 'linear-gradient(135deg, #10b981, #059669)',
                            boxShadow: isAdmin 
                                ? '0 4px 12px rgba(239, 68, 68, 0.3)' 
                                : '0 4px 12px rgba(16, 185, 129, 0.3)'
                        }}
                    >
                        <i className="bi bi-trash-fill text-dark fs-5"></i>
                    </div>
                    <span className="fw-bold tracking-tight text-white fs-4">EcoSpotter</span>
                </a>

                {usuarioActivo && (
                    <button 
                        className="navbar-toggler" 
                        type="button" 
                        data-bs-toggle="collapse" 
                        data-bs-target="#navbarNav" 
                        aria-controls="navbarNav" 
                        aria-expanded="false" 
                        aria-label="Toggle navigation"
                    >
                        <span className="navbar-toggler-icon"></span>
                    </button>
                )}

                <div className="collapse navbar-collapse" id="navbarNav">
                    {usuarioActivo ? (
                        <>
                            <ul className="navbar-nav me-auto mb-2 mb-lg-0 gap-1 mt-2 mt-lg-0">
                                <li className="nav-item">
                                    <a 
                                        href="#feed" 
                                        className={`nav-link-custom d-flex align-items-center ${vistaActiva === 'feed' ? 'active' : ''}`}
                                        onClick={(e) => {
                                            e.preventDefault();
                                            setVistaActiva('feed');
                                        }}
                                    >
                                        <i className="bi bi-house-door-fill me-2"></i>Inicio / Muro
                                    </a>
                                </li>
                                <li className="nav-item">
                                    <a 
                                        href="#mapa" 
                                        className={`nav-link-custom d-flex align-items-center ${vistaActiva === 'mapa' ? 'active' : ''}`}
                                        onClick={(e) => {
                                            e.preventDefault();
                                            setVistaActiva('mapa');
                                        }}
                                    >
                                        <i className="bi bi-map-fill me-2"></i>Mapa Crítico
                                    </a>
                                </li>
                                <li className="nav-item">
                                    <a 
                                        href="#nuevo" 
                                        className={`nav-link-custom d-flex align-items-center ${vistaActiva === 'nuevo' ? 'active' : ''}`}
                                        onClick={(e) => {
                                            e.preventDefault();
                                            setVistaActiva('nuevo');
                                        }}
                                    >
                                        <i className="bi bi-plus-circle-fill me-2"></i>Reportar Lugar
                                    </a>
                                </li>
                                <li className="nav-item">
                                    <a 
                                        href="#usuarios" 
                                        className={`nav-link-custom d-flex align-items-center ${vistaActiva === 'usuarios' ? 'active' : ''}`}
                                        onClick={(e) => {
                                            e.preventDefault();
                                            setVistaActiva('usuarios');
                                        }}
                                    >
                                        <i className="bi bi-people-fill me-2"></i>Comunidad
                                    </a>
                                </li>
                            </ul>

                            {/* Active Profile Pill & Logout */}
                            <div className="d-flex align-items-center gap-3 mt-3 mt-lg-0 ms-auto">
                                <div 
                                    className="d-flex align-items-center p-1 pe-3 border rounded-pill transition-all"
                                    style={{
                                        backgroundColor: isAdmin ? 'rgba(239, 68, 68, 0.12)' : 'rgba(16, 185, 129, 0.12)',
                                        borderColor: isAdmin ? 'rgba(239, 68, 68, 0.35)' : 'rgba(16, 185, 129, 0.35)',
                                        cursor: 'pointer'
                                    }}
                                    onClick={openUserSelector}
                                    title="Cambiar usuario activo"
                                >
                                    <div 
                                        className="avatar-placeholder me-2 shadow-sm"
                                        style={{ 
                                            width: '32px', 
                                            height: '32px', 
                                            fontSize: '0.85rem',
                                            background: isAdmin 
                                                ? 'linear-gradient(135deg, #ef4444, #b91c1c)' 
                                                : 'linear-gradient(135deg, var(--accent-primary), var(--severity-low))'
                                        }}
                                    >
                                        {usuarioActivo.nombre.charAt(0).toUpperCase()}
                                    </div>
                                    <span className="text-light fw-medium small d-flex align-items-center">
                                        <span className="text-secondary d-none d-sm-inline me-1">Perfil: </span>
                                        {usuarioActivo.nombre} {usuarioActivo.apellido}
                                        {isAdmin && (
                                            <span className="ms-2 badge bg-danger text-white py-1 px-2 rounded" style={{ fontSize: '0.65rem' }}>
                                                ADMIN
                                            </span>
                                        )}
                                    </span>
                                </div>

                                <button
                                    className="btn btn-outline-danger btn-sm border-0 d-flex align-items-center justify-content-center p-2 rounded-circle"
                                    onClick={onLogout}
                                    title="Cerrar Sesión"
                                    style={{ width: '36px', height: '36px' }}
                                >
                                    <i className="bi bi-box-arrow-right fs-5"></i>
                                </button>
                            </div>
                        </>
                    ) : (
                        <div className="ms-auto text-secondary small py-2">
                            <i className="bi bi-lock-fill me-1"></i> Ingresa un perfil para comenzar
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navegacion;