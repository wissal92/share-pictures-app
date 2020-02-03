const uuid = require('uuid/v4');
const {validationResult} = require('express-validator');
const HttpError = require('../models/http-error');
const getCoordsForAddress = require('../util/location');
const Place = require('../models/place');

let DUMMY_PLACES = [
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

const getPlaceById = async(req, res, next) => {
    const placeId = req.params.placeId;
    
    let place;
    try{
        place = await Place.findById(placeId);
    }catch(err){
        const error = new HttpError('Sorry we couln\'t find any place with provided id :(', 500)
        return next(error);
    }

    if(!place){
      const error = new HttpError('Could not find a place with the provided id', 404);
      return next(error);
    }

    res.json({place: place.toObject({getters: true})});
}

const getPlacesByUserId = async(req, res, next) => {
    const userId = req.params.userId;
    let places;
    try{
       places = await Place.find({creator: userId});
    }catch(err){
       const error = new HttpError('Fetching places failed, please try again later', 500)
       return next(error);
    }

    if(!places || places.length === 0){
        return next(new Error('Could not find a place with the provided user id', 404));
    }

    res.json({places: places.map(place => place.toObject({getters: true}))})
}

const createPlace = async (req, res, next) => {
   const errors = validationResult(req);
   if(!errors.isEmpty()){
     return  next(new HttpError('Invalid inputs passed, please check your data', 422));
   }

   const {title, description, address, creator} = req.body;

   let coordinates;

   try{
      coordinates = await getCoordsForAddress(address);
   } catch(err) {
       console.log('there is an error', err)
       return next(err);
   }

   const createdPlace = new Place({
        title,
        description,
        location: coordinates,
        address,
        image: 'https://historicalhistrionics.files.wordpress.com/2012/01/the-tudors-anne-boleyn.jpg',
        creator
   })

   try{
      await createdPlace.save();
   }catch(err){
     const error = new HttpError('Creating place has failed :(', 500)
     return next(error)
   }

   res.status(201).json({place: createdPlace});
}

const updatePlace = async(req, res, next) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        console.log(errors);
        throw new HttpError('Invalid inputs passed, please check your data', 422)
    }

    const {title, description} = req.body;
    const placeId = req.params.placeId;

    let place;
    try{
        place = await Place.findById(placeId);
    }catch(err){
        const error = new HttpError('Somthing went wrong, could not update place', 500);
        return next(error)
    }

    place.title = title;
    place.description = description;

    try{
        await place.save();
     }catch(err){
       const error = new HttpError('updating the place has failed :(', 500)
       return next(error)
     }

    res.status(200).json({place: place.toObject({getters: true})});
};

const deletePlace = async(req, res, next) => {
    const placeId = req.params.placeId;
    
    let place;
    try{
        place = await Place.findById(placeId);
    }catch(err){
        const error = new HttpError('Somthing went wrong, could not delete place', 500);
        return next(error)
    }

    try{
        await place.remove();
     }catch(err){
       const error = new HttpError('deleting the place has failed :(', 500)
       return next(error)
     }

    res.status(200).json({message: 'Place deleted'})
};

exports.getPlaceById = getPlaceById;
exports.getPlacesByUserId = getPlacesByUserId;
exports.createPlace = createPlace;
exports.updatePlace = updatePlace;
exports.deletePlace = deletePlace;


