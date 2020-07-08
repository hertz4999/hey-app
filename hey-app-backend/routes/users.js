var express = require("express");
const bcrypt = require("bcryptjs");
var _ = require("lodash");
const fileupload = require("express-fileupload");

var router = express.Router();

const { mongoose } = require("../db/mongoose-connect");
const { User } = require("../db/users");
const { authenticate } = require("../middleware/authenticate");
const { Post } = require("../db/posts");

/* GET users listing. */
router.post("/signup", function (req, res, next) {
  var body = _.pick(req.body, ["username", "name", "email", "password"]);
  var user = new User(body);
  user.save().then(
    (result) => {
      res.send(result);
      next();
    },
    (e) => {
      res.send(e.message || "something went wrong");
      next();
    }
  );
});

router.post("/login", function (req, resp, next) {
  var body = _.pick(req.body, ["username", "email", "password"]);

  if (body.username) {
    User.findOne({ username: body.username })
      .then((user) => {
        bcrypt.compare(body.password, user.password, (err, res) => {
          if (res) {
            user
              .generateAuthToken()
              .then((token) => {
                resp.header("x-auth", token).status(200).send("logged in!");
                next();
              })
              .catch((e) => {
                console.log(e);
                next();
              });
          } else {
            resp.status(204).send("wrong password");
            next();
          }
        });
      })
      .catch((e) => {
        resp.status(204).send("wrong username");
        next();
      });
  } else if (body.email) {
    User.findOne({ email: body.email })
      .then((user) => {
        bcrypt.compare(body.password, user.password, (err, res) => {
          if (res) {
            user
              .generateAuthToken()
              .then((token) => {
                resp.header("x-auth", token).send("logged in!");
                next();
              })
              .catch((e) => {
                console.log(e);
                next();
              });
          } else {
            resp.status(204).send("wrong password");
          }
          next();
        });
      })
      .catch((e) => {
        resp.status(204).send("wrong email");
        next();
      });
  }
});

router.post("/logout", authenticate, (req, res, next) => {
  req.user.tokens.forEach((element, i) => {
    if (element.access === "auth") {
      req.user.tokens.splice(i, 1);
    }
  });
  req.user
    .save()
    .then((user) => {
      res.status(200).send("Logout Successful");
      next();
    })
    .catch((e) => {
      console.log(e);
      res.status(400).send("Something went wrong");
      next();
    });
});

router.get("/landingPageData", authenticate, function (req, res, next) {
  var user = req.user;
  var posts = user.posts_unseen.concat(user.posts_seen);

  var postsArray = posts.map((post_shell) => {
    return Post.findOne({
      username: post_shell.username,
      _id: post_shell.postid,
    })
      .then((post) => {
        if (!post) {
          return null;
        } else {
          return post;
        }
      })
      .catch((e) => {
        return null;
      });
  });

  Promise.all(postsArray)
    .then(function (postsa) {
      res.status(200).send({
        postsa,
        username: req.user.username,
        follow_req_recieved: req.user.follow_req_recieved,
        bio: req.user.bio,
        profilePic: req.user.profilePic,
      });
      next();
    })
    .catch((e) => {
      console.log(e);
      next();
    });
});

router.post("/profileEdit", fileupload(), authenticate, function (
  req,
  res,
  next
) {
  var user = req.user;
  user.bio = req.body.bio;

  const fileName = req.files.img.name;
  const image = req.files.img;
  const path =
    __dirname +
    "/../profilePic/" +
    user.username +
    "." +
    fileName.split(".")[1];

  user.profilePic =
    "/profilePic/" + user.username + "." + fileName.split(".")[1];

  user.save().then((usr) => {
    image.mv(path, (error) => {
      if (error) {
        console.log(error);
        res.writeHead(500, {
          "Content-Type": "application/json",
        });
        res.send(JSON.stringify({ status: "error", message: error }));
        return;
      }
    });
    res.status(200).send("profile pic and bio updated");
    next();
  });
});

