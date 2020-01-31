const express = require('express');
const placesControllers = require('../controllers/places-controllers');

const router = express.Router();

  
router.get('/', (req, res, next) => {
    console.log('Get Request in Places');
    res.json({message: 'It works'})
});

router.get('/:placeId', placesControllers.getPlaceById);

router.get('/user/:userId', placesControllers.getPlaceByUserId);

module.exports = router;