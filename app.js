const express = require('express');
const mysql = require('mysql');
const bodyparser = require('body-parser');

const PORT = process.env.PORT || 3050;
const api_token = '1234'

const app = express();
app.use(bodyparser.json());


//MySQL

const connection = mysql.createConnection({
    //monumento1.ddns.net:16991
    host: '132.147.161.247',
    user: 'geslab',
    password: 'er34t',
    database: 'geslab',
    port: 3307,
    insecureAuth: true
});

//Route

app.get('/', (req, res) => {
    res.send('Bienvenido a la API de Inner Logistic');
});


//agregar Envio
app.post('/api/envios', (req = Request, res) => {

    const lcToken = req.header('auth-token');
    const lcJson = JSON.stringify(req.body);
    const clientesOBJ = {
        idcliente: req.body.idcliente,
        tipo: req.body.tipo,
        tipo_entrega: req.body.tipo_entrega,
        urgente: req.body.urgente,
        nombre_destino: req.body.nombre_destino,
        localidad: req.body.localidad,
        provincia: req.body.provincia,
        id_interno: req.body.id_interno,
        json_req: lcJson
    };

    insertarEnvio(lcToken, req.body.id_interno, clientesOBJ)
        .then((resp) => { res.status(200).send(resp) })
        .catch((err) => {
            const { status, message } = err;
            res.status(status).send({ message: message })
        });

});


//Funciones

const insertarEnvio = async (lcToken, lcId_interno, clientesOBJ) => {
    try {

        const token = await getAutentificar(lcToken);
        const idinterno = await getIdinterno(lcId_interno);
        const envio = await getInserta(clientesOBJ);
        return envio

    } catch (err) {

        throw err;
    };
};


//Autentificar
const getAutentificar = (token) => {
    console.log("Autentificar");
    return new Promise((resolve, reject) => {
        (token === api_token)
            ? resolve({ message: "Usuario válido" })
            : reject({ status: 401, message: "Fallo la autentificación" });
    });
}


//cheque si existe la ID INTERNO
const getIdinterno = (idinterno) => {
    console.log("Id interno");

    return new Promise((resolve, reject) => {

        const sql1 = `SELECT fechahora FROM ordenes_trabajo_preimposicion WHERE id_interno= "${idinterno}"`;
        connection.query(sql1, (error, results) => {

            if (error) {
                reject({ status: 500, message: "No se pudo obtener si existe el ID UNICO" });
            };

            if (results.length > 0) {
                reject({ status: 409, message: "Ya existe el ID UNICO" });
            };

            resolve({ message: "ID UNICO apto" });

        });
    });
};

//inserta el registro del envio
const getInserta = (clientesOBJ) => {
    console.log("Inserta");

    return new Promise((resolve, reject) => {

        const sql2 = 'INSERT INTO ordenes_trabajo_preimposicion SET ?';
        connection.query(sql2, clientesOBJ, (error, results) => {
            if (error) {
                reject({ status: 500, message: "No se pudo insertar el Envio" })
            }

            resolve({
                message: 'Envio Pre-impuesto',
                id_interno: clientesOBJ.id_interno
            })

        });

    });

};


//Check connect
connection.connect(error => {
    if (error) throw error;
    console.log('Servidor de base de datos corriendo');
});

app.listen(PORT, () => console.log(`Servidor corriendo en el puerto ${PORT}`));

