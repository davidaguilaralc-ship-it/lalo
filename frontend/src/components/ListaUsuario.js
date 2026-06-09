import React from 'react';

const ListaUsuario = ({ usuarios, usuarioActivo, onSelectUsuario, onDeleteUsuario, isAdmin }) => {
    return (
        <div className="glass-card p-4">
            <h3 className="mb-4 text-emerald" style={{ color: 'var(--accent-primary)' }}>
                <i className="bi bi-people-fill me-2"></i>Perfiles de Comunidad
            </h3>
            <p className="text-secondary small mb-3">
                Selecciona un perfil para interactuar en la plataforma (dar likes, comentar, reportar).
            </p>
            {usuarios.length === 0 ? (
                <div className="text-center py-4 text-muted">
                    <i className="bi bi-person-x-fill display-6"></i>
                    <p className="mt-2">No hay usuarios registrados.</p>
                </div>
            ) : (
                <div className="list-group" style={{ maxHeight: '450px', overflowY: 'auto' }}>
                    {usuarios.map((u) => {
                        const esActivo = usuarioActivo && usuarioActivo._id === u._id;
                        const inicial = u.nombre ? u.nombre.charAt(0).toUpperCase() : '?';
                        return (
                            <div
                                key={u._id}
                                className={`list-group-item list-group-item-action d-flex align-items-center justify-content-between p-3 border-0 mb-2 rounded-3 transition-all ${
                                    esActivo 
                                        ? 'bg-emerald-10 text-white' 
                                        : 'bg-dark-50 text-light'
                                }`}
                                style={{
                                    backgroundColor: esActivo ? 'rgba(16, 185, 129, 0.15)' : 'rgba(30, 41, 59, 0.4)',
                                    border: esActivo ? '1px solid var(--accent-primary)' : '1px solid var(--border-color)',
                                    cursor: 'pointer'
                                }}
                                onClick={() => onSelectUsuario(u)}
                            >
                                <div className="d-flex align-items-center">
                                    <div className="avatar-placeholder me-3">
                                        {inicial}
                                    </div>
                                    <div>
                                        <h6 className="mb-0 fw-bold">
                                            {u.nombre} {u.apellido}
                                            {esActivo && (
                                                <span className="ms-2 badge bg-success badge-custom">Activo</span>
                                            )}
                                        </h6>
                                        <small className="text-secondary d-block" style={{ fontSize: '0.8rem' }}>{u.correo}</small>
                                        <small className="text-muted" style={{ fontSize: '0.75rem' }}>
                                            {u.edad ? `${u.edad} años` : ''} 
                                            {u.edad && (u.telefono || u.telegono) ? ' | ' : ''} 
                                            {u.telefono || u.telegono || ''}
                                        </small>
                                    </div>
                                </div>
                                {isAdmin && (
                                    <button
                                        className="btn btn-outline-danger btn-sm border-0"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onDeleteUsuario(u._id);
                                        }}
                                        title="Eliminar usuario"
                                        style={{ transition: 'all 0.2s' }}
                                    >
                                        <i className="bi bi-trash-fill"></i>
                                    </button>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default ListaUsuario;