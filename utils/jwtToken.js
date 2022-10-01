//creating token and saving in cookie
require('dotenv').config({ path: 'config.env' });

const sendToken = (user, statusCode, res) => {
  let token = user.getJWTToken();
  // token = localStorage.getItem('myToken');
  // console.log('getjwttoken>>>', token);

  //options for cookie--we r storing token in coockie.

  // const options = {
  // expires: new Date(
  // Date.now() + process.env.COOKIE_EXPIRE * 24 * 60 * 60 * 1000
  // ),
  // httpOnly: true,
  // };

  res.status(statusCode).json({
    success: true,
    user,
    token,
  });

  // console.log('res----->', res);
};

module.exports = sendToken;
