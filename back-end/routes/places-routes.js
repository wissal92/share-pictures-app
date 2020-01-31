const express = require('express');

const placesControllers = require('../controllers/places-controllers');

const router = express.Router();

router.get('/:pageId', placesControllers.getPlaceById);

router.get('/user/:userId', placesControllers.getPlaceByUserId);

router.post('/', placesControllers.createPlace);

module.exports = router;