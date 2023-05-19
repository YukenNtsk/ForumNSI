const form = document.getElementById('register')
const erreur = document.getElementById('erreur')
const succes = document.getElementById('succes')
form.addEventListener('submit', (event) => {
    event.preventDefault()

    const formData = new FormData(form)
    fetch("/register", {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(Object.fromEntries(formData))
    })
        .then(response => response.json())
        .then(data => {
            if(data.status == "erreur"){
                succes.style.display = "none"
                erreur.style.display = "block"
                erreur.innerText = data.erreur
            } else {
                succes.style.display = "block"
                erreur.style.display = "none"
                succes.innerText = data.succes
            }
        })
        .catch(error => {
            console.error(error)
        })
})