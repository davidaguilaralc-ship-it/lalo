const usuarioCtrl = {}
const crypto = require('crypto');

const Usuario = require('../models/Usuario')

usuarioCtrl.getUsu = async(req, res) =>{
    const usuarios = await Usuario.find({}, { password: 0 })
    res.json(usuarios)
}

usuarioCtrl.createUsu = async(req, res) =>{
    const {nombre, apellido, correo, telefono, edad, password} = req.body;
    const hashedPassword = password ? crypto.createHash('sha256').update(password).digest('hex') : '';
    const newUsu = new Usuario({
        nombre: nombre,
        apellido: apellido,
        correo: correo,
        telefono: telefono,
        edad: edad,
        password: hashedPassword
    })
    await newUsu.save()
    res.json({message: "El usuario a sido creado"})
}

usuarioCtrl.getUsuario = async(req, res) =>{
    const usuario = await Usuario.findById(req.params.id, { password: 0 })
    res.json(usuario)
}

usuarioCtrl.deleteUsu = async(req, res) =>{
    await Usuario.findByIdAndDelete(req.params.id)
    res.json({message: 'usuario a sido eliminado'})
}

usuarioCtrl.updateUsu = async(req, res) =>{
    const {nombre, apellido, correo, telefono, edad, password} = req.body;
    const updateData = { nombre, apellido, edad, correo, telefono };
    if (password) {
        updateData.password = crypto.createHash('sha256').update(password).digest('hex');
    }
    await Usuario.findByIdAndUpdate(req.params.id, updateData)
    res.json({message: 'el usuario ha sido actualizado'})
}

usuarioCtrl.loginUsu = async(req, res) => {
    const { id, password } = req.body;
    try {
        const usuario = await Usuario.findById(id);
        if (!usuario) {
            return res.status(404).json({ message: "Usuario no encontrado" });
        }
        
        // If the user has a password in DB, it must match
        if (usuario.password) {
            const hashedPassword = crypto.createHash('sha256').update(password || '').digest('hex');
            if (usuario.password !== hashedPassword) {
                return res.status(400).json({ message: "Contraseña incorrecta" });
            }
        }
        
        const userObj = usuario.toObject();
        delete userObj.password;
        res.json({ message: "Inicio de sesión exitoso", usuario: userObj });
    } catch (error) {
        res.status(500).json({ message: "Error en el servidor", error: error.message });
    }
}

module.exports = usuarioCtrl;