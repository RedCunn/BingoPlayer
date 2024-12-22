import { calling } from './utils/funk.js';


let accessToken = "";
let trackId = "";
let playerInstance = null;

const clientId = '8ca5ea40a1924a26bfab32d5806ee9e6';
const redirectUri = 'http://localhost:5500/BingoPlayer/BingoPlayer/hello.html';
const scopes = [
    'user-modify-playback-state',
    'user-read-playback-state',
    'streaming'
].join('%20');


const authUrl = `https://accounts.spotify.com/authorize?` +
    `client_id=${clientId}&response_type=code&redirect_uri=${encodeURIComponent(redirectUri)}` +
    `&scope=${scopes}`;

function authorizeSpotify() {
    window.location.href = authUrl;
}

function getCodeFromUrl() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('code');
}

function fetchAccessToken(code) {
    return fetch('http://192.168.0.163:8080/auth-code', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code: code })
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Error en la solicitud');
            }
            return response.json();
        }
        )
        .then(data => {
            console.log('Datos recibidos:', data);
            accessToken = data['accessToken'];
        })
        .catch(error => {
            console.error('Error al obtener el token:', error);
            throw error;
        });
}

function handleAuthorization() {
    const code = getCodeFromUrl();

    if (code) {
        fetchAccessToken(code)
            .then(data => {
                console.log('Access Token:', data.accessToken);
                accessToken = data.accessToken;
               
                const devices = calling.getDevices(accessToken);
                console.log("DEVICES : ", devices);
    
                calling.activateDevice(accessToken , devices[0]);

                const track = calling.getTrack();

                calling.playTrack(playerInstance , track.trackId, accessToken );
            })
            .catch(error => {
                console.error('Error al obtener el token:', error);
            });
    } else {
        console.error('No se encontró el código en la URL.');
    }
}


if (!getCodeFromUrl()) {
    authorizeSpotify();
} else {
    handleAuthorization();
}

window.onSpotifyWebPlaybackSDKReady = () => {
    console.log('Spotify SDK listo');

    // Crear el reproductor
    const player = new Spotify.Player({
        name: 'Mi Bingo Musical',
        getOAuthToken: cb => { cb(accessToken); },
        volume: 0.5
    });

    // Manejo de eventos de errores
    player.on('initialization_error', e => { console.error(e); });
    player.on('authentication_error', e => { console.error(e); });
    player.on('account_error', e => { console.error(e); });
    player.on('playback_error', e => { console.error(e); });

    // Escuchar los cambios de estado del reproductor
    player.on('player_state_changed', state => {
        console.log('Estado del reproductor:', state);
    });

    // Conectar el reproductor
    player.connect().then(success => {
        if (success) {
            console.log('Reproductor de Spotify conectado');
            playerInstance = player; // Guardar la instancia del reproductor para usarla después
        } else {
            console.error('No se pudo conectar al reproductor');
        }
    });
};

document.addEventListener('DOMContentLoaded', () => {
    const playerButton = document.querySelector('.player');

    playerButton.addEventListener('click', () => {
        if (playerInstance) {
            calling.playTrack(playerInstance, trackId, accessToken);
        } else {
            console.error('El reproductor aún no está listo');
        }
    });
});



