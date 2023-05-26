// Equivalent de "import express as express" en javascript
const express = require('express');
const mysql = require('mysql'); // database
const dotenv = require('dotenv').config(); // Permet la lecture du fichier .env contenant des informations secrètes non visibles à l'utilisateur
const bcrypt = require('bcryptjs'); // Permet le cryptage des mots de passes
const jwt = require('jsonwebtoken'); // Permet la création de token
const nodemailer = require('nodemailer') // Permet l'envoi de mails


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
//     let sql = 'CREATE TABLE posts(id int AUTO_INCREMENT, titre VARCHAR(255), auteur VARCHAR(255), contenu TEXT, date TEXT, comment JSON, PRIMARY KEY(id))';
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

app.get('/compte', (req, res) => {
    res.sendFile(__dirname + '/public/compte.html')
})

app.get('/feedback', (req, res) => {
    res.sendFile(__dirname + '/public/feedback.html')
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
                id: result[0].id
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
        let auteur = user.id // Récupère le nom de l'utilisateur à partir du token
        let post = {
            titre: req.body.titre, // Titre écrit dans le form
            auteur: auteur,
            contenu: req.body.desc,
            date: Date.now().toString(),
            comment: '[]'
        }
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

// Affichage des threads
app.post('/create_thread', (req, res) => {
    let sql = 'SELECT * FROM posts';
    let query = db.query(sql, (err, result) => {
        if (err) {
            throw err
        } else {
            var html = '';
            for (let i = 10; i >= -1; i--) {
                if (result[i] != undefined) {
                    let sqll = 'SELECT * FROM users WHERE id = ?'            
                    let queryy = db.query(sqll, [parseInt(result[i].auteur)], (errr, resultt) => {
                        if (errr) throw errr
                        html = html + `
                        <div class="row">
                            <a href="thread.html?${result[i].id}">
                                <h4 class="title">
                                    ${result[i].titre}
                                </h4>
                                <div class="bottom">
                                    <p class="date">
                                        ${resultt[0].nom} - ${new Date(parseInt(result[i].date)).toLocaleString()}
                                    </p>
                                    <p class="ncomment">
                                        ${JSON.parse(result[i].comment).length} commentaires
                                    </p>
                                </div>
                            </a>
                        </div>
                        `
                        if (i == 0) {
                            var data = {html: html}
                            res.json(data)
                        }
                    })
                }
            }
        }
    })
})

app.post('/gen_thread', (req, res) => {
    var commentHtml = ''
    let sql = 'SELECT * FROM posts WHERE id = ?'
    let query = db.query(sql, [req.body.id], (err, result) => {
        if (err) throw err
        let sqll = 'SELECT * FROM users WHERE id = ?'
        let queryy = db.query(sqll, [result[0].auteur], (errr, resultt) => {
            if (errr) throw errr
            let headerHtml = `
                <h4 class="titre">
                    ${result[0].titre}
                </h4>
                <p class="desc">
                    ${result[0].contenu.replace(/(\r\n|\r|\n)/g, '<br>')}
                </p>
                <div class="infos">
                    <p class="auteur">
                        par ${resultt[0].nom}
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
            if (result[0].comment == '[]' || JSON.parse(result[0].comment) == undefined) {
                var data = {
                    headerHtml: headerHtml,
                    commentHtml: ''
                }
                res.json(data)
            } else {
                for (const comment of JSON.parse(result[0].comment)) {
                    var listComment = JSON.parse(result[0].comment)
                    let sqlll = 'SELECT * FROM users WHERE id = ?'
                    let queryyy = db.query(sqlll, [comment.auteur], (errrr, resulttt) => {
                        if (errrr) throw errrr
                        console.log(resulttt)
                        commentHtml = commentHtml + `
                            <div class="comment">
                                <div class="top-comment">
                                    <p class="user">
                                        ${resulttt[0].nom}
                                    </p>
                                    <p>-</p>
                                    <p class="comment-ts">
                                        ${new Date(comment.date).toLocaleString()}
                                    </p>
                                </div>
                                <div class="comment-contenu">
                                    ${comment.contenu.replace(/(\r\n|\r|\n)/g, '<br>')}
                                </div>
                            </div>
                        `
                        if (comment.date == listComment[listComment.length - 1].date && comment.auteur == listComment[listComment.length - 1].auteur) {
                            var data = {
                                headerHtml: headerHtml,
                                commentHtml: commentHtml
                            }
                            res.json(data)
                        }
                    })
                }
            }
        })
    })
})

app.post('/nouv_comment', (req, res) => {
    var s_comments = []
    var auteur = ''
    jwt.verify(req.body.accessToken, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
        if (err) {
            console.log(err)
        } else {
            auteur = user.id
            let sql = 'SELECT * FROM posts WHERE id = ?'
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
                    let queryy = db.query(sqll, [s_comments, req.body.id], (err, resultt) => {
                        if (err) {
                            console.log('err')
                        } else {
                            let sqlll = 'SELECT * FROM users WHERE id = ?'
                            let queryyy = db.query(sqlll, [auteur], (errr, resulttt) => {
                                const transporter = nodemailer.createTransport({
                                    service: 'gmail',
                                    auth: {
                                        user: 'forumnsi@gmail.com',
                                        pass: process.env.MDP_MAIL
                                    }
                                })
                                const mailOptions = {
                                    from: 'forumnsi@gmail.com',
                                    to: resulttt[0].mail,
                                    subject: `Nouveau Commentaire sur ${result[0].titre}`,
                                    text: `${resulttt[0].nom} a commenté:\n ${req.body.contenu}`
                                }
                                transporter.sendMail(mailOptions, (error, info) => {
                                    if (err) {
                                        console.log('Erreur Mail')
                                    }
                                    else {
                                        console.log('Mail envoyé')
                                    }
                                })
                                console.log(resultt)
                                res.json({status: 'succes'})
                            })
                        }
                    })
                }
            })  
        }
    })
})

app.post('/feedback', (req, res) => {
    if (req.body.accessToken == null) {
        var data = {
            status: 'erreur',
            erreur: 'Vous devez vous connecter.'
        }
        res.json(data)
    } else {
        jwt.verify(req.body.accessToken, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
            if (err) throw err
            let sql = 'SELECT * FROM users WHERE id = ?'
            let query = db.query(sql, [user.id], (err, result) => {
                const transporter = nodemailer.createTransport({
                    service: 'gmail',
                    auth: {
                        user: 'forumnsi@gmail.com',
                        pass: process.env.MDP_MAIL
                    }
                })
                const mailOptions = {
                    from: result[0].mail,
                    to: 'forumnsi@gmail.com',
                    subject: `Feedback: ${req.body.titre}`,
                    text: `${req.body.msg}\n de ${result[0].nom} - ${result[0].mail}`
                }
                transporter.sendMail(mailOptions, (error, info) => {
                    if (error) {
                        var data = {
                            status: 'erreur',
                            erreur: 'Une erreur s\'est produite'
                        }
                        res.json(data)
                    } else {
                        var data = {
                            status: 'succes',
                            succes: 'Email envoyé!'
                        }
                        res.json(data)
                    }
                })
            })
        })
    }
})

app.post('/compte', (req, res) => {
    if (req.body.accessToken == null) {
        var data = {
            status: 'erreur',
            erreur: 'Vous devez vous connecter'
        }
        res.json(data)
    } else {
        jwt.verify(req.body.accessToken, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
            if (err) throw err
            let sql = 'SELECT * FROM users WHERE id = ?'
            let query = db.query(sql, [user.id], (err, result) => {
                if (err) throw err
                var data = {
                    status: 'succes',
                    nom: result[0].nom,
                    mail: result[0].email
                }
                res.json(data)
            })
        })
    }
})

app.post('/modifnom', (req, res) => {
    if (req.body.accessToken == null) {
        var data = {
            status: 'erreur',
            erreur: 'Vous devez vous connecter.'
        }
        res.json(data)
    } else {
        jwt.verify(req.body.accessToken, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
            if (err) throw err
            let sql = 'SELECT * FROM users WHERE id = ?'
            let query = db.query(sql, [user.id], async (err, result) => {
                if (!await bcrypt.compare(req.body.mdp, result[0].mdp)) {
                    var data = {
                        status: 'erreur',
                        erreur: 'Mot de passe incorrect'
                    }
                    res.json(data)
                } else if (result[0].nom == req.body.modifnom) {
                    var data = {
                        status: 'erreur',
                        erreur: 'Ceci est déjà votre nom.'
                    }
                    res.json(data)
                } else {
                    let sqll = 'UPDATE users SET nom = ? WHERE id = ?'
                    let queryy = db.query(sqll, [req.body.modifnom, user.id], (errr, resultt) => {
                        if (errr) throw errr
                        const user = {
                            id: result[0].id
                        }
                        const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET) // Créé un token d'utilisateur
                        var data = {
                            status: 'succes',
                            succes: 'Votre nom a été modifié',
                            accessToken: accessToken
                        }
                        res.json(data)
                    })
                }
            })
        })
    }
})

app.post('/modifmail', (req, res) => {
    if (req.body.accessToken == null) {
        var data = {
            status: 'erreur',
            erreur: 'Vous devez vous connecter.'
        }
        res.json(data)
    } else {
        jwt.verify(req.body.accessToken, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
            if (err) throw err
            let sql = 'SELECT * FROM users WHERE id = ?'
            let query = db.query(sql, [user.id], async (err, result) => {
                if (!await bcrypt.compare(req.body.mdp, result[0].mdp)) {
                    var data = {
                        status: 'erreur',
                        erreur: 'Mot de passe incorrect'
                    }
                    res.json(data)
                } else if (result[0].mail == req.body.modifmail) {
                    var data = {
                        status: 'erreur',
                        erreur: 'Ceci est déjà votre mail.'
                    }
                    res.json(data)
                } else {
                    db.query('SELECT email FROM users WHERE email = ?', [req.body.modifmail], async (errrr, resulttt) => { // Vérifie si l'adresse mail écrit est déjà utilisé dans la database
                        if (err) throw err;
                        if (resulttt[0]) {
                            var data = {
                                status: 'erreur',
                                erreur: 'Cet email est déjà utilisé.'
                            }
                            res.json(data);
                        } else {
                            let sqll = 'UPDATE users SET email = ? WHERE id = ?'
                            let queryy = db.query(sqll, [req.body.modifmail, user.id], (errr, resultt) => {
                                if (errr) throw errr
                                const user = {
                                    id: result[0].id
                                }
                                const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET) // Créé un token d'utilisateur
                                var data = {
                                    status: 'succes',
                                    succes: 'Votre mail a été modifié',
                                    accessToken: accessToken
                                }
                                res.json(data)
                            })
                        }
                    })
                }
            })
        })
    }
})

app.post('/modifmdp', (req, res) => {
    if (req.body.accessToken == null) {
        var data = {
            status: 'erreur',
            erreur: 'Vous devez vous connecter.'
        }
        res.json(data)
    } else {
        jwt.verify(req.body.accessToken, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
            if (err) throw err
            let sql = 'SELECT * FROM users WHERE id = ?'
            let query = db.query(sql, [user.id], async (err, result) => {
                if (!await bcrypt.compare(req.body.mdp, result[0].mdp)) {
                    var data = {
                        status: 'erreur',
                        erreur: 'Mot de passe incorrect'
                    }
                    res.json(data)
                } else if (await bcrypt.compare(req.body.modifmdp, result[0].mdp)) {
                    var data = {
                        status: 'erreur',
                        erreur: 'Ceci est déjà votre mot de passe.'
                    }
                    res.json(data)
                } else if (req.body.modifmdp != req.body.modifmdpconfirm) {
                    var data = {
                        status: 'erreur',
                        erreur: 'Veuillez entrer le même mot de passe 2 fois.'
                    }
                    res.json(data)
                } else if (req.body.modifmdp.length < 8) {
                    var data = {
                        status: 'erreur',
                        erreur: 'Le mot de passe doit contenir au moins 8 caractères.'
                    }
                    res.json(data)
                } else {
                    const mdphash = await bcrypt.hash(req.body.modifmdp, 8)
                    let sqll = 'UPDATE users SET mdp = ? WHERE id = ?'
                    let queryy = db.query(sqll, [mdphash, user.id], (errr, resultt) => {
                        if (errr) throw errr
                        console.log(resultt)
                        var data = {
                            status: 'succes',
                            succes: 'Votre mot de passe a été modifié',
                        }
                        res.json(data)
                    })
                }
            })
        })
    }
})

app.listen(3000, () => console.log('Lancé sur le port 3000'));
