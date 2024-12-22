
export const calling = {

    getToken: async () => {

        fetch('http://192.168.0.163:8080/token', {
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
            .then(data => {

                return data.token;
            })
            .catch(error => {
                console.error('Error al cargar la lista de canciones:', error);
                return null;
            });

    },
    getTrack: async () => {
        fetch('http://192.168.0.163:8080/song', {
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

                return song;
            })
            .catch(error => {
                console.error('Error al cargar la lista de canciones:', error);
                return null;
            });
    },
    getDevices: async (accessToken) => {
        try {
            const response = await fetch('https://api.spotify.com/v1/me/player/devices', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${accessToken}`
                }
            });
            const data = await response.json();
            if (data.devices && data.devices.length > 0) {
                console.log('Dispositivos disponibles:', data.devices);
                return data.devices;
            } else {
                console.error('No hay dispositivos disponibles.');
                return [];
            }
        } catch (error) {
            console.error('Error al obtener los dispositivos:', error);
            return [];
        }
    },
    activateDevice: async (accessToken, deviceId) => {
        try {
            const response = await fetch(`https://api.spotify.com/v1/me/player`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    device_ids: [deviceId]
                })
            });
            if (response.ok) {
                console.log('Dispositivo activado correctamente');
            } else {
                console.error('Error al activar el dispositivo');
            }
        } catch (error) {
            console.error('Error al activar el dispositivo:', error);
        }
    },
    playTrack: async (player, trackId, accessToken) => {

        if (!player) {
            console.error('El reproductor no está listo');
            return;
        }

        player._options.getOAuthToken(accessToken => {
            fetch(`https://api.spotify.com/v1/me/player/play`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    uris: [`spotify:track:${trackId}`]
                })
            }).then(() => {
                console.log('Canción reproducida correctamente');
            }).catch(error => {
                console.error('Error al reproducir la canción:', error);
            });
        });
    }

}

