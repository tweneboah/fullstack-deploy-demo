const express = require("express");
const multer = require("multer");
const User = require("../../models/User");
const storage = require("../../utils/cloudinary");

const usersRoute = express.Router();

//pass multer as a middleware
const upload = multer({
  storage,
});

//get register form
usersRoute.get("/register", (req, res) => {
  res.render("users/register", {
    error: req.flash("error"),
  });
});

//.register user
usersRoute.post(
  "/register",
  upload.single("profileImage"),
  async (req, res) => {
    const { email, firstname, lastname, password } = req.body;

    try {
      //  chech if user is uploading profile photo

      if (!req.file?.path) {
        req.flash("error", "Please upload profile Image");

        return res.redirect("/users/register");
      }

      //1. check if user exist (email)
      const userFound = await User.findOne({ email });
      if (userFound) {
        req.flash("error", "User already exist");
        return res.redirect("/users/register");
      }

      await User.create({
        email,
        password,
        firstname,
        lastname,
        profileImage: req.file.path,
      });
      res.redirect("/users/login");
    } catch (error) {
      //send err using flash
      req.flash("error", error.message);
      res.redirect("/users/register");
    }
  }
);

//get the login form
usersRoute.get("/login", (req, res) => {
  //get the flash msg

  res.render("users/login", {
    error: req.flash("error"),
  });
});

//login user
usersRoute.post("/login", async (req, res) => {
  try {
    //check if user exist
    const userFound = await User.findOne({ email: req.body.email });
    console.log({ userFound });
    //check if password is valid
    const isPasswordValid = await userFound.passwordVerification(
      req.body.password
    );
    if (userFound && isPasswordValid) {
      //put user into session
      req.session.authUser = userFound;
      res.redirect("/users/profile/" + userFound._id);
    } else {
      //send error msg using flash
      req.flash("error", "Email or password is valid");
      res.redirect("/users/login");
    }
  } catch (error) {
    res.json(error);
  }
});
//fetch all users
usersRoute.get("/", async (req, res) => {
  //add data to the session
  console.log(req.session);
  res.send("This is users endpoint");
});

//logout
usersRoute.get("/logout", (req, res) => {
  req.session.destroy(() => {
    res.redirect("/users/login");
  });
});

//profile page
usersRoute.get("/profile/:id", async (req, res) => {
  try {
    //find the user
    const user = await User.findById(req.params.id).populate("posts");
    console.log(user.posts);
    res.render("users/profile", { user });
  } catch (error) {
    res.send(error);
  }
});

//update

//update user /firstname/lastname/email - form
usersRoute.get("/updateUser/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    res.render("users/updateUser", {
      user,
      error: req.flash("error"),
    });
  } catch (error) {
    res.send(error);
  }
});

//update user -firstname/lastname/email logic
usersRoute.post("/updateUser/:id", async (req, res) => {
  const { firstname, lastname, email } = req.body;
  // check if user provide details
  if (!firstname || !lastname || !email) {
    req.flash("error", "Please provide all details");
    return res.redirect(`/users/updateUser/${req.params.id}`);
  }
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      {
        firstname: req.body.firstname,
        lastname: req.body.lastname,
        email: req.body.email,
      },
      {
        new: true,
      }
    );
    //redirect to profile
    res.redirect(`/users/profile/${user._id}`);
  } catch (error) {
    req.flash("error", error.message);
    res.redirect(`/users/updateUser/${req.params.id}`);
  }
});

//update user  -password
usersRoute.get("/updatePassword/:id", async (req, res) => {
  try {
    res.render("users/updatePassword", {
      error: req.flash("error"),
    });
  } catch (error) {
    res.send(error);
  }
});

//update password logic
usersRoute.post("/updatepassword/:id", async (req, res) => {
  if (!req.body.password) {
    req.flash("error", "Please provide new password");
    return res.redirect(`/users/updatePassword/${req.params.id}`);
  }
  try {
    // find the user
    const user = await User.findById(req.params.id);
    //update the password using the object way
    user.password = req.body.password;
    //save again
    await user.save();
    //logout the user and redirect
    req.session.destroy(() => {
      res.redirect("/users/login");
    });
  } catch (error) {
    req.flash("error", error.message);
    return res.redirect(`/users/updatePassword/${req.params.id}`);
  }
});

//update profile photo - form
usersRoute.get("/updatePhoto/:id", async (req, res) => {
  try {
    res.render("users/uploadPhoto", {
      error: req.flash("error"),
    });
  } catch (error) {
    res.send(error);
  }
});

//update profile photo logic

usersRoute.post(
  "/updatePhoto/:id",
  upload.single("profileImage"),
  async (req, res) => {
    if (!req?.file?.path) {
      req.flash("error", "Please upload photo");
      return res.redirect(`/users/updatePhoto/${req.params.id}`);
    }
    try {
      //find the user
      await User.findByIdAndUpdate(
        req.params.id,
        {
          profileImage: req.file.path,
        },
        {
          new: true,
        }
      );
      res.redirect(`/users/profile/${req.params.id}`);
    } catch (error) {
      req.flash("error", error.message);
      return res.redirect(`/users/updatePhoto/${req.params.id}`);
    }
  }
);

//fetch single
usersRoute.get("/:id", async (req, res) => {
  res.send("This is register endpoint");
});

module.exports = usersRoute;
