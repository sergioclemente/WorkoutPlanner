// node ~/Dropbox/WorkoutPlanner/server.js

var http = require('http');
var path = require("path");
var fs = require("fs");
var url = require("url");

var model = require('./model');

var port = process.argv[2] || 8888;

http.createServer(function (req, res) {
  res.writeHead(200, {'Content-Type': 'text/plain'});

  var parsed_url = url.parse(req.url, true);
  var uri = parsed_url.pathname;
  var filename = path.join(process.cwd(), uri);

  fs.exists(filename, function(exists) {
    if (exists) {
      if (fs.statSync(filename).isDirectory()) {
        filename += '/index.html';
      }
      fs.readFile(filename, "binary", function(err, file) {
        if(err) {        
          res.writeHead(500, {"Content-Type": "text/plain"});
          res.write(err + "\n");
          res.end();
          return;
        }

        res.writeHead(200);
        res.write(file, "binary");
        res.end();
      });
    } else {
      // make this more generic
      if (uri === "/workout.mrc") {
          var params = parsed_url.query;
          if (params.w && params.ftp && params.tpace && params.st && params.ou) {
            var userProfile = new model.UserProfile(params.ftp, params.tpace);
            var builder = new model.WorkoutBuilder(userProfile, params.st, params.ou).withDefinition(params.w);
            res.writeHead(200, {"Content-Type": "application/octet-stream"});
            res.write(builder.getMRCFile());
            res.end();
          }        
      } else {
        res.writeHead(404, {"Content-Type": "text/plain"});
        res.write("404 Not Found\n");
        res.end();
        return;
      }
    }
  });
}).listen(8080, '127.0.0.1');
console.log('Server running at http://127.0.0.1:8080/');