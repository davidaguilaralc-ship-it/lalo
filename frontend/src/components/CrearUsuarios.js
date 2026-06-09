import React, { useState } from 'react';

const CrearUsuarios = ({ onUserCreated, API_URL }) => {
    const [nombre, setNombre] = useState('');
    const [apellido, setApellido] = useState('');
    const [edad, setEdad] = useState('');
    const [telefono, setTelefono] = useState('');
    const [correo, setCorreo] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (!nombre || !apellido || !correo) {
            setError('Por favor, llena los campos obligatorios (Nombre, Apellido, Correo)');
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
                    edad: edad ? Number(edad) : undefined,
                    telefono: telefono ? Number(telefono) : undefined,
                    correo
                })
            });

            const data = await res.json();
            if (res.ok) {
                setSuccess('¡Usuario creado correctamente!');
                setNombre('');
                setApellido('');
                setEdad('');
                setTelefono('');
                setCorreo('');
                if (onUserCreated) onUserCreated();
            } else {
                setError(data.message || 'Error al crear usuario');
            }
        } catch (err) {
            setError('Error de conexión con el servidor');
            console.error(err);
        }
    };

    return (
        <div className="glass-card p-4">
            <h3 className="mb-4 text-emerald" style={{ color: 'var(--accent-primary)' }}>
                <i className="bi bi-person-plus-fill me-2"></i>Registrar Nuevo Usuario
            </h3>
            {error && <div className="alert alert-danger py-2">{error}</div>}
            {success && <div className="alert alert-success py-2">{success}</div>}
            <form onSubmit={handleSubmit}>
                <div className="row">
                    <div className="col-md-6 mb-3">
                        <label className="form-label text-secondary small">Nombre *</label>
                        <input
                            type="text"
                            className="form-control form-control-custom"
                            value={nombre}
                            onChange={(e) => setNombre(e.target.value)}
                            placeholder="Ej. Carlos"
                            required
                        />
                    </div>
                    <div className="col-md-6 mb-3">
                        <label className="form-label text-secondary small">Apellido *</label>
                        <input
                            type="text"
                            className="form-control form-control-custom"
                            value={apellido}
                            onChange={(e) => setApellido(e.target.value)}
                            placeholder="Ej. Perez"
                            required
                        />
                    </div>
                </div>
                <div className="mb-3">
                    <label className="form-label text-secondary small">Correo Electrónico *</label>
                    <input
                        type="email"
                        className="form-control form-control-custom"
                        value={correo}
                        onChange={(e) => setCorreo(e.target.value)}
                        placeholder="carlos.perez@example.com"
                        required
                    />
                </div>
                <div className="row">
                    <div className="col-md-6 mb-3">
                        <label className="form-label text-secondary small">Edad</label>
                        <input
                            type="number"
                            className="form-control form-control-custom"
                            value={edad}
                            onChange={(e) => setEdad(e.target.value)}
                            placeholder="Ej. 25"
                        />
                    </div>
                    <div className="col-md-6 mb-3">
                        <label className="form-label text-secondary small">Teléfono</label>
                        <input
                            type="number"
                            className="form-control form-control-custom"
                            value={telefono}
                            onChange={(e) => setTelefono(e.target.value)}
                            placeholder="Ej. 5512345678"
                        />
                    </div>
                </div>
                <div className="text-end mt-2">
                    <button type="submit" className="btn btn-primary-custom w-100">
                        Crear Cuenta
                    </button>
                </div>
            </form>
        </div>
    );
};

export default CrearUsuarios;