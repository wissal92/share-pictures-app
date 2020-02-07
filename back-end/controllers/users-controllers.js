const {validationResult} = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const HttpError = require('../models/http-error');
const User = require('../models/user');


const getUsers = async(req, res, next) => {
  let users;
  try{
    users = await User.find({}, '-password')
  } catch (err) {
    const error = new HttpError('Fetching users failed, try again later', 500);
    return next(error);
  }
  res.json({users: users.map(user => user.toObject({getters: true}))});
};

const signup = async(req, res, next) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        console.log(errors);
      return next(new HttpError('Invalid inputs passed, please check your data', 422))
    }
    
    const {name, email, password} = req.body;
    
    let existingUser;
    try{
      existingUser = await User.findOne({email})
    } catch (err) {
      const error = new HttpError('Signing up failed, please try again later', 500);
      return next(error);
    }

    if(existingUser){
      const error = new HttpError('User exists already, Please login instead', 422);
      return next(error);
    }
    
    let hashedPassword;
    try{
        hashedPassword = await bcrypt.hash(password, 12);
    } catch(err){
        const error = new HttpError('Could not create user, please try again', 500)
        return next(error)
    }

    const createdUser = new User({
        name,
        email,
        image: req.file.path,
        password: hashedPassword,
        places: []
    });

    
    try{
      await createdUser.save();
    }catch(err){
     const error = new HttpError('signin up has failed :(', 500)
     return next(error)
    }

    let token;
    try{
      token = jwt.sign({userId: createdUser.id, email: createdUser.email}, 
              process.env.JWT_KEY, {expiresIn: '1h'})
    }catch (err) {
      const error = new HttpError('signin up has failed :(', 500)
      return next(error)
    }

    res.status(201).json({userId: createdUser.id, email: createdUser.email, token: token});
};

const login = async(req, res, next) => {
    const { email, password } = req.body;

    let existingUser;
    try{
      existingUser = await User.findOne({email})
    } catch (err) {
      const error = new HttpError('Login in failed, please check your credentials', 500);
      return next(error);
    }

    if (!existingUser) {
      const error = new HttpError('Could not identify user, credentials seem to be wrong.', 403);
      return next(error);
    }

    let isValidPassword = false;
    try{
      isValidPassword = await bcrypt.compare(password, existingUser.password);
    } catch (err) {
      const error = new HttpError('Could not log you in, please check your credentials and try again', 500)
      return next(error)
    }

    if(!isValidPassword){
      const error = new HttpError('Login in failed, please check your credentials', 500);
      return next(error);
    }

    let token;
    try{
      token = jwt.sign({userId: existingUser.id, email: existingUser.email}, 
              process.env.JWT_KEY, {expiresIn: '1h'})
    }catch (err) {
      const error = new HttpError('signin up has failed :(', 500)
      return next(error)
    }
  
    res.json({userId: existingUser.id, email: existingUser.email, token: token});
};

exports.getUsers = getUsers;
exports.signup = signup;
exports.login = login;