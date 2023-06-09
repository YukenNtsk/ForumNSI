const form = document.getElementById('feedback-form')
const erreur = document.getElementById('erreur')
const succes = document.getElementById('succes')

form.addEventListener('submit', (event) => {
    event.preventDefault()

    const formData = Object.fromEntries(new FormData(form)) // Récupère les données inscrites dans le form
    formData['accessToken'] = localStorage.getItem('accessToken')
    console.log(formData)
    fetch("/feedback", {
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
                succes.innerText = data.succes // Affiche le message de succès
            }
        })
        .catch(error => {
            console.error(error)
        })
})