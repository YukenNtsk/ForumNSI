const form = document.getElementById('nthread');
form.addEventListener('submit', (event) => {

    event.preventDefault()

    console.log('yess')

    const formData = new FormData(form)
    var bodyString = JSON.stringify(Object.fromEntries(formData))
    var bodyObject = JSON.parse(bodyString)
    bodyObject.accessToken = localStorage.getItem('accessToken')
    var body = JSON.stringify(bodyObject)
    console.log(body)

    fetch("/nthread", {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: body
    })
        .then(response => response.json())
        .then(data => {
            if(data.status == "erreur"){
                console.log('erreur')
            } else {
                console.log('yeyeye')
                window.location.replace(`thread.html?${data.id}`)
            }
        })
        .catch(error => {
            console.error(error)
        })
})