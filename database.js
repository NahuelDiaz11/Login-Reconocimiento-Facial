// const mysql = require('mysql2');

// const connection = mysql.createConnection({
//     host: 'localhost', // Cambia esto si tu base de datos está en otro host
//     user: 'root', // Tu usuario de MySQL
//     password: '123', // Tu contraseña de MySQL
//     database: 'reconocimiento'
// });

// connection.connect((err) => {
//     if (err) {
//         console.error('Error conectando a la base de datos: ', err.stack);
//         return;
//     }
//     console.log('Conectado a la base de datos MySQL con el id: ' + connection.threadId);
// });

// module.exports = connection;
const mysql = require('mysql2/promise');

const dbConfig = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
};

async function getConnection() {
    return await mysql.createConnection(dbConfig);
}

module.exports = { getConnection };


