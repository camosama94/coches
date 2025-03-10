const mongoose = require('mongoose');
const moduloCoche = require('./models/coche');
require('dotenv').config();

// Conectar a la base de datos
mongoose.connect(process.env.DATABASE_URL, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('Conectado a MongoDB'))
    .catch(err => console.error('Error de conexión:', err));

async function testCoche() {
    try {
        // Crear un coche nuevo
        console.log("Creando un coche nuevo...");
        const nuevoCoche = await moduloCoche.creaNuevoCoche("Toyota", "Corolla", 2022, 20000);
        console.log("Coche creado:", nuevoCoche);

        // Obtener todos los coches
        console.log("Obteniendo todos los coches...");
        const coches = await moduloCoche.buscaTodos();
        console.log("Lista de coches:", coches);

        // Buscar un coche por ID
        console.log("Buscando coche por ID...");
        const cocheEncontrado = await moduloCoche.buscaPorId(nuevoCoche._id);
        console.log("Coche encontrado:", cocheEncontrado);

        // Actualizar el coche
        console.log("Actualizando el coche...");
        const cocheActualizado = await moduloCoche.actualizaCoche(nuevoCoche._id, { precio: 18000 });
        console.log("Coche actualizado:", cocheActualizado);

        
    } catch (error) {
        console.error("Error en la prueba de coches:", error);
    } finally {
        mongoose.disconnect();
    }
}

testCoche();