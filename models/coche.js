const mongoose = require('mongoose');

// Definimos el esquema del documento para coches
const cocheSchema = new mongoose.Schema({
    marca: String,
    modelo: String,
    anno: String, // <-- Mejor usar Number en lugar de String si es un año
    precio: Number
}, { collection: 'Coches' }); // <-- Especificamos el nombre exacto de la colección

// Creamos el modelo
const Coche = mongoose.model('Coche', cocheSchema);

const buscaPrimero = () => {
    Coche.findOne()
        .then(coche => {
            if (coche) {
                console.log('Primer coche encontrado', coche);
            } else {
                console.log('No se encontró ningún registro');
            }
        })
        .catch(err => console.error('Error al obtener el coche', err));
};

const buscaTodos = () => {
    return Coche.find()
        .then(coches => {
            if (coches.length > 0) {
                console.log('Coches encontrados', coches);
                return coches;
            } else {
                console.log('No se encontró ningún registro');
                return null;
            }
        })
        .catch(err => {
            console.error('Error al obtener los coches', err);
            throw err;
        });
};

const buscaPorId = (id) => {
    return Coche.findById(id)
        .then(coche => {
            if (coche) {
                console.log('Coche con ID:', id, ' encontrado:', coche);
                return coche;
            } else {
                console.log('No se encontró el coche con el ID:' + id);
                return null;
            }
        })
        .catch(err => {
            console.error('Error al obtener el coche', err);
            throw err;
        });
};

const buscaPrecioMayor = (parametro) => {
    Coche.find({ precio: { $gt: parametro } })
        .then(coches => {
            if (coches.length > 0) {
                console.log('Coches encontrados con precio mayor que', parametro, ':', coches);
            } else {
                console.log('No se encontró ningún registro');
            }
        })
        .catch(err => console.error('Error al obtener los coches', err));
};

const creaNuevoCoche = (marca, modelo, anno, precio) => {
    const nuevoCoche = new Coche({
        marca,
        modelo,
        anno,
        precio
    });
    return nuevoCoche.save()
        .then(coche => {
            console.log('Coche guardado:', coche);
            return coche;
        })
        .catch(err => {
            console.error('Error al guardar el coche:', err);
            throw err;
        });
};

const actualizaCoche = (idCoche, cocheActualizar) => {
    return Coche.findByIdAndUpdate(idCoche, cocheActualizar, { new: true })
        .then(cocheActualizado => {
            if (cocheActualizado) {
                console.log('Coche actualizado:', cocheActualizado);
                return cocheActualizado;
            } else {
                console.log('No se encontró ningún coche con ese ID.');
                return null;
            }
        })
        .catch(err => console.error('Error al actualizar el coche:', err));
};

const borraCoche = (idCoche) => {
    return Coche.findByIdAndDelete(idCoche)
        .then(cocheEliminado => {
            if (cocheEliminado) {
                console.log('Coche eliminado:', cocheEliminado);
                return cocheEliminado;
            } else {
                console.log('No se encontró ningún coche con ese ID.');
                return null;
            }
        })
        .catch(err => {
            console.error('Error al eliminar el coche:', err);
            throw err;
        });
};

module.exports = {
    buscaPrimero, buscaTodos, buscaPorId,
    buscaPrecioMayor, creaNuevoCoche, actualizaCoche, borraCoche,
    Coche
};
