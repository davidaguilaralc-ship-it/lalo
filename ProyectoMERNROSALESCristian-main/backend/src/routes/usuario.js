const {Router} = require('express')
const router = Router()

const { createUsu, getUsu, getUsuario, deleteUsu, updateUsu} = require('../controller/usuario_controller')

router.route('/')
    .get(getUsu)
    .post(createUsu)

router.route('/:id') //va a recibir por la URL un parametro
    .get(getUsuario)
    .delete(deleteUsu)
    .put(updateUsu)

module.exports = router;