const {Router} = require('express')
const router = Router()

const { createUsu, getUsu, getUsuario, deleteUsu, updateUsu, loginUsu} = require('../controller/usuario_controller')

router.route('/')
    .get(getUsu)
    .post(createUsu)

router.route('/login')
    .post(loginUsu)

router.route('/:id') //va a recibir por la URL un parametro
    .get(getUsuario)
    .delete(deleteUsu)
    .put(updateUsu)

module.exports = router;