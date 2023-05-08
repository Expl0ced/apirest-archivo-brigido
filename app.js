const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const multer = require('multer');
const morgan = require('morgan');
const mysqlConnection = require('./database.js');
const path = require('path');
const fs = require('fs').promises;
const fs2 = require('fs');
const moment = require('moment')
const axios = require('axios');

const app = express();
app.use(cors({
    origin: '*', // Reemplaza con el origen de tu aplicación Angular
    methods: ["GET","POST","DELETE","UPDATE","PUT","PATCH","HEAD","OPTIONS","CONNECT","TRACE"], // Reemplaza con los métodos que necesitas
    allowedHeaders: ['Content-Type', 'Authorization'], // Reemplaza con los encabezados que necesitas
    exposedHeaders: ['Content-Range', 'X-Content-Range'],
    credentials: true, // Habilita el envío de cookies de origen cruzado
    optionsSuccessStatus: 204,
    preflightContinue: true
}));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors({ origin: "*" }));
app.use(bodyParser.json());
app.use(morgan('dev'));



app.get('/', (req, res) => {
    res.send('Bienvenidos a mi API')
})

// Ruta para guardar imagenes
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
const storage = multer.diskStorage({
    destination: (req, file, callBack) => {

        const ext = file.originalname.split('.').pop();
        if (ext == 'pdf' || ext == 'doc' || ext == 'txt' || ext == 'xlsx' || ext == 'csv' || ext == 'rar' || ext == 'zip') {
            callBack(null, 'C:/Users/explo/app tesis/healthyfood/src/assets/minutas')
        }
        else {
            if (ext == 'jpg' || ext == 'png' || ext == 'jpeg' || ext == 'gif' || ext == 'png' || ext == 'bmp' || ext == 'tif')
                callBack(null, 'C:/Users/explo/app tesis/healthyfood/src/assets/avatars')
        }

    },
    filename: (req, file, callBack) => {
        const ext = file.originalname.split('.').pop()
        callBack(null, file.originalname)
    }
})
const upload = multer({ storage: storage })


//para imagenes de recetas
const almacen = multer.diskStorage({
    destination: (req, file, callBack) => {

        const ext = file.originalname.split('.').pop();
        callBack(null, 'C:/Users/explo/app tesis/healthyfood/src/assets/recetas/cabecera')

    },
    filename: (req, file, callBack) => {
        const ext = file.originalname.split('.').pop()
        callBack(null, file.originalname)
    }
})
const subida = multer({ storage: almacen })

//para etiqueta
const bodega = multer.diskStorage({
    destination: (req, file, callBack) => {

        const ext = file.originalname.split('.').pop();
        callBack(null, 'C:/Users/explo/app tesis/healthyfood/src/assets/recetas/etiqueta')

    },
    filename: (req, file, callBack) => {
        const ext = file.originalname.split('.').pop()
        callBack(null, file.originalname)
    }
})

// Rutas
app.get("/upload", (req, res) => {
    mysqlConnection.query('SELECT * FROM  files', (err, rows, fields) => {
        if (!err) {
            res.json(rows);
        } else {
            console.log(err);
        }
    });
});

app.post('/cosas', upload.single('file'), (req, res, next) => {
    console.log(req.body)

});
app.get("/:id", (req, res) => {
    const { id } = req.params;
    mysqlConnection.query('SELECT Img FROM usuarios WHERE idUser=?', [id], (err, rows, fields) => {
        if (!err) {
            res.json(rows);
        } else {
            console.log(err);
        }
    });
});
app.post('/cosas', upload.single('file'), (req, res, next) => {
    console.log(req.body)

});