router.get("/searchQuery/:usernameRegex", authenticate, function (
  req,
  res,
  next
) {
  var query = req.params.usernameRegex;
  User.find({ username: { $regex: query, $options: "i" } })
    .then((users) => {
      res.status(200).send(
        users
          .map((element) => {
            var retVal = { username: element.username };
            req.user.follow_req_sent.forEach((check) => {
              if (check.username == element.username) {
                retVal.status = "req sent";
              }
            });
            req.user.following.forEach((check) => {
              if (check.username == element.username) {
                retVal.status = "following";
              }
            });
            if (!retVal.status) {
              retVal.status = "follow";
            }

            return retVal;
          })
          .filter((el) => {
            return el.username != req.user.username;
          })
      );
      next();
    })
    .catch((e) => {
      console.log(e);
      res.status(500).send("Database Error");
      next();
    });
});

router.post("/addPost", fileupload(), authenticate, function (req, res, next) {
  var body = _.pick(req.body, ["content"]);
  var user = req.user;
  body.username = req.user.username;
  body.timeStamp = new Date();

  const fileName = req.files.img.name;

  const image = req.files.img;
  console.log(body);
  if (!body) {
    console.log("FUCK UP");
  }

  var post = new Post(body);
  post.save().then(
    (result) => {
      const path =
        __dirname + "/../images/" + result._id + "." + fileName.split(".")[1];
      var promises = [];
      var promisesTwo = [];
      user.followers.forEach((element) => {
        promises.push(
          User.findOne({ username: element.username }).then((follower) => {
            follower.posts_unseen.unshift({
              username: user.username,
              postid: result._id,
            });
            promisesTwo.push(follower.save());
          })
        );
      });
      req.user.posts.push({ postid: result._id });
      result.img = "/images/" + result._id + "." + fileName.split(".")[1];
      result.save();
      Promise.all(promises).then(function (resultss) {
        Promise.all(promisesTwo).then(function (resultsss) {
          req.user
            .save()
            .then((done) => {
              image.mv(path, (error) => {
                if (error) {
                  console.log(error);
                  res.writeHead(500, {
                    "Content-Type": "application/json",
                  });
                  res.send(JSON.stringify({ status: "error", message: error }));
                  return;
                }
              });
              res.status(200).send("post Added");
              next();
            })
            .catch((e) => {
              res.status(400).send("Auth Fail Probably");
              next();
            });
        });
      });
    },
    (e) => {
      res.send(e.message || "something went wrong");
    }
  );
});

router.post("/likePost", authenticate, function (req, res, next) {
  var likeFlag = 0;
  Post.findOne({ _id: req.body.postid, username: req.body.username })
    .then((post) => {
      console.log("ayayayayayayyayayayayay");
      post.likes.forEach((element) => {
        if (element.username === req.user.username) {
          likeFlag = 1;
        }
      });
      if (likeFlag === 0) {
        console.log("before Pushing Like");
        post.likes.push({ username: req.user.username, time: new Date() });
      } else {
        console.log("before Deleting Like");
        var arr = post.likes;
        for (var i = 0; i < arr.length; i++) {
          if (arr[i].username === req.user.username) {
            arr.splice(i, 1);
            console.log("After Splice");
          }
        }
      }
      post
        .save()
        .then((post1) => {
          res.status(200).send("DONE");
          next();
        })
        .catch((e) => {
          console.log("Post saving error");
          console.log(e);
          next();
        });
    })
    .catch((e) => {
      console.log("Post Finding error");
      console.log(e);
      next();
    });
});

router.post("/commentOnPost", authenticate, function (req, res, next) {
  var postid = req.body.postid;
  var content = req.body.content;
  var user = req.user;

  Post.findOne({ _id: postid })
    .then((post) => {
      var comment = { username: user.username, content, time: new Date() };
      post.comments.push(comment);
      post
        .save()
        .then((post1) => {
          res.status(200).send("Comment Added");
          next();
        })
        .catch((e) => {
          console.log(e);
          next();
        });
    })
    .catch((e) => {
      console.log(e);
      next();
    });
});

router.delete("/deletePost/:postid", authenticate, function (req, res, next) {
  Post.findOneAndDelete({ _id: req.params.postid, username: req.user.username })
    .then((post) => {
      var arr = req.user.posts;
      for (var i = 0; i < arr.length; i++) {
        if (arr[i].postid === post._id) {
          arr.splice(i, 1);
        }
      }
      req.user.save().then((theUser) => {
        res.status(200).send("Post deleted");
        next();
      });
    })
    .catch((e) => {
      res.status(400).send("No Such Post");
      next();
    });
});

