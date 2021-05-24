const express = require('express'); //Express server
const router = express.Router(); //Router instance
const api = require('../api/api.js');

//Api routes. get, post, put, delete eksempelvis
router.get('/api/example', api.example);
router.post('/api/auth', api.auth);


module.exports = router;