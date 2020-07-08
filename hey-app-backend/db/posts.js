const { mongoose } = require("./mongoose-connect");
var fs = require("fs");
const PostSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  img: { type: String, default: "" },
  timeStamp: {
    type: Date,
    required: true,
  },
  likes: [
    {
      username: {
        type: String,
        required: true,
      },
      time: {
        type: Date,
        required: true,
      },
    },
  ],
  comments: [
    {
      username: {
        type: String,
        required: true,
      },
      time: {
        type: Date,
        required: true,
      },
      content: {
        type: String,
        required: true,
      },
    },
  ],
});

// PostSchema.methods.addImage = function (img) {
//   var post = this;
//   if (img) {
//     post.img.data = Buffer.from(img);
//     post.img.contentType = "image/png";
//   }

//   return post
//     .save()
//     .then((res) => res)
//     .catch((e) => {
//       console.log(e);
//     });
// };

const Post = mongoose.model("Posts", PostSchema);

module.exports = { Post };
