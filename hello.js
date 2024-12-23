import { calling } from './utils/funk.js';
import { browser } from './utils/browser.js';

let accessToken = "";
let expiration = "";
let deviceId = "";
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
        .then(data => data.json())
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
                expiration = data.expirationDate;

                browser.setCookie("auth" , accessToken , new Date(expiration));
            })
            .catch(error => {
                console.error('Error al obtener el token:', error);
            });
    } else {
        console.error('No se encontró el código en la URL.');
    }
}

const activateDevice = async () => {
    try {
        const devices = await calling.getDevices(browser.eatCookie("auth"));
        deviceId = devices[0].id;
        console.log("DEVICE ID : ", deviceId)
        await calling.activateDevice(browser.eatCookie("auth"), deviceId);
    } catch (error) {
        console.log('Error activating device', error);
    }
}


if (!getCodeFromUrl()) {
    authorizeSpotify();
}

if (browser.eatCookie("auth") === "") {
    handleAuthorization();
} 


window.onSpotifyWebPlaybackSDKReady = () => {
    console.log('Spotify SDK listo');

    // Crear el reproductor
    const player = new Spotify.Player({
        name: 'Mi Bingo Musical',
        getOAuthToken: cb => { cb(browser.eatCookie("auth")); },
        volume: 1
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

activateDevice();


document.addEventListener('DOMContentLoaded', () => {
    
    const roundHeading = document.querySelector('#round'); 
    const coverImage = document.querySelector('#coverimg');
    const playerButton = document.querySelector('.player');
    const cover = document.querySelector('.cover');
    const revealButton = document.querySelector('#revealButton');

    playerButton.addEventListener('click', async () => {
        if (playerInstance) {
            const track = await calling.getTrack();
            console.log("Track desde calling: " + track);

            if(track.round > 0){
                coverImage.style.display = 'none';
                revealButton.style.display = 'block';
                roundHeading.textContent = "Ronda 💃 " + (track.round + 1 );
                coverImage.src = track.imageUrl;
            }

            await calling.playTrack(deviceId, track, browser.eatCookie("auth"));


            setTimeout(async () => {
                await calling.pauseTrack(deviceId, browser.eatCookie("auth"));
            }, 10000); 

        } else {
            console.error('El reproductor aún no está listo');
        }
    });

    revealButton.addEventListener('click', () => {
        coverImage.classList.remove('hidden');
        coverImage.style.display = 'block';
        revealButton.style.display = 'none';
    });
});