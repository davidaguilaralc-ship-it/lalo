import React, { useState, useEffect, useCallback } from 'react';
import './App.css';
import Navegacion from './components/Navegacion';
import CrearUsuarios from './components/CrearUsuarios';
import ListaUsuario from './components/ListaUsuario';
import FormularioReporte from './components/FormularioReporte';
import FeedPublicaciones from './components/FeedPublicaciones';
import MapaGlobal from './components/MapaGlobal';
import LandingPage from './components/LandingPage';

const API_URL = 'http://localhost:4000';

function App() {
  const [vistaActiva, setVistaActiva] = useState('landing');
  const [usuarios, setUsuarios] = useState([]);
  const [usuarioActivo, setUsuarioActivo] = useState(null);
  const [publicaciones, setPublicaciones] = useState([]);
  const [isAdmin, setIsAdmin] = useState(false);
  
  // Controls profile selection modal overlay
  const [mostrarSelectorPerfil, setMostrarSelectorPerfil] = useState(false);

  // Fetch all users
  const fetchUsuarios = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/api/usuarios`);
      const data = await res.json();
      if (res.ok) {
        setUsuarios(data);
      }
    } catch (err) {
      console.error('Error fetching users:', err);
    }
  }, []);

  // Fetch all publications
  const fetchPublicaciones = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/api/publicaciones`);
      const data = await res.json();
      if (res.ok) {
        setPublicaciones(data);
      }
    } catch (err) {
      console.error('Error fetching publications:', err);
    }
  }, []);

  useEffect(() => {
    fetchUsuarios();
    fetchPublicaciones();
  }, [fetchUsuarios, fetchPublicaciones]);

  const handleSelectUsuario = (usuario) => {
    setUsuarioActivo(usuario);
    setMostrarSelectorPerfil(false);
  };

  const handleLogin = (usuario, adminMode) => {
    setUsuarioActivo(usuario);
    setIsAdmin(adminMode);
    setVistaActiva('feed');
  };

  const handleLogout = () => {
    setUsuarioActivo(null);
    setIsAdmin(false);
    setVistaActiva('landing');
  };

  const handleDeleteUsuario = async (id) => {
    if (window.confirm('¿Estás seguro de eliminar este perfil?')) {
      try {
        const res = await fetch(`${API_URL}/api/usuarios/${id}`, {
          method: 'DELETE'
        });
        if (res.ok) {
          if (usuarioActivo && usuarioActivo._id === id) {
            setUsuarioActivo(null);
            setIsAdmin(false);
            setVistaActiva('landing');
          }
          fetchUsuarios();
        }
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleUserSelectorOpen = () => {
    setMostrarSelectorPerfil(true);
  };

  // Renders the main content based on the active view state
  const renderContenido = () => {
    // Force LandingPage if no active user session exists
    if (!usuarioActivo) {
      return (
        <LandingPage 
          usuarios={usuarios}
          onUserCreated={fetchUsuarios}
          onLogin={handleLogin}
          API_URL={API_URL}
        />
      );
    }

    switch (vistaActiva) {
      case 'landing':
        // Safe fallback: redirect to feed if already logged in
        return (
          <div className="container py-4 text-center">
            <h4 className="text-light">Ya has iniciado sesión</h4>
            <button className="btn btn-primary-custom mt-3" onClick={() => setVistaActiva('feed')}>
              Ir al Muro / Feed
            </button>
          </div>
        );
      case 'feed':
        return (
          <div className="container-fluid py-4">
            <div className="row">
              {/* Feed Column */}
              <div className="col-lg-8">
                <FeedPublicaciones 
                  publicaciones={publicaciones}
                  usuarioActivo={usuarioActivo}
                  onActionCompleted={fetchPublicaciones}
                  API_URL={API_URL}
                  onOpenUserSelector={handleUserSelectorOpen}
                  isAdmin={isAdmin}
                />
              </div>

              {/* Sidebar Info Column */}
              <div className="col-lg-4 d-none d-lg-block mt-4">
                <div className="glass-card p-4 mb-4">
                  <h5 className="text-white fw-bold">
                    <i className="bi bi-info-circle-fill text-emerald me-2" style={{ color: 'var(--accent-primary)' }}></i>
                    ¿Qué es EcoSpotter?
                  </h5>
                  <p className="text-secondary small mt-2">
                    Es una plataforma colaborativa para reportar focos de basura y contaminación en la vía pública. 
                  </p>
                  <p className="text-secondary small">
                    Cualquier miembro de la comunidad puede subir un reporte, agregar la ubicación en el mapa, y cuando el lugar sea aseado, subir la foto de <strong>Antes y Después</strong>.
                  </p>
                </div>
                
                <div className="glass-card p-4">
                  <h5 className="text-white fw-bold">
                    <i className="bi bi-person-check-fill text-success me-2"></i>
                    Perfil Activo
                  </h5>
                  <div className="d-flex align-items-center mt-3">
                    <div className="avatar-placeholder me-3" style={{ width: '45px', height: '45px', fontSize: '1.1rem' }}>
                      {usuarioActivo.nombre.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h6 className="mb-0 fw-bold text-white">
                        {usuarioActivo.nombre} {usuarioActivo.apellido}
                        {isAdmin && (
                          <span className="ms-2 badge bg-danger badge-custom" style={{ fontSize: '0.65rem' }}>
                            Admin
                          </span>
                        )}
                      </h6>
                      <small className="text-secondary d-block">{usuarioActivo.correo}</small>
                      <small className="text-muted text-xs">
                        {usuarioActivo.edad ? `${usuarioActivo.edad} años` : ''} 
                        {usuarioActivo.edad && (usuarioActivo.telefono || usuarioActivo.telegono) ? ' | ' : ''} 
                        {usuarioActivo.telefono || usuarioActivo.telegono || ''}
                      </small>
                    </div>
                  </div>
                  <button 
                    className="btn btn-secondary-custom btn-sm w-100 mt-4 text-center"
                    onClick={handleLogout}
                  >
                    <i className="bi bi-box-arrow-left me-2"></i>Cerrar Sesión
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      case 'mapa':
        return (
          <MapaGlobal 
            publicaciones={publicaciones}
          />
        );
      case 'nuevo':
        return (
          <FormularioReporte 
            usuarioActivo={usuarioActivo}
            onReportCreated={fetchPublicaciones}
            API_URL={API_URL}
            setVistaActiva={setVistaActiva}
          />
        );
      case 'usuarios':
        return (
          <div className="container py-4">
            <div className="row g-4">
              <div className="col-md-5">
                <CrearUsuarios 
                  onUserCreated={fetchUsuarios}
                  API_URL={API_URL}
                />
              </div>
              <div className="col-md-7">
                <ListaUsuario 
                  usuarios={usuarios}
                  usuarioActivo={usuarioActivo}
                  onSelectUsuario={handleSelectUsuario}
                  onDeleteUsuario={handleDeleteUsuario}
                  isAdmin={isAdmin}
                />
              </div>
            </div>
          </div>
        );
      default:
        return <div>Vista no encontrada</div>;
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navegacion 
        vistaActiva={vistaActiva}
        setVistaActiva={setVistaActiva}
        usuarioActivo={usuarioActivo}
        openUserSelector={handleUserSelectorOpen}
        isAdmin={isAdmin}
        onLogout={handleLogout}
      />

      <div style={{ flexGrow: 1 }}>
        {renderContenido()}
      </div>

      {/* Footer */}
      <footer className="text-center py-4 text-muted border-top border-secondary" style={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border-color)' }}>
        <small>© 2026 EcoSpotter. Desarrollado para limpiar y cuidar nuestro entorno.</small>
      </footer>

      {/* Overlay modal to select active profile */}
      {mostrarSelectorPerfil && (
        <div 
          className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center px-3"
          style={{ 
              backgroundColor: 'rgba(15, 23, 42, 0.85)', 
              zIndex: 2000,
              backdropFilter: 'blur(5px)'
          }}
        >
          <div className="glass-card p-4 w-100" style={{ maxWidth: '550px' }}>
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h4 className="fw-bold mb-0 text-white">
                <i className="bi bi-people-fill text-emerald me-2" style={{ color: 'var(--accent-primary)' }}></i>Selecciona un Perfil
              </h4>
              <button 
                type="button" 
                className="btn-close btn-close-white" 
                onClick={() => setMostrarSelectorPerfil(false)}
              ></button>
            </div>
            
            <div className="mb-4">
              <ListaUsuario 
                usuarios={usuarios}
                usuarioActivo={usuarioActivo}
                onSelectUsuario={handleSelectUsuario}
                onDeleteUsuario={handleDeleteUsuario}
                isAdmin={isAdmin}
              />
            </div>

            <div className="text-end">
              <button 
                type="button" 
                className="btn btn-secondary-custom btn-sm"
                onClick={() => {
                  setMostrarSelectorPerfil(false);
                  setVistaActiva('usuarios');
                }}
              >
                <i className="bi bi-person-plus-fill me-2"></i>Registrar Nuevo Perfil
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
