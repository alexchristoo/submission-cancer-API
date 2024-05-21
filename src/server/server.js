require('dotenv').config();
 
const Hapi = require('@hapi/hapi');
const routes = require('../server/routes');
const loadModel = require('../services/loadModel');
const InputError = require('../exceptions/InputError');
const { image } = require('@tensorflow/tfjs-node');
 
(async () => {
    const server = Hapi.server({
        port: 3000,
        host: 'localhost',
        routes: {
            cors: {
              origin: ['*'],
            },
        },
    });
 
    const model = await loadModel();
    server.app.model = model;
 
    server.route(routes);
 
    server.ext('onPreResponse', function (request, h) {
        const response = request.response;

        if (response instanceof InputError) {
            const newResponse = h.response({
                status: 'fail',
                message: `Terjadi kesalahan dalam melakukan prediksi`
            })
            newResponse.code(400)
            return newResponse;
        }
        
 
        if (response.isBoom) {
            if (response.message.includes('length greater than')) {
                // Menangani kasus di mana ukuran gambar lebih dari 1MB
                const newResponse = h.response({
                    status: 'fail',
                    message: 'Payload content length greater than maximum allowed: 1000000'
                })
                newResponse.code(response.output.statusCode)
                return newResponse;;
            } else{
            const newResponse = h.response({
                status: 'fail',
                message: response.message
            })
            newResponse.code(response.output.statusCode)
            return newResponse;
        }
        }
 
        return h.continue;
    });
 
    await server.start();
    console.log(`Server start at: ${server.info.uri}`);
})();