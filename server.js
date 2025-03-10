const express = require("express");
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const multer = require('multer');
const jwt = require('jsonwebtoken');
const upload = multer({ dest: 'uploads/' });
const app = express();
// Conexion a bbdd
require('dotenv').config();
mongoose.connect(process.env.DATABASE_URL)
    .then(() => console.log('Connected!'));

// El contenido estático tiene prioridad
const path = require('path');
app.use(express.static('public'));
const port = 3001;
const moduloCoche = require('./models/coche');
const User = require('./models/User');
// Middleware para parsear el cuerpo de las solicitudes en formato JSON
app.use(express.json());
app.use(express.urlencoded({extended: true}));

// Clave secreta para JWT
const SECRET_KEY = 'mi_clave_secreta';

// Middleware para verificar el token
const verifyToken = (req, res, next) => {
    const token = req.headers['authorization'];
    console.log(token);
    if (!token) return res.status(401).json({ message: 'Token no enviado' });
    const tokenWithoutBearer = token.split(' ')[1];

    //console.log(tokenWithoutBearer);

    jwt.verify(tokenWithoutBearer, SECRET_KEY, (err, decoded) => {
        if (err) {
            return res.status(401).json({ message: 'Fallo de autenticación' });
        }
        req.user = decoded; // Guardamos la información del usuario en la solicitud
        next();
    });
};

// Ruta de inicio que carga login.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'login.html'));  // Aquí forzamos que se cargue login.html
});

// Registro de usuario
app.post('/registro', express.urlencoded({ extended: true }), (req, res) => {
    const { name, email, password } = req.body;
    
    // Encriptar contraseña
    bcrypt.genSalt(10)
      .then(salt => bcrypt.hash(password, salt))
      .then(hashedPassword => {
        // Crear usuario
        const newUser = new User({
          name,
          email,
          password: hashedPassword,
        });
        
        // Guardar usuario
        return newUser.save();
      })
      .then(() => {
        res.json({ message: 'Usuario registrado correctamente' });
      })
      .catch(error => {
        console.error(error);
        res.status(500).json({ message: 'Error al registrar usuario' });
      });
});

// Login de usuario con JWT
app.post('/login', (req, res) => {
    const { email, password } = req.body;
    
    // Buscar usuario
    User.findOne({ email })
      .then(user => {
        if (!user) {
          return res.status(400).json({ message: 'Credenciales inválidas' });
        }
        
        // Comparar contraseñas
        return bcrypt.compare(password, user.password)
          .then(isMatch => {
            if (!isMatch) {
              return res.status(400).json({ message: 'Credenciales inválidas' });
            }

            // Generar token JWT
            const token = jwt.sign({ id: user._id, username: user.name }, SECRET_KEY, { expiresIn: '1h' });
            res.json({ message: 'Usuario autenticado correctamente', token });
          });
      })
      .catch(error => {
        console.error(error);
        res.status(500).json({ message: 'Error al iniciar sesión' });
      });
});


// Obtener todos los coches (protegido por JWT)
app.get("/coches", verifyToken, (req, res) => {
    moduloCoche.buscaTodos()
    .then(coches => res.json(coches))
    .catch(err => res.status(500).json({ "error": err }))
});

// Obtener un coche por ID (protegido por JWT)
app.get("/coches/:id", verifyToken, (req, res) => {
    const cocheId = req.params.id;
    moduloCoche.buscaPorId(cocheId)
    .then(coche => res.json(coche))
    .catch(err => res.status(500).json({ "error": err }))
});

// Crear un nuevo coche (protegido por JWT)
app.post("/coches", verifyToken, (req, res) => {
    const { marca, modelo, anno, precio } = req.body;
    moduloCoche.creaNuevoCoche(marca, modelo, anno, precio)
    .then(coche => res.json(coche))
    .catch(err => res.status(500).json({ "error": err }))
});

// Actualizar un coche existente (protegido por JWT)
app.put("/coches/:id", verifyToken, (req, res) => {
    const cocheId = req.params.id;
    moduloCoche.actualizaCoche(cocheId, req.body)
    .then(coche => res.status(200).json(coche))
    .catch(err => res.status(500).send("Error al actualizar el coche"))
});

// Eliminar un coche (protegido por JWT)
app.delete("/coches/:id", verifyToken, (req, res) => {
    const cocheId = req.params.id;
    moduloCoche.borraCoche(cocheId)
    .then(coche => res.status(200).json(coche))
    .catch(err => res.status(500).send("Error"))
});


app.get('/index', verifyToken, (req, res) => {
  // Si el token es válido, se envía el archivo coches.html
  res.sendFile(path.join(__dirname, 'public', 'coches.html'));
});


// Iniciar el servidor
app.listen(port, () => {
    console.log(`Servidor escuchando en http://localhost:${port}`);
});