router.post("/sendFollowRequest/:username", authenticate, function (
  req,
  res,
  next
) {
  if (req.user.username === req.params.username) {
    res.status(404).send("Cant Send Req to yourself");
    next();
  } else {
    User.findOne({ username: req.params.username })
      .then((user) => {
        req.user.follow_req_sent.push({ username: req.params.username });
        req.user
          .save()
          .then((mainUsr) => {
            user.follow_req_recieved.push({ username: req.user.username });
            user
              .save()
              .then((usr) => {
                res.status(200).send("Follow Request Sent");
                next();
              })
              .catch((e) => {
                res.status(400).send("What the fuck nigga");
                next();
              });
          })
          .catch((e) => {
            res.status(400).send("Auth Fail!");
            next();
          });
      })
      .catch((e) => {
        res.status(404).send("No Such User");
        next();
      });
  }
});

router.post(
  "/acceptFollowRequest/:username",
  authenticate,
  (req, res, next) => {
    User.findOne({ username: req.params.username })
      .then((user) => {
        if (
          user.follow_req_sent.some(
            (shiz) => shiz.username === req.user.username
          ) &&
          req.user.follow_req_recieved.some(
            (shiz) => shiz.username === user.username
          )
        ) {
          var arr = req.user.follow_req_recieved;
          for (var i = 0; i < arr.length; i++) {
            if (arr[i].username === user.username) {
              arr.splice(i, 1);
            }
          }
          arr = user.follow_req_sent;
          for (var i = 0; i < arr.length; i++) {
            if (arr[i].username === req.user.username) {
              arr.splice(i, 1);
            }
          }
          req.user.followers.push({ username: user.username });
          user.following.push({ username: req.user.username });
          var newPostsShiz = req.user.posts.map((post) => {
            return {
              username: req.user.username,
              postid: post.postid,
            };
          });
          user.posts_unseen = user.posts_unseen.concat(newPostsShiz);
          user
            .save()
            .then((pholder) => {
              req.user
                .save()
                .then((hold) => {
                  res.status(200).send("follow request accepted");
                  next();
                })
                .catch((e) => {
                  console.log(e);
                  res.status(400).send("what the fuck bitch");
                  next();
                });
            })
            .catch((e) => {
              console.log(e);
              res.status(400).send("what the fuck bruh");
              next();
            });
        } else {
          res.status(400).send("no such follow request");
          next();
        }
      })
      .catch((e) => {
        res.status(404).send("NO such user");
        next();
      });
  }
);

router.delete(
  "/deleteFollowRequest/:username",
  authenticate,
  (req, res, next) => {
    User.findOne({ username: req.params.username })
      .then((user) => {
        var arr = req.user.follow_req_sent;
        for (var i = 0; i < arr.length; i++) {
          if (arr[i].username === user.username) {
            arr.splice(i, 1);
          }
        }
        req.user
          .save()
          .then((mainUsr) => {
            arr = user.follow_req_recieved;
            for (var i = 0; i < arr.length; i++) {
              if (arr[i].username === req.user.username) {
                arr.splice(i, 1);
              }
            }

            user
              .save()
              .then((usr) => {
                res.status(200).send("Follow Request Deleted");
                next();
              })
              .catch((e) => {
                res.status(400).send("What the fuck nigga");
                next();
              });
          })
          .catch((e) => {
            res.status(400).send("Auth Fail!");
            next();
          });
      })
      .catch((e) => {
        res.status(404).send("No Such User");
        next();
      });
  }
);

router.delete(
  "/declineFollowRequest/:username",
  authenticate,
  (req, res, next) => {
    User.findOne({ username: req.params.username })
      .then((user) => {
        var arr = user.follow_req_sent;
        for (var i = 0; i < arr.length; i++) {
          if (arr[i].username === req.user.username) {
            arr.splice(i, 1);
          }
        }
        user
          .save()
          .then((mainUsr) => {
            arr = req.user.follow_req_recieved;
            for (var i = 0; i < arr.length; i++) {
              if (arr[i].username === user.username) {
                arr.splice(i, 1);
              }
            }

            req.user
              .save()
              .then((usr) => {
                res.status(200).send("Follow Request Declined");
                next();
              })
              .catch((e) => {
                res.status(400).send("What the fuck nigga");
                next();
              });
          })
          .catch((e) => {
            res.status(400).send("Auth Fail!");
            next();
          });
      })
      .catch((e) => {
        res.status(404).send("No Such User");
        next();
      });
  }
);

module.exports = router;
