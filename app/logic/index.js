var functions = [];

var normalizedPath = require("path").join(__dirname, "");

require("fs").readdirSync(normalizedPath).forEach(function(file) {
  var f = file.split('.')[0];
  //console.log(file.split('.')[0]);
  if (f != 'index') {
    module.exports[f] = require("./" + f);
  }
});