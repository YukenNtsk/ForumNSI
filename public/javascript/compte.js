const data = {
    accessToken: localStorage.getItem('accessToken')
}

fetch("/compte", {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
}) // Envoie les données au backend
    .then(response => response.json()) // reçois les données du backend
    .then(data => {
        if (data.status == 'erreur') {
            if (data.erreur == 'Mauvais Token') {
                localstorage.removeItem('accessToken')
            }
            window.location.replace('/login')
        } else {
            var html = `
            <div class="nom">
                <h4>${data.nom}</h4>
                <button id="changenom" onclick="changenom()">Modifier</button>
            </div>
            <div class="mail">
                <h4>${data.mail}</h4>
                <button id="changemail" onclick="changemail()">Modifier</button>
            </div>
            <div class="mdp">
                <h4>Mot de passe</h4>
                <button id="changemdp" onclick="changemdp()">Modifier</button>
            </div>
            <div class="deco">
                <button id="deco" onclick="deconnection()">Se déconnecter</button>
            </div>
            `
            document.querySelector('.tout').insertAdjacentHTML('beforeend', html)
        }
    })


const succes = document.getElementById('succes')
const erreur = document.getElementById('erreur')

function changenom() {
    document.getElementById('tout').style.display = 'none'
    document.getElementById('modifnom').style.display = 'block'
}

function changemail() {
    document.getElementById('tout').style.display = 'none'
    document.getElementById('modifmail').style.display = 'block'
}

function changemdp() {
    document.getElementById('tout').style.display = 'none'
    document.getElementById('modifmdp').style.display = 'block'
}

function deconnection() {
    localStorage.removeItem('accessToken')
    console.log('déconnecté')
    window.location.replace('/')
}


const formNom = document.getElementById('modifnomform')
formNom.addEventListener('submit', (event) => {
    event.preventDefault()

    const formData = Object.fromEntries(new FormData(formNom)) // Récupère les données inscrites dans le form
    const accessToken = localStorage.getItem('accessToken')
    formData['accessToken'] = accessToken

    fetch("/modifnom", {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
    }) // Envoie les données au backend
        .then(response => response.json()) // reçois les données du backend
        .then(data => {
            if(data.status == "erreur"){
                succes.style.display = "none"
                erreur.style.display = "block"
                erreur.innerText = data.erreur // Affiche le message d'erreur sur la page
            } else {
                succes.style.display = "block"
                erreur.style.display = "none"
                succes.innerText = data.succes // Affiche le message de succès sur la page
                localStorage.setItem('accessToken', data.accessToken); // mets le token créé dans le stockage local
                setTimeout(window.location.replace('compte.html'), 2000)
            }
        })
})

const formMail = document.getElementById('modifmailform')
formMail.addEventListener('submit', (event) => {
    event.preventDefault()

    const formData = Object.fromEntries(new FormData(formMail)) // Récupère les données inscrites dans le form
    const accessToken = localStorage.getItem('accessToken')
    formData['accessToken'] = accessToken

    fetch("/modifmail", {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
    }) // Envoie les données au backend
        .then(response => response.json()) // reçois les données du backend
        .then(data => {
            if(data.status == "erreur"){
                succes.style.display = "none"
                erreur.style.display = "block"
                erreur.innerText = data.erreur // Affiche le message d'erreur sur la page
            } else {
                succes.style.display = "block"
                erreur.style.display = "none"
                succes.innerText = data.succes // Affiche le message de succès sur la page
                localStorage.setItem('accessToken', data.accessToken); // mets le token créé dans le stockage local
                setTimeout(window.location.replace('compte.html'), 2000)
            }
        })
})

const formMdp = document.getElementById('modifmdpform')
formMdp.addEventListener('submit', (event) => {
    event.preventDefault()

    const formData = Object.fromEntries(new FormData(formMdp)) // Récupère les données inscrites dans le form
    const accessToken = localStorage.getItem('accessToken')
    formData['accessToken'] = accessToken

    fetch("/modifmdp", {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
    }) // Envoie les données au backend
        .then(response => response.json()) // reçois les données du backend
        .then(data => {
            if(data.status == "erreur"){
                succes.style.display = "none"
                erreur.style.display = "block"
                erreur.innerText = data.erreur // Affiche le message d'erreur sur la page
            } else {
                succes.style.display = "block"
                erreur.style.display = "none"
                succes.innerText = data.succes // Affiche le message de succès sur la page
                setTimeout(window.location.replace('compte.html'), 2000)
            }
        })
})
