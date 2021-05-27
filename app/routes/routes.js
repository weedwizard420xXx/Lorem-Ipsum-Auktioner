const express = require('express'); //Express server
const router = express.Router(); //Router instance
const api = require('../api/api.js');

//Api routes. get, post, put, delete eksempelvis
router.post('/api/example', api.example);
router.post('/api/register', api.register);
router.post('/api/login', api.login);
router.post('/api/logout', api.logout);
router.post('/api/registerAukt', api.registerAukt);
router.post('/api/auth', api.auth);
router.post('/api/sendVurdering', api.sendVurdering);
router.get('/api/confirmToken/:token', api.confirmToken);
router.put('/api/setPassword', api.setPassword);


module.exports = router;