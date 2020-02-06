const fs = require('fs');
const mongoose = require('mongoose');
const {validationResult} = require('express-validator');
const HttpError = require('../models/http-error');
const getCoordsForAddress = require('../util/location');
const Place = require('../models/place');
const User = require('../models/user');



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
        image: req.file.path,
        creator
   })

   let user;
   try{
      user = await User.findById(creator)
    }catch(err){
      const error = new HttpError('Creating place has failed :(', 500)
      return next(error)
    }

    if(!user){
        const error = new HttpError('could not find user', 404)
        return next(error)
    }

    // const imagePath = place.image;

   try{
      const sess = await mongoose.startSession();
      sess.startTransaction();
      await createdPlace.save({session: sess});
      user.places.push(createdPlace);
      await user.save({session: sess});
      await sess.commitTransaction();
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
        return next(new HttpError('Invalid inputs passed, please check your data', 422))
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
        place = await Place.findById(placeId).populate('creator');
    }catch(err){
        const error = new HttpError('Somthing went wrong, could not delete place', 500);
        return next(error)
    }

    if(!place){
        const error = new HttpError('could not find a place with this id', 404)
        return next(error)
    }

    try{
        const sess = await mongoose.startSession();
        sess.startTransaction();
        await place.remove({session: sess});
        place.creator.places.pull(place);
        await place.creator.save({session: sess});
        await sess.commitTransaction();
     }catch(err){
       const error = new HttpError('deleting the place has failed :(', 500)
       return next(error)
     }

    // fs.unlink(imagePath, err =>{
    //     console.log(err);
    // });

    res.status(200).json({message: 'Place deleted'})
};


exports.getPlaceById = getPlaceById;
exports.getPlacesByUserId = getPlacesByUserId;
exports.createPlace = createPlace;
exports.updatePlace = updatePlace;
exports.deletePlace = deletePlace;


