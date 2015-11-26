var http = require('http');
var path = require("path");
var fs = require("fs");
var url = require("url");

var model = require('./model');

var port = (process.env.PORT || 5000);

function logRequest(req, code) {
  var user_agent = req.headers['user-agent'];
  console.log(new Date().toTimeString() + " " + req.connection.remoteAddress + " " + req.method + " " + req.url + " " + code + " " + user_agent);
}

http.createServer(function (req, res) {
  try {
    var parsed_url = url.parse(req.url, true);
    var uri = parsed_url.pathname;

    var base_path = process.cwd();
    var filename = path.normalize(path.join(base_path, uri));

    if (filename.indexOf(base_path) < 0) {
      logRequest(req, 403);
      res.writeHead(403, {"Content-Type": "text/plain"});
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
              logRequest(req, 500);
              res.writeHead(500, {"Content-Type": "text/plain"});
              res.write(err + "\n");
              res.end();
              return;
            }

            logRequest(req, 200);
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
                logRequest(req, 200);
                res.writeHead(200,
                  {
                    "Content-Type": "application/octet-stream",
                    "Content-Disposition": "attachment; filename=\"" + builder.getMRCFileName() + "\";"
                  }
                );
                res.write(builder.getMRCFile());
                res.end();
              }        
          } else {
            logRequest(req, 404);
            res.writeHead(404, {"Content-Type": "text/plain"});
            res.write("404 Not Found\n");
            res.end();
            return;
          }
        }
      } catch (err1) {
        logRequest(req, 500);
        res.writeHead(500, {"Content-Type": "text/plain"});
        res.write("Oops... Server error\n");
        res.end();
        console.log(err1.message);
        console.log(err1.stack);
      }
    });
  } catch (err2) {
    logRequest(req, 500);
    res.writeHead(500, {"Content-Type": "text/plain"});
    res.write("Oops... Server error\n");
    res.end();
    console.log(err2.message);
    console.log(err2.stack);
    return;
  }
}).listen(port, '0.0.0.0');
console.log('Server running at http://127.0.0.1:' + port);