const form = document.getElementById('register')
const erreur = document.getElementById('erreur')
const succes = document.getElementById('succes')
form.addEventListener('submit', (event) => {
    event.preventDefault()

    formData = new FormData(form) // Récupère les données inscrites dans le form
    fetch("/register", {
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
                document.getElementById('partie1').style.display = "none"
                document.getElementById('partie2').style.display = "block"
                verifnum = data.verifnum;
            }
        })
        .catch(error => {
            console.error(error)
        })
})

function prochainInput(nextInput) {
    const input = document.querySelector(`.num:nth-child(${nextInput})`);

    if (input && input.value.length === input.maxLength) {
      input.nextElementSibling && input.nextElementSibling.focus();
    }
}

const form2 = document.getElementById('verifnum')
form2.addEventListener('submit', (event) => {
    event.preventDefault()
    const inputs = document.querySelectorAll('input');
    let code = '';

    // Concatenate the input values into a 2FA code
    inputs.forEach(input => code += input.value);
    if (code != verifnum) {
        succes.style.display = "none"
        erreur.style.display = "block"
        erreur.innerText = data.erreur // Affiche le message d'erreur sur la page
    } else {
        fetch("/register", {
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
                    erreur.style.display = "none"
                    succes.style.display = "block"
                    succes.innerText = data.succes
                }
            })
            .catch(error => {
                console.error(error)
            })
    }
})