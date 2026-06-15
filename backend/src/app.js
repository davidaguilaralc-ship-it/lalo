//archivo para hacer las configuraciones del servidor
const express = require('express')
const cors = require('cors')
const app = express();

//configuracion
app.set('port', process.env.PORT || 4000)

//middlewares
app.use(cors()) //modulo que nos permite hacer las peticiones desde un servidor distinto al del servidor de nuestro backend
app.use(express.json({ limit: '10mb' })) //devuelve json, con límite aumentado para Base64
app.use(express.urlencoded({ limit: '10mb', extended: true }))

//rutas

app.get('/', (req, res )=>{
    res.send('Bienvenido a mi api rest full'); //respuesta a peticion
})

// ruta para nuestra api de usuarios
app.use('/api/usuarios', require('./routes/usuario'))
// ruta para nuestra api de publicaciones
app.use('/api/publicaciones', require('./routes/publicacion'))

module.exports = app;