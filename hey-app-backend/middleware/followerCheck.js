const { mongoose } = require("./../db/mongoose-connect");
const { User } = require("./../db/users");
const { Post } = require("./../db/posts");

var followerCheck = (req, res, next) => {
  var path = req.path;
  var file = path.split("/").pop();
  var id = file.split(".")[0];
  Post.findById(id)
    .then((post) => {
      req.user.following.forEach((element) => {
        if (element.username === post.username) {
          next();
        }
      });
    })
    .catch((e) => {
      console.log("not a Follower Error");
      console.log(e);
      res.status(400).send("YOudont have access to the said File");
    });
};

module.exports = { followerCheck };
