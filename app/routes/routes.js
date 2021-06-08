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
router.post('/api/uploadPics', api.uploadPics);
router.get('/api/confirmToken/:token', api.confirmToken);
router.put('/api/setPassword', api.setPassword);
router.post('/api/hentAuk', api.hentAuk);
router.post('/api/registerAuk', api.registerAuk);
router.post('/api/aukInfo', api.aukInfo);
router.post('/api/getAllItems', api.getAllItems);
router.post('/api/addOrRemoveFromAuk', api.addOrRemoveFromAuk);

module.exports = router;