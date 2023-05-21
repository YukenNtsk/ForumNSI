window.addEventListener('scroll', (err) => {
    const elementZoom = document.querySelectorAll('.zoom');
    const bg = document.querySelector('.svg-bg');

    var scroll = window.scrollY;
    var zoom = 1 + scroll/100;
    var opacite = 1 - scroll/300;
    
    if(scroll < 350) {
        for(let i = 0; i < elementZoom.length; i++) {
            elementZoom[i].style.transform = `translateY(${scroll}px) scale(${zoom})`;
            elementZoom[i].style.opacity = opacite;
        }
    }


    if (scroll == 300) {
        for(let i = 0; i < elementZoom.length; i++) {
            elementZoom[i].style.display = 'none'
        }
        bg.style.display = 'none'
    } else {
        for(let i = 0; i < elementZoom.length; i++) {
            elementZoom[i].style.display = 'block'
        }
        bg.style.display = 'block'
    }

    bg.style.transform = `scale(${zoom})`

    const elementGauche = document.querySelectorAll('.slide-gauche');
    const section2 = document.querySelector('.sec2')
    var gauche = -75 + scroll/10
    if (scroll <= 750) {
        for (let i=0; i < elementGauche.length; i++) {
            elementGauche[i].style.transform = `translateX(${gauche}vw)` // translateY(${scroll}px))`
        }
    }

    const elementDroite = document.querySelectorAll('.slide-droite');
    var droite = 75 - scroll/20
    if (scroll <= 1482) {
        for (let i = 0; i < elementDroite.length; i++) {
            elementDroite[i].style.transform = `translateX(${droite}vw)`
        }
    }

});