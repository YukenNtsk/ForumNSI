const form = document.getElementById('nthread');
form.addEventListener('submit', (event) => {

    event.preventDefault()

    console.log('yess')

    const formData = new FormData(form) // Récupère les données inscrites dans le form
    var bodyString = JSON.stringify(Object.fromEntries(formData))
    var bodyObject = JSON.parse(bodyString)
    bodyObject.accessToken = localStorage.getItem('accessToken') // Ajoute le token de l'utilisateur aux données envoyées dans le form
    var body = JSON.stringify(bodyObject)
    console.log(body)

    fetch("/nthread", {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: body
    }) // Envoie les données au backend
        .then(response => response.json()) // reçois les données du backend
        .then(data => {
            if(data.status == "erreur"){
                console.log('erreur')
            } else {
                window.location.replace(`thread.html?${data.id}`) // Dirige vers le post créé
            }
        })
        .catch(error => {
            console.error(error)
        })
})