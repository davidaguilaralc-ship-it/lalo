import React, { useState } from 'react';

const LandingPage = ({ usuarios, onUserCreated, onLogin, API_URL }) => {
    const [isRegistering, setIsRegistering] = useState(false);
    
    // Login form states
    const [selectedUserId, setSelectedUserId] = useState('');
    const [adminPassword, setAdminPassword] = useState('');
    const [userPassword, setUserPassword] = useState('');
    
    // Register form states
    const [nombre, setNombre] = useState('');
    const [apellido, setApellido] = useState('');
    const [correo, setCorreo] = useState('');
    const [edad, setEdad] = useState('');
    const [telefono, setTelefono] = useState('');
    const [password, setPassword] = useState('');
    
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleLoginSubmit = async (e) => {
        e.preventDefault();
        setError('');
        
        if (!selectedUserId) {
            setError('Por favor selecciona un perfil para iniciar sesión.');
            return;
        }

        try {
            const res = await fetch(`${API_URL}/api/usuarios/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    id: selectedUserId,
                    password: userPassword
                })
            });

            const data = await res.json();
            if (res.ok) {
                const isAdminMode = adminPassword === 'limpieza2026';
                onLogin(data.usuario, isAdminMode);
            } else {
                setError(data.message || 'Contraseña incorrecta o error al iniciar sesión.');
            }
        } catch (err) {
            setError('Error de conexión con el servidor.');
            console.error(err);
        }
    };

    const handleRegisterSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (!nombre || !apellido || !correo || !password) {
            setError('Por favor completa todos los campos obligatorios (*).');
            return;
        }

        try {
            const res = await fetch(`${API_URL}/api/usuarios`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    nombre,
                    apellido,
                    correo,
                    edad: edad ? Number(edad) : undefined,
                    telefono: telefono ? Number(telefono) : undefined,
                    password
                })
            });

            const data = await res.json();
            if (res.ok) {
                setSuccess('¡Perfil creado con éxito!');
                setNombre('');
                setApellido('');
                setEdad('');
                setTelefono('');
                setCorreo('');
                setPassword('');
                
                // Refresh list of users
                if (onUserCreated) {
                    await onUserCreated();
                }
                
                // Switch back to login page
                setIsRegistering(false);
            } else {
                setError(data.message || 'Error al registrar el perfil.');
            }
        } catch (err) {
            setError('Error de conexión con el servidor.');
            console.error(err);
        }
    };

    return (
        <div className="container py-5">
            {/* Hero & Intro Section */}
            <div className="row align-items-center mb-5 g-5">
                <div className="col-lg-6 text-start">
                    <div className="d-flex align-items-center mb-3">
                        <div 
                            className="d-flex align-items-center justify-content-center me-3" 
                            style={{
                                width: '50px',
                                height: '50px',
                                borderRadius: '14px',
                                overflow: 'hidden',
                                boxShadow: '0 4px 15px rgba(16, 185, 129, 0.4)'
                            }}
                        >
                            <img 
                                src="/logo-deer.jpg" 
                                alt="EcoSpotter Logo" 
                                style={{
                                    width: '100%',
                                    height: '100%',
                                    objectFit: 'cover'
                                }}
                            />
                        </div>
                        <h1 className="display-4 fw-extrabold text-white mb-0 tracking-tight" style={{ fontFamily: "'Outfit', sans-serif" }}>
                            EcoSpotter
                        </h1>
                    </div>
                    
                    <h2 className="h3 fw-bold text-emerald mb-4">
                        Foro de Limpieza Comunitario
                    </h2>
                    
                    <p className="text-secondary fs-5 mb-4 leading-relaxed">
                        EcoSpotter es una plataforma colaborativa para reportar focos de basura y contaminación en la vía pública. Juntos podemos coordinar esfuerzos de limpieza y devolverle la belleza a nuestros barrios y espacios públicos.
                    </p>

                    <div className="row g-4 mt-2">
                        <div className="col-md-4">
                            <div className="glass-card p-3 h-100 text-center" style={{ transition: 'all 0.3s' }}>
                                <i className="bi bi-geo-alt-fill text-danger fs-3 mb-2 d-block"></i>
                                <h5 className="text-white fw-bold mb-1">1. Reporta</h5>
                                <p className="text-muted small mb-0">Ubica y describe zonas sucias en el mapa.</p>
                            </div>
                        </div>
                        <div className="col-md-4">
                            <div className="glass-card p-3 h-100 text-center" style={{ transition: 'all 0.3s' }}>
                                <i className="bi bi-people-fill text-info fs-3 mb-2 d-block"></i>
                                <h5 className="text-white fw-bold mb-1">2. Organiza</h5>
                                <p className="text-muted small mb-0">Convoca a vecinos para limpiar en equipo.</p>
                            </div>
                        </div>
                        <div className="col-md-4">
                            <div className="glass-card p-3 h-100 text-center" style={{ transition: 'all 0.3s' }}>
                                <i className="bi bi-camera-fill text-success fs-3 mb-2 d-block"></i>
                                <h5 className="text-white fw-bold mb-1">3. Compara</h5>
                                <p className="text-muted small mb-0">Demuestra el cambio con el "Antes y Después".</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Login / Register Card */}
                <div className="col-lg-6">
                    <div className="glass-card p-4 shadow-lg border border-secondary">
                        {error && <div className="alert alert-danger py-2 mb-3">{error}</div>}
                        {success && <div className="alert alert-success py-2 mb-3">{success}</div>}

                        {!isRegistering ? (
                            /* LOGIN FORM */
                            <div>
                                <h3 className="text-white fw-bold mb-3 d-flex align-items-center">
                                    <i className="bi bi-box-arrow-in-right text-emerald me-2"></i> Iniciar Sesión
                                </h3>
                                <p className="text-secondary small mb-4">
                                    Selecciona tu perfil de la comunidad para ingresar. Si tienes la contraseña especial, puedes entrar en **Modo Admin**.
                                </p>

                                <form onSubmit={handleLoginSubmit}>
                                    <div className="mb-3 text-start">
                                        <label className="form-label text-secondary small fw-bold">Perfil de la Comunidad</label>
                                        <select
                                            className="form-select form-control-custom"
                                            value={selectedUserId}
                                            onChange={(e) => setSelectedUserId(e.target.value)}
                                            required
                                        >
                                            <option value="">-- Selecciona un perfil --</option>
                                            {usuarios.map(u => (
                                                <option key={u._id} value={u._id}>
                                                    {u.nombre} {u.apellido} ({u.correo})
                                                </option>
                                            ))}
                                        </select>
                                        {usuarios.length === 0 && (
                                            <span className="text-warning small mt-1 d-block">
                                                No hay perfiles registrados. ¡Crea el tuyo a la derecha!
                                            </span>
                                        )}
                                    </div>

                                    <div className="mb-3 text-start">
                                        <label className="form-label text-secondary small fw-bold">
                                            Contraseña de tu Perfil *
                                        </label>
                                        <input
                                            type="password"
                                            className="form-control form-control-custom"
                                            placeholder="Ingresa la contraseña de tu perfil"
                                            value={userPassword}
                                            onChange={(e) => setUserPassword(e.target.value)}
                                            required
                                        />
                                    </div>

                                    <div className="mb-4 text-start">
                                        <label className="form-label text-secondary small fw-bold">
                                            Contraseña de Administrador (Opcional)
                                        </label>
                                        <input
                                            type="password"
                                            className="form-control form-control-custom"
                                            placeholder="Ingresa la contraseña para entrar en Modo Admin"
                                            value={adminPassword}
                                            onChange={(e) => setAdminPassword(e.target.value)}
                                        />
                                        <div className="form-text text-muted text-xs mt-1">
                                            Ingresa la contraseña especial <strong>`limpieza2026`</strong> para obtener permisos de eliminación. Déjala en blanco para entrar en modo normal.
                                        </div>
                                    </div>

                                    <button 
                                        type="submit" 
                                        className="btn btn-primary-custom w-100 mb-3 fw-bold py-2"
                                        disabled={usuarios.length === 0}
                                    >
                                        Entrar a la Plataforma
                                    </button>

                                    <div className="text-center mt-3 border-top border-secondary pt-3">
                                        <span className="text-secondary small">¿No tienes un perfil creado? </span>
                                        <button
                                            type="button"
                                            className="btn btn-link text-emerald p-0 border-0 bg-transparent fw-bold small ms-1"
                                            onClick={() => {
                                                setIsRegistering(true);
                                                setError('');
                                                setSuccess('');
                                            }}
                                            style={{ textDecoration: 'none' }}
                                        >
                                            Regístrate aquí
                                        </button>
                                    </div>
                                </form>
                            </div>
                        ) : (
                            /* REGISTER FORM */
                            <div>
                                <h3 className="text-white fw-bold mb-3 d-flex align-items-center">
                                    <i className="bi bi-person-plus-fill text-emerald me-2"></i> Registrar Perfil
                                </h3>
                                <p className="text-secondary small mb-4">
                                    Crea tu perfil comunitario para poder participar con reportes, likes y comentarios.
                                </p>

                                <form onSubmit={handleRegisterSubmit}>
                                    <div className="row">
                                        <div className="col-md-6 mb-3 text-start">
                                            <label className="form-label text-secondary small fw-bold">Nombre *</label>
                                            <input
                                                type="text"
                                                className="form-control form-control-custom"
                                                value={nombre}
                                                onChange={(e) => setNombre(e.target.value)}
                                                placeholder="Ej. Juan"
                                                required
                                            />
                                        </div>
                                        <div className="col-md-6 mb-3 text-start">
                                            <label className="form-label text-secondary small fw-bold">Apellido *</label>
                                            <input
                                                type="text"
                                                className="form-control form-control-custom"
                                                value={apellido}
                                                onChange={(e) => setApellido(e.target.value)}
                                                placeholder="Ej. Gómez"
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="mb-3 text-start">
                                        <label className="form-label text-secondary small fw-bold">Correo Electrónico *</label>
                                        <input
                                            type="email"
                                            className="form-control form-control-custom"
                                            value={correo}
                                            onChange={(e) => setCorreo(e.target.value)}
                                            placeholder="juan.gomez@example.com"
                                            required
                                        />
                                    </div>

                                    <div className="mb-3 text-start">
                                        <label className="form-label text-secondary small fw-bold">Contraseña *</label>
                                        <input
                                            type="password"
                                            className="form-control form-control-custom"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            placeholder="Crea una contraseña para tu perfil"
                                            required
                                        />
                                    </div>

                                    <div className="row">
                                        <div className="col-md-6 mb-3 text-start">
                                            <label className="form-label text-secondary small fw-bold">Edad</label>
                                            <input
                                                type="number"
                                                className="form-control form-control-custom"
                                                value={edad}
                                                onChange={(e) => setEdad(e.target.value)}
                                                placeholder="Ej. 28"
                                            />
                                        </div>
                                        <div className="col-md-6 mb-4 text-start">
                                            <label className="form-label text-secondary small fw-bold">Teléfono</label>
                                            <input
                                                type="number"
                                                className="form-control form-control-custom"
                                                value={telefono}
                                                onChange={(e) => setTelefono(e.target.value)}
                                                placeholder="Ej. 5512345678"
                                            />
                                        </div>
                                    </div>

                                    <button type="submit" className="btn btn-primary-custom w-100 mb-3 fw-bold py-2">
                                        Crear Perfil y Regresar
                                    </button>

                                    <div className="text-center mt-2">
                                        <button
                                            type="button"
                                            className="btn btn-link text-secondary p-0 border-0 bg-transparent small"
                                            onClick={() => {
                                                setIsRegistering(false);
                                                setError('');
                                                setSuccess('');
                                            }}
                                            style={{ textDecoration: 'none' }}
                                        >
                                            <i className="bi bi-arrow-left me-1"></i> Volver a Iniciar Sesión
                                        </button>
                                    </div>
                                </form>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LandingPage;
