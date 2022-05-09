const mongoose = require("mongoose");

//comment schema

const commentSchema = new mongoose.Schema(
  {
    user: {
      type: Object,
      required: true,
    },
    msg: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

//compile schema to form a model
const Comment = mongoose.model("Comment", commentSchema);
module.exports = Comment;
