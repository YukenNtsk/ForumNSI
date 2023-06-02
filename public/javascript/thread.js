var id = window.location.search.slice(1);

var body = {id: id}

fetch('/gen_thread', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
}) // Envoie les données au backend
    .then(response => response.json()) // reçois les données du backend
    .then(data => {
        var header = document.querySelector('.header');
        header.insertAdjacentHTML('beforeend', data.headerHtml)
        var comments = document.querySelector('.comments');
        comments.insertAdjacentHTML('beforeend', data.commentHtml);
})


var btn = document.getElementById('nouvcomment')
btn.addEventListener('click', function () {
    if (document.getElementById('comment').value === null || document.getElementById('comment').value === undefined) {
        return
    } else {
        var id = window.location.search.slice(1);
        var body = {
            accessToken: localStorage.getItem('accessToken'),
            contenu: document.getElementById('comment').value,
            id: id
        }
        fetch('/nouv_comment', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(body)
        }) // Envoie les données au backend
            .then(response => response.json()) // reçois les données du backend
            .then(data => {
                window.location.reload()
        })
    }
})



tinymce.init({
    selector: "#comment",
    plugins: "emoticons autoresize",
    toolbar: "emoticons",
    toolbar_location: "bottom",
    menubar: false,
    statusbar: false
});
  
  