const { mongoose } = require("./mongoose-connect");
const uniqueValidator = require("mongoose-unique-validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { ObjectID } = require("mongodb");

const { Post } = require("./posts");

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    lowercase: true,
    required: true,
    trim: true,
    match: /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
  },
  username: {
    type: String,
    lowercase: true,
    unique: true,
    required: true,
    index: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
  },
  bio: {
    type: String,
  },
  profilePic: {
    type: String,
  },
  followers: [
    {
      username: {
        type: String,
        required: true,
      },
    },
  ],
  following: [
    {
      username: {
        type: String,
        required: true,
      },
    },
  ],
  posts: [
    {
      postid: {
        type: String,
        required: true,
      },
    },
  ],
  posts_unseen: [
    {
      username: {
        type: String,
        required: true,
      },
      postid: {
        type: String,
        required: true,
      },
    },
  ],
  posts_seen: [
    {
      username: {
        type: String,
        required: true,
      },
      postid: {
        type: String,
        required: true,
      },
    },
  ],
  follow_req_recieved: [
    {
      username: {
        type: String,
        required: true,
      },
    },
  ],
  follow_req_sent: [
    {
      username: {
        type: String,
        required: true,
      },
    },
  ],
  tokens: [
    {
      access: {
        type: String,
        required: true,
      },
      token: {
        type: String,
        required: true,
      },
    },
  ],
});

UserSchema.plugin(uniqueValidator, { message: "is already taken." });

UserSchema.statics.findByToken = function (token) {
  var User = this;
  var decoded;
  try {
    decoded = jwt.verify(token, "bigDaddy69");
  } catch (e) {
    return Promise.reject();
  }
  return User.findOne({
    _id: decoded._id,
    "tokens.token": token,
    "tokens.access": "auth",
  });
};

UserSchema.methods.createPost = function (data) {
  var user = this;
  var post = new Post({
    username: user.username,
    content: data.content,
    timestamp: new Date(),
  });
  post.save().then((res) => {
    return res;
  });
};

UserSchema.methods.generateAuthToken = function () {
  var user = this;
  var access = "auth";
  var token = jwt
    .sign({ _id: user._id.toHexString(), access }, "bigDaddy69")
    .toString();

  user.tokens.forEach((element, i) => {
    if (element.access === "auth") {
      user.tokens.splice(i, 1);
    }
  });

  user.tokens.push({ access, token });
  return user
    .save()
    .then((checkin) => {
      return new Promise((resolve, reject) => {
        resolve(token);
      });
    })
    .catch((e) => {
      console.log(e);
    });
};

UserSchema.pre("save", function (next) {
  var user = this;
  if (user.isModified("password")) {
    bcrypt.genSalt(10, (err, salt) => {
      bcrypt.hash(user.password, salt, (err, hash) => {
        user.password = hash;
        next();
      });
    });
  } else next();
});

const User = mongoose.model("User", UserSchema);

module.exports = { User };
