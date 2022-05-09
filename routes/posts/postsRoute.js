const express = require("express");
const multer = require("multer");
const Post = require("../../models/Post");
const User = require("../../models/User");
const postRoute = express.Router();
const storage = require("../../utils/cloudinary");

const isLogin = require("../../middleware/isLogin");

//pass as a middleware
const upload = multer({
  storage,
});

//steps of creating a post
//render the form
postRoute.get("/createPost", isLogin, (req, res) => {
  res.render("posts/createPost", {
    error: req.flash("error"),
  });
});
//talk the api

//create post
postRoute.post("/create", isLogin, upload.single("image"), async (req, res) => {
  const { title, description, category } = req.body;
  //prevent duplicate title
  const postFound = await Post.findOne({ title });
  if (postFound) {
    return res.json("This post title is already exist");
  }
  //check if image exist
  const isImage = req?.file?.path;
  if (!isImage) {
    //send err msg
    req.flash("error", "Please upload an image");
    return res.redirect("/posts/createPost");
  }

  // 1. save the user id into the post about create

  try {
    //create post
    const post = await Post.create({
      title,
      description,
      category,
      image: req.file.path,
      user: req.session.authUser._id,
    });
    //2.save the created post into the user field
    const userFound = await User.findById(req.session.authUser._id);
    userFound.posts.push(post._id);
    await userFound.save();
    res.redirect("/");
  } catch (error) {
    //send err msg
    req.flash("error", error.message);
    return res.redirect("/posts/createPost");
  }
});

//fetch  all posts

postRoute.get("/", async (req, res) => {
  try {
    const posts = await Post.find({}).populate("user");
    console.log(posts);
    res.render("posts/allPost", {
      posts,
      total: posts?.length,
    });
  } catch (error) {
    res.json(error);
  }
});

//delete post
postRoute.get("/delete/:id", async (req, res) => {
  try {
    await Post.findByIdAndDelete(req.params.id);
    res.redirect("/");
  } catch (error) {
    res.json(error);
  }
});

//steps for updating

//1.get the edit form
postRoute.get("/edit-form/:id", async (req, res) => {
  try {
    //2 pre popluate the existing data into the form
    const post = await Post.findById(req.params.id);
    res.render("posts/editPost", { post, error: req.flash("error") });
  } catch (error) {
    res.send(error);
  }
});

//3. make request to the api to make the changes

//update post
postRoute.post("/edit/:id", upload.single("image"), async (req, res) => {
  try {
    if (!req.file && req.file.path) {
      req.flash("error", "Please upload an image");
      return res.redirect(`/posts/edit-form/${req.params.id}`);
    }
    const updatedPost = await Post.findByIdAndUpdate(
      req.params.id,
      {
        title: req.body.title,
        description: req.body.description,
        category: req.body.category,
        image: req.file.path,
      },
      {
        runValidators: true,
        new: true,
      }
    );
    res.render("posts/postDetails", {
      post: updatedPost,
    });
  } catch (error) {
    req.flash("error", "Please upload an image");
    res.redirect(`/posts/edit-form/${req.params.id}`);
  }
});

//fetch a single post
postRoute.get("/:id", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate("user")
      .populate("comments");
    res.render("posts/postDetails", {
      post,
    });
  } catch (error) {
    res.json("This post does not exist");
  }
});

module.exports = postRoute;
