import express from 'express';
import router from './approutes.js';
import cors from 'cors';

var app = express();
app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use('/', router);
app.listen(4080);