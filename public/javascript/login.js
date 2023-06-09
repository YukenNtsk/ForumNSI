const form = document.getElementById('login')
const erreur = document.getElementById('erreur')
const succes = document.getElementById('succes')
form.addEventListener('submit', (event) => {
    event.preventDefault()

    const formData = new FormData(form) // Récupère les données inscrites dans le form

    fetch("/login", {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(Object.fromEntries(formData))
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
                window.location.replace('/') // Retourne à la page principale
            }
        })
        .catch(error => {
            console.error(error)
        })
})