app.post('/file', upload.single('file'), (req, res, next) => {
    const idUser = req.body.idUser;
    const nombre = req.body.nombre;
    const apellido = req.body.apellido;
    nameFile = idUser + " " + nombre + " " + apellido

    const fecha = moment().format("DD/MM/YYYY");
    const file = req.file;
    const ext = file.filename.split('.');
    console.log(file.originalname)
    const filesImg = {

        id: null,
        nombre: nameFile,
        imagen: 'assets/minuta/' + file.originalname,
        fecha_creacion: fecha,
        idUser: idUser
    }

    if (!file) {
        const error = new Error('No File')
        error.httpStatusCode = 400;
        return next(error)
    }

    res.send(file);
    console.log(filesImg);

    mysqlConnection.query('INSERT INTO files set ?', [filesImg]);

});
app.post('/img', upload.single('file'), (req, res, next) => {
    const idUser = req.body.idUser;
    const nombre = req.body.nombre;
    const apellido = req.body.apellido;
    nameFile = idUser + " " + nombre + " " + apellido

    const fecha = moment().format("DD/MM/YYYY");
    const file = req.file;
    const ext = file.filename.split('.');
    console.log(file.originalname)
    const filesImg = {

        id: null,
        nombre: nameFile,
        imagen: 'assets/avatars/' + file.originalname,
        fecha_creacion: fecha,
        idUser: idUser
    }

    if (!file) {
        const error = new Error('No File')
        error.httpStatusCode = 400;
        return next(error)
    }

    res.send(file);
    mysqlConnection.query("UPDATE usuarios SET Img=? where idUser=?", [filesImg.imagen, idUser])
    mysqlConnection.query("UPDATE orden_nutri SET Img=? where idClienteNutri=?", [filesImg.imagen, idUser])

});
app.post('/imgrecipe', subida.single('file'), (req, res, next) => {
    const idUser = req.body.idUser;
    const nombre = req.body.nombre;
    const apellido = req.body.apellido;
    nameFile = idUser + " " + nombre + " " + apellido

    const fecha = moment().format("DD/MM/YYYY");
    const file = req.file;
    const ext = file.filename.split('.');
    console.log(file.originalname)
    const filesImg = {

        id: null,
        nombre: nameFile,
        imagen: 'assets/recetas/cabecera/' + file.originalname,
        fecha_creacion: fecha,
        idUser: idUser
    }

    if (!file) {
        const error = new Error('No File')
        error.httpStatusCode = 400;
        return next(error)
    }

    res.send(file);
    console.log(filesImg);

    mysqlConnection.query("UPDATE recetas AS s, (select max(IdReceta) as id from recetas) AS p SET s.Imagen=? WHERE s.IdReceta = p.id", [filesImg.imagen])

});



app.post('/imgetiqueta', subida.single('file'), (req, res, next) => {
    const idUser = req.body.idUser;
    const nombre = req.body.nombre;
    const apellido = req.body.apellido;
    nameFile = idUser + " " + nombre + " " + apellido

    const fecha = moment().format("YYYY/MM/DD");
    const file = req.file;
    const ext = file.filename.split('.');
    console.log(file.originalname)
    const filesImg = {

        id: null,
        nombre: nameFile,
        imagen: 'assets/recetas/etiqueta/' + file.originalname,
        fecha_creacion: fecha,
        idUser: idUser
    }

    if (!file) {
        const error = new Error('No File')
        error.httpStatusCode = 400;
        return next(error)
    }

    res.send(file);
    console.log(filesImg);

    mysqlConnection.query("UPDATE recetas AS s, (select max(IdReceta) as id from recetas) AS p SET s.Etiqueta=? WHERE s.IdReceta = p.id", [filesImg.imagen])

});


app.delete('/delete/:id', (req, res) => {

    const { id } = req.params;
    deleteFile(id);
    mysqlConnection.query('DELETE FROM files WHERE id = ?', [id]);
    res.json({ message: "The file was deleted" });
});




app.get('/download', (req, res) => {
    const url = 'C:/Users/explo/app tesis/healthyfood/src/assets/minutas/'+req.body.filename;
    const filename = req.body.filename;
    axios({
        url,
        method: 'GET',
        responseType: 'stream'
    }).then(response => {
        res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
        res.setHeader('Content-Type', 'application/pdf');
        response.data.pipe(res);
    }).catch(error => {
        console.log(error);
        res.sendStatus(500);
    });
});

function deleteFile(id) {

    mysqlConnection.query('SELECT * FROM  files WHERE id = ?', [id], (err, rows, fields) => {
        [{ imagen }] = rows;
        fs.unlink(path.resolve('C:/Users/explo/app tesis/healthyfood/src/assets/avatars/' + imagen)).then(() => {
            console.log('Imagen eliminada');
        }).catch(err => { console.error('no exite el archivo') })
    });
};




//Puerto de conexion
app.listen(3300, () => {
    console.log("The server started on port 3300 !!!!!!");
});