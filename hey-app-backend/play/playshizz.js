const jwt = require("jsonwebtoken");
var token = jwt.sign({ _id: "fuddi", av: "lund" }, "bigDaddy69").toString();
console.log(token);
