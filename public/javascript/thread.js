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


// function addComment(comment) {
//     var commentHtml = `
//         <div class="comment">
//             <div class="top-comment">
//                 <p class="user">
//                     ${comment.auteur}
//                 </p>
//                 <p>-</p>
//                 <p class="comment-ts">
//                     ${new Date(comment.date).toLocaleString()}
//                 </p>
//             </div>
//             <div class="comment-contenu">
//                 ${comment.contenu}
//             </div>
//         </div>
//     `
// }

// for (let comment of thread.comments) {
//     addComment(comment);
// }

var btn = document.getElementById('nouvcomment')
btn.addEventListener('click', function () {
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

    // var txt = document.getElementById('comment');
    // var comment = {
    //     contenu: txt.value,
    //     date: Date.now(),
    //     auteur: 'Aaron' // TODO Mettre le nom de l'utilisateur
    // }
    // addComment(comment);
    // txt.value = '';
    // thread.comments.push(comment);
    // localStorage.setItem('threads', JSON.stringify(threads));
})