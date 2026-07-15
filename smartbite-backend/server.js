const express = require('express');
const routes = require('./src/routes');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use('/api', routes);

app.get('/', (req, res) => res.send('SmartBite Backend Running'));

app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));

module.exports = app;
