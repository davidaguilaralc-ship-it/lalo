const publicacionCtrl = {};

const Publicacion = require('../models/Publicacion');
const Usuario = require('../models/Usuario');

// Obtener publicaciones con filtros opcionales
publicacionCtrl.getPublicaciones = async (req, res) => {
    try {
        const { categoria, severidad, estado } = req.query;
        let query = {};
        
        if (categoria) query.categoria = categoria;
        if (severidad) query.severidad = severidad;
        if (estado) query.estado = estado;

        // Ordenar por fecha de creación descendente (las más nuevas primero)
        const publicaciones = await Publicacion.find(query).sort({ createdAt: -1 });
        res.json(publicaciones);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener publicaciones', error: error.message });
    }
};

// Crear publicación
publicacionCtrl.createPublicacion = async (req, res) => {
    try {
        const { usuarioId, titulo, descripcion, categoria, severidad, ubicacionNombre, latitud, longitud, imagen } = req.body;
        
        // Verificar que el usuario exista
        const usuario = await Usuario.findById(usuarioId);
        if (!usuario) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        const newPublicacion = new Publicacion({
            usuario: usuarioId,
            usuarioNombre: `${usuario.nombre} ${usuario.apellido}`,
            titulo,
            descripcion,
            categoria,
            severidad,
            ubicacionNombre,
            latitud: Number(latitud),
            longitud: Number(longitud),
            imagen,
            likes: [],
            comentarios: [],
            estado: 'Pendiente'
        });

        await newPublicacion.save();
        res.json({ message: 'Publicación creada exitosamente', publicacion: newPublicacion });
    } catch (error) {
        res.status(500).json({ message: 'Error al crear la publicación', error: error.message });
    }
};

// Obtener una publicación individual
publicacionCtrl.getPublicacion = async (req, res) => {
    try {
        const publicacion = await Publicacion.findById(req.params.id);
        if (!publicacion) {
            return res.status(404).json({ message: 'Publicación no encontrada' });
        }
        res.json(publicacion);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener la publicación', error: error.message });
    }
};

// Eliminar una publicación
publicacionCtrl.deletePublicacion = async (req, res) => {
    try {
        const publicacion = await Publicacion.findByIdAndDelete(req.params.id);
        if (!publicacion) {
            return res.status(404).json({ message: 'Publicación no encontrada' });
        }
        res.json({ message: 'Publicación eliminada exitosamente' });
    } catch (error) {
        res.status(500).json({ message: 'Error al eliminar la publicación', error: error.message });
    }
};

// Dar/quitar Me Gusta
publicacionCtrl.likePublicacion = async (req, res) => {
    try {
        const { usuarioId } = req.body;
        const publicacion = await Publicacion.findById(req.params.id);
        
        if (!publicacion) {
            return res.status(404).json({ message: 'Publicación no encontrada' });
        }

        // Verificar que el usuario exista
        const usuario = await Usuario.findById(usuarioId);
        if (!usuario) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        const index = publicacion.likes.indexOf(usuarioId);
        if (index === -1) {
            // No le ha dado like, agregarlo
            publicacion.likes.push(usuarioId);
        } else {
            // Ya le dio like, removerlo
            publicacion.likes.splice(index, 1);
        }

        await publicacion.save();
        res.json({ message: 'Like actualizado', likes: publicacion.likes });
    } catch (error) {
        res.status(500).json({ message: 'Error al procesar el Like', error: error.message });
    }
};

// Comentar publicación
publicacionCtrl.commentPublicacion = async (req, res) => {
    try {
        const { usuarioId, texto } = req.body;
        const publicacion = await Publicacion.findById(req.params.id);
        
        if (!publicacion) {
            return res.status(404).json({ message: 'Publicación no encontrada' });
        }

        // Verificar que el usuario exista
        const usuario = await Usuario.findById(usuarioId);
        if (!usuario) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        const nuevoComentario = {
            usuario: usuarioId,
            usuarioNombre: `${usuario.nombre} ${usuario.apellido}`,
            texto
        };

        publicacion.comentarios.push(nuevoComentario);
        await publicacion.save();
        
        res.json({ message: 'Comentario agregado', comentarios: publicacion.comentarios });
    } catch (error) {
        res.status(500).json({ message: 'Error al agregar comentario', error: error.message });
    }
};

// Actualizar estado (Pendiente, En Proceso, Limpiado)
publicacionCtrl.updateEstadoPublicacion = async (req, res) => {
    try {
        const { estado, usuarioId, fotoDespues } = req.body;
        const publicacion = await Publicacion.findById(req.params.id);
        
        if (!publicacion) {
            return res.status(404).json({ message: 'Publicación no encontrada' });
        }

        // Verificar usuario
        const usuario = await Usuario.findById(usuarioId);
        if (!usuario) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        publicacion.estado = estado;
        if (estado === 'Limpiado') {
            if (!fotoDespues) {
                return res.status(400).json({ message: 'Se requiere la foto del lugar limpio' });
            }
            publicacion.fotoDespues = fotoDespues;
            publicacion.limpiadoPor = usuarioId;
        } else {
            publicacion.fotoDespues = undefined;
            publicacion.limpiadoPor = undefined;
        }

        await publicacion.save();
        res.json({ message: 'Estado de publicación actualizado', publicacion });
    } catch (error) {
        res.status(500).json({ message: 'Error al actualizar el estado', error: error.message });
    }
};

// Eliminar comentario
publicacionCtrl.deleteComment = async (req, res) => {
    try {
        const { id, commentId } = req.params;
        const publicacion = await Publicacion.findById(id);
        
        if (!publicacion) {
            return res.status(404).json({ message: 'Publicación no encontrada' });
        }

        publicacion.comentarios.pull({ _id: commentId });
        await publicacion.save();

        res.json({ message: 'Comentario eliminado exitosamente', comentarios: publicacion.comentarios });
    } catch (error) {
        res.status(500).json({ message: 'Error al eliminar el comentario', error: error.message });
    }
};

module.exports = publicacionCtrl;
