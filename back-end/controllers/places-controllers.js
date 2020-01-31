const uuid = require('uuid/v4');
const HttpError = require('../models/http-error');

const DUMMY_PLACES = [
    {
      id: 'p1',
      title: 'Empire State Building',
      description: 'One of the most famous sky scrapers in the world!',
      location: {
        lat: 40.7484474,
        lng: -73.9871516
      },
      address: '20 W 34th St, New York, NY 10001',
      creator: 'u1'
    }
];

const getPlaceById = (req, res, next) => {
    const placeId = req.params.placeId;
    const place = DUMMY_PLACES.find(p =>{
        return p.id === placeId;
    });

    if(!place){
       throw new HttpError('Could not find a place with the provided id', 404);;
    }

    res.json({place})
}

const getPlaceByUserId = (req, res, next) => {
    const userId = req.params.userId;
    const place = DUMMY_PLACES.find(p =>{
        return p.creator === userId;
    });
    
    if(!place){
        return next(new Error('Could not find a place with the provided user id', 404));
    }

    res.json({place})
}

const createPlace = (req, res, next) => {
   const {title, description, coordinates, address, creator} = req.body;

   const createdPlace = {
       id: uuid(),
       title,
       description,
       location: coordinates,
       address,
       creator
   }

   DUMMY_PLACES.push(createdPlace);
   res.status(201).json({place: createdPlace});
}

exports.getPlaceById = getPlaceById;
exports.getPlaceByUserId = getPlaceByUserId;
exports.createPlace = createPlace;

