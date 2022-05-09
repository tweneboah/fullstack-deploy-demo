const isLogin = (req, res, next) => {
  console.log("islogin");
  if (req.session.authUser) {
    next();
  } else {
    res.redirect("/users/login");
  }
};

module.exports = isLogin;
