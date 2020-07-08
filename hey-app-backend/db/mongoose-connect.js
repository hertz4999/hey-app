const mongoose = require("mongoose");
mongoose.connect("mongodb://localhost:27017/heyapp", { useNewUrlParser: true });

module.exports = { mongoose };
