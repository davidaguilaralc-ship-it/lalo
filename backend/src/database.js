// Aqui se hacen las cadenas de conexion
const mongoose = require('mongoose')

//cadena de conexion
const URI = process.env.MONGODB_URI
            ? process.env.MONGODB_URI
            : 'mongodb://127.0.0.1:27017/ecospotter'

mongoose.connect(URI)

const connection = mongoose.connection;

connection.once('open', ()=>{
    console.log('la base de datos a sido conectada:', URI);
})