const mysql = require('mysql');
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const db = require('./db');
const app = express();

const connection = mysql.createConnection({
    host: 'localhost', 
    user: 'root',// Remplacez par votre nom d'utilisateur MySQL
    password: 'SQLEXECUTE', // Remplacez par votre mot de passe MySQL
    database: 'gestion_anciensetudiants', // Nom de la base de données
    port: 3306,
});

connection.connect((err) => {
    if (err) {
        console.error('Erreur de connexion à la base de données :', err);
        return;
    }
    console.log('Connecté à la base de données MySQL.');
});

module.exports = connection;
