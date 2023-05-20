// Equivalent de "import express as express" en javascript
const express = require('express');
const mysql = require('mysql');
const dotenv = require('dotenv').config();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');


const app = express();

// Met le dossier public comme dossier racine pour ce qui est visible pour l'utilisateur
app.use(express.static(__dirname + '/public/'));

app.use(express.json());

app.use(express.urlencoded({ extended: true }));

// Connection à la database
const db = mysql.createConnection({
    host: process.env.DATABASE_HOST,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
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

// Pas besoin de .html à la fin de l'url
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


// Inscription
app.post('/register', async (req, res) => {
    db.query('SELECT email FROM users WHERE email = ?', [req.body.mail], async (err, result) => { // Vérifie si l'adresse mail écrit est déjà utilisé dans la database
        if (err) throw err;
        if (result[0]) {
            var data = {
                status: 'erreur',
                erreur: 'Cet email est déjà utilisé.'
            }
            res.json(data);
        } else {
            if (req.body.mdp.length < 8) { // Vérifie la taille du mot de passe
                var data = {
                    status: 'erreur',
                    erreur: 'Le mot de passe doit au moins contenir 8 caractères'
                }
                res.json(data);
            } else if (req.body.mdp != req.body.confirm) { // Vérifie si les deux mots de passe sont identiques
                var data = {
                    status: 'erreur',
                    erreur: 'Veuillez entrer le même mot de passe deux fois.'
                }
                res.json(data);
            } else { 
                const mdpHash = await bcrypt.hash(req.body.mdp, 8) // Crypte le mot de passe
                let user = {
                    email: req.body.mail,
                    mdp: mdpHash,
                    nom: req.body.nom
                }
                let sql = 'INSERT INTO users SET ?';
                let query = db.query(sql, user, (err, result) => { // Crée et sauvegarde le nouveau compte dans la database
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
    let query = db.query(sql, [req.body.mail], async (err, result) => { // Récupère les informations de compte ayant pour email celui écrit
        if (err) throw err;
        console.log(result[0]);

        if (!result[0] || !await bcrypt.compare(req.body.mdp, result[0].mdp)) {
            var data = {
                status: 'erreur',
                erreur: 'Email ou mot de passe incorrect.'
            }
            console.log(data)
            res.json(data) // Envoie le dictionnaire au frontend
        }
        else {
            const user = {
                nom: result[0].nom,
                mail: req.body.mail
            }
            console.log(user)
            const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET) // Créé un token d'utilisateur
            var data = {
                status: 'succes',
                succes: 'Connecté',
                accessToken: accessToken
            }
            res.json(data) // Envoie le dictionnaire au frontend
        }
    })
})

// Création d'un thread
app.post('/nthread', (req, res) => {
    jwt.verify(req.body.accessToken, process.env.ACCESS_TOKEN_SECRET, (err, user) => { // Vérifie les informations du token
        if (err) throw err
        let auteur = user.nom // Récupère le nom de l'utilisateur à partir du token
        let mail = user.mail // Récupère le mail
        let post = {
            titre: req.body.titre, // Titre écrit dans le form
            auteur: auteur,
            mail: mail,
            contenu: req.body.desc,
            date: Date.now().toString(),
            comment: '[]'
        }
        console.log(Date.now().toString())
        let sql = 'INSERT INTO posts SET ?';
        let query = db.query(sql, post, (err, result) => { // Insère les informations du post dans la database
            if (err) throw err;
            console.log(result)
            var data = {
                status: 'succes',
                id: result.insertId // ID du post 
            }
            res.json(data) // Envoie le dictionaire au frontend
        })
    })
})

app.post('/create_thread', (req, res) => {
    let sql = 'SELECT * FROM posts';
    let query = db.query(sql, (err, result) => {
        console.log(result);
        var html = '';
        console.log(result[0]);
        for (let i = 9; i >= 0; i--) {
            if (result[i] != undefined) {                
                html = html + `
                <div class="row">
                    <a href="thread.html?${result[i].id}">
                        <h4 class="title">
                            ${result[i].titre}
                        </h4>
                        <div class="bottom">
                            <p class="date">
                                ${new Date(parseInt(result[i].date)).toLocaleString()}
                            </p>
                            <p class="ncomment">
                                ${JSON.parse(result[i].comment).length} commentaires
                            </p>
                        </div>
                    </a>
                </div>
                `
                console.log(html)
            }
            console.log(i)
        }
        var data = {html: html}
        res.json(data)
    })
})

app.post('/gen_thread', (req, res) => {
    var commentHtml = ''
    let sql = 'SELECT * FROM posts WHERE id = ?'
    let query = db.query(sql, [req.body.id], (err, result) => {
        let headerHtml = `
            <h4 class="titre">
                ${result[0].titre}
            </h4>
            <p class="desc">
                ${result[0].contenu}
            </p>
            <div class="infos">
                <p class="auteur">
                    par ${result[0].auteur}
                </p>
                <p> - </p>
                <p class="date">
                    ${new Date(parseInt(result[0].date)).toLocaleString()}
                </p>
                <p> - </p>
                <p class="comment-count">
                    ${JSON.parse(result[0].comment).length} comments
                </p>
            </div>
        `
        for (const comment of JSON.parse(result[0].comment)) {
            commentHtml = commentHtml + `
                <div class="comment">
                    <div class="top-comment">
                        <p class="user">
                            ${comment.auteur}
                        </p>
                        <p>-</p>
                        <p class="comment-ts">
                            ${new Date(comment.date).toLocaleString()}
                        </p>
                    </div>
                    <div class="comment-contenu">
                        ${comment.contenu}
                    </div>
                </div>
            `
        }
        var data = {
            headerHtml: headerHtml,
            commentHtml: commentHtml
        }
        res.json(data)
    })
})

// app.post('/nouv_comment', (req, res) => {
//     var s_comments = []
//     var auteur = ''
//     jwt.verify(req.body.accessToken, process.env.ACCESS_TOKEN_SECRET, (err, user) => { // Vérifie les informations du token
//         auteur = user.nom
//         console.log('1')
//     })

//     let sql = 'SELECT comment FROM posts WHERE id = ?'
//     let query = db.query(sql, [req.body.id], (err, result) => {
//         console.log('2')
//         var comments = JSON.parse(result[0].comment)
//         console.log('3')
//         var comment = {
//             contenu: req.body.contenu,
//             date: Date.now(),
//             auteur: auteur
//         }
//         comments.push(comment)
//         s_comments = JSON.stringify(comments)
//     })

//     console.log(s_comments)
//     console.log('4')
//     let sqll = 'UPDATE users SET comment = ? WHERE id = ?'
//     console.log(sqll)
//     console.log('5')
//     let queryy = db.query(sqll, [s_comments, req.body.id], (err, result) => {
//         console.log(s_comments)
//         console.log('6')
//         console.log(result)
//     })
// })

app.post('/nouv_comment', (req, res) => {
    var s_comments = []
    var auteur = ''
    jwt.verify(req.body.accessToken, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
        if (err) {
            // handle error
            console.log(err)
        } else {
            auteur = user.nom
            let sql = 'SELECT comment FROM posts WHERE id = ?'
            let query = db.query(sql, [req.body.id], (err, result) => {
                if (err) {
                    throw err
                } else {
                    var comments = JSON.parse(result[0].comment)
                    var comment = {
                        contenu: req.body.contenu,
                        date: Date.now(),
                        auteur: auteur
                    }
                    comments.push(comment)
                    s_comments = JSON.stringify(comments)

                    let sqll = 'UPDATE posts SET comment = ? WHERE id = ?'
                    let queryy = db.query(sqll, [s_comments, req.body.id], (err, result) => {
                        if (err) {
                            console.log('err')
                        } else {
                            console.log(result)
                            res.json({status: 'succes'})
                        }
                    })
                }
            })  
        }
    })
})

app.listen(3000, () => console.log('Lancé sur le port 3000'));
