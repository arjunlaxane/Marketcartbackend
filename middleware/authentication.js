const jwt = require('jsonwebtoken');

const User = require('../models/userModel.js');

exports.isAuthenticatedUser = async (req, res, next) => {
  try {
    const myToken = localStorage.getItem('myToken');
    console.log('isauth', myToken);
    if (!myToken) {
      return res
        .status(401)
        .json({ message: 'Please login to access this resource' });
    }
    const decodedData = jwt.verify(myToken, process.env.JWT_SECRET);
    //we got decodedData from jwt token in userModel.js.we got id from there

    req.user = await User.findById(decodedData.id);

    next();

    //we  save this decodedData inside req.user. Thus, whenever user is logged in then we can access his data from req
  } catch (err) {
    return console.log('Error-->>>', err);
  }
};

exports.authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        message: `Role:${req.user.role} is not allowed to access this resource`,
      });
    }
    next();
  };
};
