
export const calling = {

    getToken: async () => {
        try {
            const response = await fetch('http://192.168.0.163:8080/token', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Error en la solicitud');
            }

            const data = await response.json();
            return data.token;
        } catch (error) {
            console.error('Error al cargar la lista de canciones:', error);
            return null;
        }

    },
    getTrack: async () => {
        try {
            const response = await fetch('http://192.168.0.163:8080/song', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Error en la solicitud');
            }

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error al cargar la lista de canciones:', error);
            return null;
        }
    },
    getDevices: async (accessToken) => {
        try {
            const response = await fetch('https://api.spotify.com/v1/me/player/devices', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${accessToken}`
                }
            });

            if (!response.ok) {
                throw new Error('Error en la solicitud');
            }

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
    playTrack: async (deviceId, track, accessToken) => {
        console.log("Track " + track);
        try {
            const response = await fetch(`https://api.spotify.com/v1/me/player/play?device_id=${deviceId}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    uris: [track.trackId],
                    position_ms: track.startAt
                })
            });

            if (response.ok) {
                console.log('Reproduciendo pista.');
            } else {
                console.error('Error al reproducir pista.');
            }

        } catch (error) {
            console.error('Error al reproducir pista', error);
        }

    },
    pauseTrack: async (deviceId, accessToken) => {
        try {
            const response = await fetch(`https://api.spotify.com/v1/me/player/pause?device_id=${deviceId}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                console.log('Pausando pista.');
            } else {
                console.error('Error al reproducir pista.');
            }
        } catch (error) {
            console.error('Error al pausar pista', error);
        }
    }

}

