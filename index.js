// equivalent de import express as express en javascript
const express = require('express');
const mysql = require('mysql');
const dotenv = require('dotenv').config();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');


const app = express();

app.use(express.static(__dirname + '/public/'));

app.use(express.json());

app.use(express.urlencoded({ extended: true }));

// Connection à la database
const db = mysql.createConnection({
    host: process.env.DATABASE_HOST,
    user: process.env.DATABASE_USER,
    password: process.env.DATABSE_PASSWORD,
    database: process.env.DATABASE,
})


db.connect((err) => {
    if (err) throw err;
    console.log("database connectée")
})

// Creation de la database
// app.get('/createdb', (req, res) => {
//     let sql = 'CREATE DATABASE forumdb';
//     db.query(sql, (err, result) => {
//         if (err) throw err;
//         console.log(result)
//         res.send('Database créée');
//     })
// })

// Creation de la table utilisateur
// app.get('/createtableusers', (req, res) => {
//     let sql = 'CREATE TABLE users(id int AUTO_INCREMENT, email VARCHAR(255), mdp TEXT, nom VARCHAR(255), PRIMARY KEY(id))';
//     db.query(sql, (err, results) => {
//         if (err) throw err;
//         console.log(results);
//         res.send('Table users créée')
//     })
// })

// Creation de la table posts
// app.get('/createtableposts', (req, res) => {
//     let sql = 'CREATE TABLE posts(id int AUTO_INCREMENT, titre VARCHAR(255), auteur VARCHAR(255), mail VARCHAR(255), contenu TEXT, date TEXT, comment JSON, PRIMARY KEY(id))';
//     db.query(sql, (err, results) => {
//         if (err) throw err;
//         console.log(results);
//         res.send('Table posts créée')
//     })
// })

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/index.html')
})

app.get('/register', (req, res) => {
    res.sendFile(__dirname + '/public/register.html');
})

app.get('/login', (req, res) => {
    res.sendFile(__dirname + '/public/login.html');
})

app.get('/forum', (req, res) => {
    res.sendFile(__dirname + '/public/forum.html');
})

app.get('/thread', (req, res) => {
    res.sendFile(__dirname + '/public/thread.html');
})

app.get('/nouveau_thread', (req, res) => {
    jwt.verify(req.query.accessToken, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
        if (err) return res.json({status: 'erreur'})
        res.json({status: 'succes'})
    })
})


app.post('/register', async (req, res) => {
    db.query('SELECT email FROM users WHERE email = ?', [req.body.mail], async (err, result) => {
        if (err) throw err;
        if (result[0]) {
            var data = {
                status: 'erreur',
                erreur: 'Cet email est déjà utilisé.'
            }
            res.json(data);
        } else {
            if (req.body.mdp.length < 8) {
                var data = {
                    status: 'erreur',
                    erreur: 'Le mot de passe doit au moins contenir 8 caractères'
                }
                res.json(data);
            } else if (req.body.mdp != req.body.confirm) {
                var data = {
                    status: 'erreur',
                    erreur: 'Veuillez entrer le même mot de passe deux fois.'
                }
                res.json(data);
            } else {
                const mdpHash = await bcrypt.hash(req.body.mdp, 8)
                let user = {
                    email: req.body.mail,
                    mdp: mdpHash,
                    nom: req.body.nom
                }
                let sql = 'INSERT INTO users SET ?';
                let query = db.query(sql, user, (err, result) => {
                    if (err) throw err;
                    console.log(result)
                    var data = {
                        status: 'succes',
                        succes: 'Compte créé'
                    }
                    res.json(data);
                    res.redirect('/login')
                })
            }
        }
    })
})

app.post('/login', (req, res) => {
    let sql = 'SELECT * FROM users WHERE email = ?';
    let query = db.query(sql, [req.body.mail], async (err, result) => {
        if (err) throw err;
        console.log(result[0]);

        if (!result[0] || !await bcrypt.compare(req.body.mdp, result[0].mdp)) {
            // res.send('Mdp ou mail incorrect') // TODO Mettre qqc de plus beau
            var data = {
                status: 'erreur',
                erreur: 'Email ou mot de passe incorrect.'
            }
            console.log(data)
            res.json(data)
        }
        else {
            // res.send('Mdp correct!') // TODO Mettre qqc de plus beau
            const user = {
                nom: result[0].nom,
                mail: req.body.mail
            }
            console.log(user)
            const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET)
            var data = {
                status: 'succes',
                succes: 'Connecté',
                accessToken: accessToken
            }
            res.json(data)
        }
    })
})

// function authentification(req, res, next) {
//     const authHeader = req.headers['authorization']
//     const token = authHeader && authHeader.split(' ')[1]
//     if(token == null) return res.sendStatus(401)

//     jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
//         if (err) return res.sendStatus(403)
//         req.user = user
//         next()
//     })
// }


app.post('/nthread', (req, res) => {
    try {
        jwt.verify(req.body.accessToken, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
            if (err) throw err
            let auteur = user.nom
            let mail = user.mail
            let post = {
                titre: req.body.titre,
                auteur: auteur,
                mail: mail,
                contenu: req.body.desc,
                date: Date.now().toString(),
                comment: {}
            }
            console.log(Date.now().toString())
            let sql = 'INSERT INTO posts SET ?';
            let query = db.query(sql, post, (err, result) => {
                if (err) throw err;
                console.log(result)
                db.query(`SELECT * FROM posts WHERE titre = ?`,[req.body.titre] , (error, resultt) => {
                    console.log(resultt)
                    var data = {
                        status: 'succes',
                        id: resultt[0].id
                    }
                    res.json(data)
                })
                // TODO diriger vers le post créé
            })
        })
    } catch (err) {
        throw err
    }
})

app.listen(3000, () => console.log('Listening at 3000'));
