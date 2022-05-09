const express = require("express");
const session = require("express-session");
const flash = require("connect-flash");
const MongoStore = require("connect-mongo");
const Post = require("./models/Post");
const commentRoute = require("./routes/comments/commentRoute");
const postRoute = require("./routes/posts/postsRoute");
const usersRoute = require("./routes/users/usersRoute");
const dbConnect = require("./utils/dbConnect");

//create instance of express
const app = express();

//db
dbConnect();

//middlewares
//ejs config
app.set("view engine", "ejs");
//server static files
app.use(express.static(__dirname, +"public"));
//pass incoming data as json for api development
app.use(express.json());
app.use(express.urlencoded({ extended: true })); //pass data from a form

//configure connect flash
app.use(flash());
//configure express session
app.use(
  session({
    secret: "mysecret",
    resave: false,
    saveUninitialized: true,
    store: new MongoStore({
      mongoUrl:
        "mongodb+srv://emma:6GsbuP0ZpaQQPJDj@mongodb-demo.l0qem.mongodb.net/demo-blog?retryWrites=true&w=majority",
      ttl: 24 * 60 * 60, //1 day
    }),
  })
);

//save the login user into locals
app.use((req, res, next) => {
  if (req.session.authUser) {
    res.locals.authUser = req.session.authUser;
  } else {
    res.locals.authUser = null;
  }
  next();
});
//-------
//ROUTES
//-----

//home route
app.get("/", async (req, res) => {
  //fetch all post and pass to index.ejs template

  try {
    const posts = await Post.find().populate("user");
    console.log(posts);
    res.render("index", {
      posts,
    });
  } catch (error) {
    res.send("Fetch failed");
  }
});

//post route
app.use("/posts", postRoute);
//users
app.use("/users", usersRoute);

//comment
app.use("/", commentRoute);

//start server
app.listen(8000, function () {
  console.log("Server is up  and running");
});

//
//mongo db connection:
