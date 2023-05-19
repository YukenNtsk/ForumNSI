const form = document.getElementById('login')
const erreur = document.getElementById('erreur')
const succes = document.getElementById('succes')
form.addEventListener('submit', (event) => {
    event.preventDefault()

    const formData = new FormData(form)

    console.log('aaaaa')
    fetch("/login", {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(Object.fromEntries(formData))
    })
        .then(response => response.json())
        .then(data => {
            console.log(data.accessToken)
            if(data.status == "erreur"){
                succes.style.display = "none"
                erreur.style.display = "block"
                erreur.innerText = data.erreur
            } else {
                succes.style.display = "block"
                erreur.style.display = "none"
                succes.innerText = data.succes
                localStorage.setItem('accessToken', data.accessToken);
                window.location.replace('/')
            }
        })
        .catch(error => {
            console.error(error)
        })
})