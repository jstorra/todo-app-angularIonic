const express = require('express');
const mysql = require('mysql');
const jwt = require('jsonwebtoken');
const cors = require('cors');

const app = express();
const port = 3000;

const connection = mysql.createConnection({
    host: 'localhost',
    database: 'tododb',
    user: 'root',
    password: ''
});

app.use(express.json());

app.use(cors({
    origin: 'http://localhost:8100',
    credentials: true
}));

app.post('/registro', (req, res) => {
    const nuevoUsuario = req.body;
    connection.query('INSERT INTO usuarios SET ?', nuevoUsuario, (error) => {
        if (error) {
            console.error("Error al realizar la consulta:", error);
            return res.status(500).json({ mensaje: 'Error al registrarse' });
        };
        res.status(201).json({ mensaje: 'Usuario creado exitosamente' });
    });
})

app.post('/login', (req, res) => {
    const { usuario, contraseña } = req.body;
    connection.query(
        'SELECT * FROM usuarios WHERE usuario = ? AND contraseña = ?',
        [usuario, contraseña],
        (error, results) => {
            if (error) {
                console.error("Error al realizar la consulta:", error);
                return res.status(500).json({ mensaje: 'Error al iniciar sesión' });
            }
            if (results.length === 0) return res.status(401).json({ mensaje: 'Usuario o contraseña incorrectos' });
            const token = jwt.sign({ usuario_id: results[0].id }, 'claveSecreta', { expiresIn: '1d' });
            res.status(200).json({ token });
        }
    );
});

// Protege los endpoints con autenticación JWT
app.use((req, res, next) => {
    const token = req.headers['authorization'];
    if (!token) return res.status(401).json({ mensaje: 'No se ha proporcionado un token de autenticación' });
    try {
        jwt.verify(token, 'claveSecreta');
    } catch (error) {
        return res.status(401).json({ mensaje: 'Token de autenticación inválido' });
    }
    next();
});

app.get('/tareas', (req, res) => {
    connection.query('SELECT * FROM tareas', (error, results) => {
        if (error) {
            console.error("Error al realizar la consulta:", error);
            return res.status(500).json({ mensaje: 'Error al obtener las tareas' });
        }
        res.status(200).json(results);
    });
});

app.get('/tareasUsuario/:id', (req, res) => {
    const { id } = req.params;
    buscarUsuario(id, (error) => {
        if (error) {
            return res.status(error.status).json({ mensaje: error.mensaje });
        }
        connection.query('SELECT * FROM tareas WHERE id_usuario = ?', id, (error, results) => {
            if (error) {
                console.error("Error al realizar la consulta:", error);
                return res.status(500).json({ mensaje: 'Error al obtener las tareas' });
            }
            res.status(200).json(results);
        });
    })
});

app.post('/tareas', (req, res) => {
    const nuevaTarea = req.body;
    connection.query('INSERT INTO tareas SET ?', nuevaTarea, (error) => {
        if (error) {
            console.error("Error al realizar la consulta:", error);
            return res.status(500).json({ mensaje: 'Error al crear la tarea' });
        }
        res.status(201).json({ mensaje: 'Tarea creada exitosamente' });
    });
});

app.get('/tareas/:id', (req, res) => {
    const { id } = req.params;
    buscarTarea(id, (error) => {
        if (error) {
            return res.status(error.status).json({ mensaje: error.mensaje });
        }
        connection.query('SELECT * FROM tareas WHERE id = ?', id, (error, results) => {
            if (error) {
                console.error("Error al realizar la consulta:", error);
                return res.status(500).json({ mensaje: 'Error al obtener la tarea' });
            }
            res.status(200).json(results);
        });
    })
});

app.put('/tareas/:id', (req, res) => {
    const { id } = req.params;
    const tareaActualizada = req.body;
    buscarTarea(id, (error) => {
        if (error) {
            return res.status(error.status).json({ mensaje: error.mensaje });
        }
        connection.query('UPDATE tareas SET ? WHERE id = ?', [tareaActualizada, id], (error) => {
            if (error) {
                console.error("Error al realizar la consulta:", error);
                return res.status(500).json({ mensaje: 'Error al actualizar la tarea' });
            }
            res.status(200).json({ mensaje: 'Tarea actualizada exitosamente' });
        });
    });
});

app.delete('/tareas/:id', (req, res) => {
    const { id } = req.params;
    buscarTarea(id, (error) => {
        if (error) {
            return res.status(error.status).json({ mensaje: error.mensaje });
        }
        connection.query('DELETE FROM tareas WHERE id = ?', id, (error) => {
            if (error) {
                console.error("Error al realizar la consulta:", error);
                return res.status(500).json({ mensaje: 'Error al eliminar la tarea' });
            }
            res.status(200).json({ mensaje: 'Tarea eliminada exitosamente' });
        });
    })
});

app.listen(port, () => {
    console.log(`Servidor API RESTful escuchando en el puerto ${port}`);
});

function buscarTarea(id, callback) {
    connection.query('SELECT * FROM tareas WHERE id = ?', id, (error, results) => {
        if (error) {
            console.error("Error al realizar la consulta:", error);
            callback({ status: 500, mensaje: 'Error al buscar la tarea' });
            return;
        }
        if (results.length === 0) {
            callback({ status: 404, mensaje: 'Tarea no encontrada' });
            return;
        }
        callback(null);
    });
}

function buscarUsuario(id, callback) {
    connection.query('SELECT * FROM usuarios WHERE id = ?', id, (error, results) => {
        if (error) {
            console.error("Error al realizar la consulta:", error);
            callback({ status: 500, mensaje: 'Error al buscar el usuario' });
            return;
        }
        if (results.length === 0) {
            callback({ status: 404, mensaje: 'Usuario no encontrado' });
            return;
        }
        callback(null);
    });
}