var defaultThreads = [
    {
        id: 1,
        titre: "Thread 1",
        auteur: "Aaron",
        date: Date.now(),
        desc: "Thread super intéressant",
        comments: [
            {
                auteur: "Jack",
                date: Date.now(),
                contenu: "Je suis d'accord"
            },
            {
                auteur: "Arthur",
                date: Date.now(),
                contenu: "Moi aussi"
            }
        ]
    },
    {
        id: 2,
        titre: "Thread 2",
        auteur: "Aaron",
        date: Date.now(),
        desc: "Un truc incroyable",
        comments: [
            {
                auteur: "Jack",
                date: Date.now(),
                contenu: "Bonjour"
            },
            {
                auteur: "Arthur",
                date: Date.now(),
                contenu: "Non"
            }
        ]
    },
    {
        id: 3,
        titre: "Thread avec un titre HYPER long",
        auteur: "Aaron",
        date: Date.now(),
        desc: "Bon titre?",
        comments: [
            {
                auteur: "Jack",
                date: Date.now(),
                contenu: "Oui"
            },
            {
                auteur: "Arthur",
                date: Date.now(),
                contenu: "Non t nul"
            }
        ]
    }
]

var threads = defaultThreads
if (localStorage && localStorage.getItem('threads')) {
    threads = JSON.parse(localStorage.getItem('threads'));
} else {
    threads = defaultThreads;
    localStorage.setItem('threads', JSON.stringify(defaultThreads));
}

function create_threads() {
    console.log(threads);
    var container = document.getElementById('threads')
    for (let thread of threads) {
        var html = `
        <div class="row">
            <a href="thread.html?${thread.id}">
                <h4 class="title">
                    ${thread.titre}
                </h4>
                <div class="bottom">
                    <p class="date">
                        ${new Date(thread.date).toLocaleString()}
                    </p>
                    <p class="ncomment">
                        ${thread.comments.length} commentaires
                    </p>
                </div>
            </a>
        </div>
        `
        container.insertAdjacentHTML('beforeend', html);
    }
}

var root = document.querySelector(':root');

if (localStorage.getItem("modeSombreActive") == "true") {
    var modeSombreActive = true;
    root.style.setProperty('--couleur-principale', '#303030');
    root.style.setProperty('--couleur-max', '#000000')
    root.style.setProperty('--couleur-oppose-principale', '#ffffff');
    root.style.setProperty('--couleur-tertiaire', '#202020');
    root.style.setProperty('--couleur-quaternaire', '#282828');
    root.style.setProperty('--couleur-oppose-secondaire', '#aaaaaa');
}
if (localStorage.getItem("modeSombreActive") == "false") {
    var modeSombreActive = false;
    root.style.setProperty('--couleur-principale', '#eeeeee');
    root.style.setProperty('--couleur-max', '#ffffff');
    root.style.setProperty('--couleur-oppose-principale', '#000000');
    root.style.setProperty('--couleur-tertiaire', '#ffffff');
    root.style.setProperty('--couleur-oppose-secondaire', '#5e5e5e');
    root.style.setProperty('--couleur-quaternaire', '#ffffff');
}
else {
    localStorage.setItem("modeSombreActive", "true");
    var modeSombreActive = true;
}

if (localStorage.getItem('accessToken') == null) {
    document.getElementById('login-btn').style.display = 'block'
} else {
    document.getElementById('login-btn').style.display = 'none'
}


function modeSombre() {
    if (modeSombreActive) {
        root.style.setProperty('--couleur-principale', '#eeeeee');
        root.style.setProperty('--couleur-max', '#ffffff')
        root.style.setProperty('--couleur-oppose-principale', '#000000');
        root.style.setProperty('--couleur-tertiaire', '#ffffff');
        root.style.setProperty('--couleur-quaternaire', '#ffffff');
        root.style.setProperty('--couleur-oppose-secondaire', '#5e5e5e');    
        document.getElementById('modeSombre').innerHTML = "Mode Clair";
        modeSombreActive = false
        localStorage.setItem("modeSombreActive", "false");
    }
    else {
        root.style.setProperty('--couleur-principale', '#303030');
        root.style.setProperty('--couleur-max', '#000000')
        root.style.setProperty('--couleur-oppose-principale', '#ffffff');
        root.style.setProperty('--couleur-tertiaire', '#202020');
        root.style.setProperty('--couleur-quaternaire', '#282828');
        root.style.setProperty('--couleur-oppose-secondaire', '#aaaaaa');    
        document.getElementById('modeSombre').innerHTML = "Mode Sombre";
        modeSombreActive = true
        localStorage.setItem("modeSombreActive", "true");
    }
};

function nouveauThread() {
    const data = {accessToken: localStorage.getItem('accessToken')};
    const queryParams = new URLSearchParams(data).toString();
    const url = `/nouveau_thread?${queryParams}`;
    fetch(url)
        .then(response => response.json())
        .then(data => {
            if (data.status == 'succes') {
                window.location.replace('nouveau_thread.html')
            }
            else {
                // document.getElementById('n-thread').innerText = 'Veuillez vous connecter'
                window.location.replace('/login')
            }
        })
        .catch(error => {
            console.error(error)
        })
}
