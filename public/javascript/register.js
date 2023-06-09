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

var inputs = document.querySelectorAll('.verifnum input');

inputs.forEach(function(input, index) {
  input.addEventListener('keyup', function() {
    if (input.value.length === input.maxLength) {
      if (index + 1 < inputs.length) {
        inputs[index + 1].focus();
      }
    }
  });

  input.addEventListener('keydown', function(event) {
    if (event.key === 'Backspace' && input.value.length === 0) {
      if (index - 1 >= 0) {
        inputs[index - 1].value = ''
        inputs[index - 1].focus();
      }
    }
  });
});

const form2 = document.getElementById('verifnum')
form2.addEventListener('submit', (event) => {
    event.preventDefault()
    const inputs = document.querySelectorAll('.num');
    let code = '';

    // Concatenate the input values into a 2FA code
    inputs.forEach(input => code += input.value);
    if (code != verifnum) {
        succes.style.display = "none"
        erreur.style.display = "block"
        erreur.innerText = "Code incorrect." // Affiche le message d'erreur sur la page
    } else {
        fetch("/nouv_compte", {
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
                    window.location.replace('login.html')
                }
            })
            .catch(error => {
                console.error(error)
            })
    }
})