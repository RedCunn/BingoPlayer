const AUDIOPATH = "C:\\Users\\cunns\\dev\\BingoPlayerch\\audio\\"

const getSong = async () => {

    fetch('http://localhost:3000/api/song', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Error en la solicitud');
            }
            return response.json();
        })
        .then(song => {

            console.log('Datos recibidos:', song);

            const playlistContainer = document.getElementById('playlist');
            playlistContainer.innerHTML = '';
            const songElement = document.createElement('div');
            songElement.textContent = `${song.title}`;

            playlistContainer.appendChild(songElement);

            play(AUDIOPATH+song.title)

            return song;
        })
        .catch(error => {
            console.error('Error al cargar la lista de canciones:', error);
            return null;
        });

};

const delay = (s) => {
    return new Promise(resolve => setTimeout(resolve, s * 1000));
}

const play = (path) => {
    var audio = new Audio(path);
    audio.play();
}

const playerButton = document.querySelector('.player');

document.addEventListener('DOMContentLoaded', () => {

    const playerButton = document.querySelector('.player');


    playerButton.addEventListener('click', () => {

        getSong();
        
        
    });
});
