const mongoose = require("mongoose");

//db connect function

const dbConnect = async () => {
  try {
    // await mongoose.connect("mongodb://localhost:27017/web-bootcamp-blog-app");
    await mongoose.connect(
      "mongodb+srv://emma:6GsbuP0ZpaQQPJDj@mongodb-demo.l0qem.mongodb.net/demo-blog?retryWrites=true&w=majority"
    );
    console.log("DB has connected succesfully");
  } catch (error) {
    console.log("Db connection failed", error.message);
  }
};

module.exports = dbConnect;
