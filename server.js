var http = require('http');
var path = require("path");
var fs = require("fs");
var url = require("url");

var model = require('./model');

var port = process.argv[2] || 8888;

function logRequest(req) {
  console.log(new Date().toTimeString() + " " + req.connection.remoteAddress + " " + req.method + " " + req.url);
}

http.createServer(function (req, res) {
  try {
    var parsed_url = url.parse(req.url, true);
    var uri = parsed_url.pathname;

    var base_path = process.cwd();
    var filename = path.normalize(path.join(base_path, uri));

    logRequest(req);

    if (filename.indexOf(base_path) < 0) {
      res.writeHead(303, {"Content-Type": "text/plain"});
      res.write("No donut for you" + "\n");
      res.end();
      return;
    }

    fs.exists(filename, function(exists) {
      try {
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
                console.log("here");
                res.writeHead(200,
                  {
                    "Content-Type": "application/octet-stream",
                    "Content-Disposition": "attachment; filename=\"" + builder.getMRCFileName() + "\";"
                  }
                );
                res.write(builder.getMRCFile());
                console.log("here");
                res.end();
              }        
          } else {
            res.writeHead(404, {"Content-Type": "text/plain"});
            res.write("404 Not Found\n");
            res.end();
            return;
          }
        }
      } catch (err1) {
        res.writeHead(500, {"Content-Type": "text/plain"});
        res.write("Oops... Server error\n");
        res.end();
        console.log(err1.message);
        console.log(err1.stack);
      }
    });
  } catch (err2) {
    res.writeHead(500, {"Content-Type": "text/plain"});
    res.write("Oops... Server error\n");
    res.end();
    console.log(err2.message);
    console.log(err2.stack);
    return;
  }
}).listen(8080, '0.0.0.0');
console.log('Server running at http://127.0.0.1:8080/');