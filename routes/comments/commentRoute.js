const express = require("express");
const Comment = require("../../models/Comment");
const Post = require("../../models/Post");
const isLogin = require("../../middleware/isLogin");
const commentRoute = express.Router();

//get comment form
commentRoute.get("/comment-form/:id", (req, res) => {
  res.render("comments/addComment", {
    id: req.params.id,
  });
});

//comment logic
commentRoute.post("/comments/:id", isLogin, async (req, res) => {
  try {
    //steps:
    //1. find the logim user = req.session.authUser._id;
    const user = req.session.authUser;
    //2. find the post that we want to comment = req.params.id
    const postFound = await Post.findById(req.params.id);

    //3. create the comment
    const comment = await Comment.create({
      user: {
        fullname: user.firstname + " " + user.lastname,
        profileImage: user.profileImage,
      },
      msg: req.body.msg,
    });

    //4. push the comment created into the founc post
    postFound.comments.push(comment);
    //5. resave the post
    await postFound.save();

    //redirect to post details page
    res.redirect(`/posts/${postFound._id}`);
  } catch (error) {
    res.send(error);
  }
});

module.exports = commentRoute;
