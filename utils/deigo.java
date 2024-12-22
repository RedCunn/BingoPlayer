 // Endpoint para manejar el intercambio de token
        post("/auth-code", (request, response) -> {

            // Parsear el código recibido desde el cliente
            JsonObject body = JsonParser.parseString(request.body()).getAsJsonObject();
            String code = body.get("code").getAsString();

            // Datos de cliente de Spotify
            String clientId = "8ca5ea40a1924a26bfab32d5806ee9e6";
            String clientSecret = "YOUR_CLIENT_SECRET";
            String redirectUri = "http://localhost:5500/BingoPlayer/BingoPlayer/hello.html";

            // Construir la solicitud POST hacia Spotify
            String tokenUrl = "https://accounts.spotify.com/api/token";
            try (CloseableHttpClient httpClient = HttpClients.createDefault()) {
                HttpPost post = new HttpPost(tokenUrl);

                // Codificar las credenciales en Base64
                String credentials = clientId + ":" + clientSecret;
                String encodedCredentials = Base64.getEncoder().encodeToString(credentials.getBytes(StandardCharsets.UTF_8));

                // Agregar headers
                post.setHeader("Authorization", "Basic " + encodedCredentials);
                post.setHeader("Content-Type", "application/x-www-form-urlencoded");

                // Agregar los parámetros
                String bodyParams = "grant_type=authorization_code" +
                        "&code=" + code +
                        "&redirect_uri=" + redirectUri;
                post.setEntity(new StringEntity(bodyParams));

                // Enviar la solicitud y manejar la respuesta
                try (CloseableHttpResponse httpResponse = httpClient.execute(post)) {
                    String jsonResponse = EntityUtils.toString(httpResponse.getEntity(), StandardCharsets.UTF_8);

                    // Configurar la respuesta
                    response.type("application/json");
                    response.status(httpResponse.getStatusLine().getStatusCode());

                    return jsonResponse; // Devolver el token al cliente
                }
            } catch (Exception e) {
                e.printStackTrace();
                response.status(500);
                return "{\"error\":\"Failed to exchange token\"}";
            }
        });
