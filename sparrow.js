const app = require('./src/app');
const config = require('./src/config');
const {port} = config;


app.listen(port, () => console.log('Now listening on port: ' + port));