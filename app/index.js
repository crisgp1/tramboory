// app/index.js
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const authRoutes = require('./src/routes/auth');

const app = express();
const port = 3001;

app.use(cors());
app.use(bodyParser.json());
app.use('/api/auth', authRoutes);

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
