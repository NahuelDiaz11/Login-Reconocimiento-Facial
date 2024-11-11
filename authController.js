const bcrypt = require('bcrypt');
const { getConnection } = require('./database');

// Registro de usuario
exports.registerUser = async (req, res) => {
    const { nombre, password } = req.body;
    const imagenFacial = req.file ? req.file.buffer : null;
    const faceDescriptor = JSON.parse(req.body.faceDescriptor);

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const connection = await getConnection();
        const query = "INSERT INTO usuarios (nombre, password, imagen_facial, face_descriptor) VALUES (?, ?, ?, ?)";
        await connection.execute(query, [nombre, hashedPassword, imagenFacial, JSON.stringify(faceDescriptor)]);
        connection.end();
        res.json({ success: true, message: 'Usuario registrado con éxito' });
    } catch (err) {
        console.error("Error al registrar usuario: ", err);
        res.status(500).json({ success: false, error: 'Error al registrar usuario' });
    }
};

// Primer paso del login (usuario y contraseña)
exports.loginStep1 = async (req, res) => {
    const { nombre, password } = req.body;
    
    try {
        const connection = await getConnection();
        const query = "SELECT id, password, face_descriptor FROM usuarios WHERE nombre = ?";
        const [results] = await connection.execute(query, [nombre]);
        connection.end();

        if (results.length > 0) {
            const { id, password: hashedPassword, face_descriptor } = results[0];
            const passwordMatch = await bcrypt.compare(password, hashedPassword);

            if (passwordMatch) {
                res.json({ 
                    success: true, 
                    userId: id, 
                    faceDescriptor: face_descriptor,
                    message: 'Credenciales correctas' 
                });
            } else {
                res.status(401).json({ success: false, message: 'Credenciales incorrectas' });
            }
        } else {
            res.status(401).json({ success: false, message: 'Credenciales incorrectas' });
        }
    } catch (err) {
        console.error("Error en la consulta: ", err);
        res.status(500).json({ success: false, error: 'Error en el servidor' });
    }
};

// Segundo paso del login (reconocimiento facial)
exports.loginStep2 = async (req, res) => {
    const { userId, faceDescriptor } = req.body;
    
    try {
        const connection = await getConnection();
        const [user] = await connection.execute("SELECT face_descriptor FROM usuarios WHERE id = ?", [userId]);
        connection.end();

        if (user.length > 0) {
            const storedDescriptor = user[0].face_descriptor;
            const distance = euclideanDistance(faceDescriptor, storedDescriptor);
            const threshold = 0.4;

            if (distance < threshold) {
                res.json({ success: true, message: 'Autenticación exitosa' });
            } else {
                res.status(401).json({ success: false, message: 'Reconocimiento facial fallido' });
            }
        } else {
            res.status(404).json({ success: false, message: 'Usuario no encontrado' });
        }
    } catch (err) {
        console.error("Error en la autenticación facial: ", err.message, err.stack);
        res.status(500).json({ success: false, error: 'Error en el servidor' });
    }
};

// Función para calcular la distancia euclidiana
function euclideanDistance(descriptor1, descriptor2) {
    if (descriptor1.length !== descriptor2.length) {
        throw new Error('Los descriptores deben tener la misma longitud');
    }
    return Math.sqrt(descriptor1.reduce((sum, val, i) => sum + Math.pow(val - descriptor2[i], 2), 0));
}