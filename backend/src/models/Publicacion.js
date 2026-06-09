const { Schema, model } = require('mongoose');

const comentarioSchema = new Schema({
    usuario: {
        type: Schema.Types.ObjectId,
        ref: 'Usuario',
        required: true
    },
    usuarioNombre: {
        type: String,
        required: true
    },
    texto: {
        type: String,
        required: true
    }
}, {
    timestamps: true
});

const publicacionSchema = new Schema({
    usuario: {
        type: Schema.Types.ObjectId,
        ref: 'Usuario',
        required: true
    },
    usuarioNombre: {
        type: String,
        required: true
    },
    titulo: {
        type: String,
        required: true,
        trim: true
    },
    descripcion: {
        type: String,
        required: true
    },
    categoria: {
        type: String,
        required: true,
        enum: ['Basura', 'Escombros', 'Fuga de Agua', 'Graffiti', 'Otro']
    },
    severidad: {
        type: String,
        required: true,
        enum: ['Baja', 'Media', 'Alta']
    },
    ubicacionNombre: {
        type: String,
        required: true
    },
    latitud: {
        type: Number,
        required: true
    },
    longitud: {
        type: Number,
        required: true
    },
    imagen: {
        type: String, // Base64 string
        required: true
    },
    likes: [{
        type: Schema.Types.ObjectId,
        ref: 'Usuario'
    }],
    comentarios: [comentarioSchema],
    estado: {
        type: String,
        enum: ['Pendiente', 'En Proceso', 'Limpiado'],
        default: 'Pendiente'
    },
    fotoDespues: {
        type: String // Base64 string
    },
    limpiadoPor: {
        type: Schema.Types.ObjectId,
        ref: 'Usuario'
    }
}, {
    timestamps: true
});

module.exports = model('Publicacion', publicacionSchema);
