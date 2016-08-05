var http = require('http');
var path = require("path");
var fs = require("fs");
var url = require("url");

var model = require("./model");
var model_server = require("./model_server");
var config = require('./config');

function logRequest(req, code) {
  var user_agent = req.headers['user-agent'];
  console.log(new Date().toTimeString() + " " + req.connection.remoteAddress + " " + req.method + " " + req.url + " " + code + " " + user_agent);
}

function handleExistentFile(req, res, fs, filename) {
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
}

function handleDownloadWorkout(req, res, uri, params) {
  if (params.w && params.ftp && params.tpace && params.st && params.ou && params.email) {
    var userProfile = new model.UserProfile(params.ftp, params.tpace, params.css, params.email);
    var builder = new model.WorkoutBuilder(userProfile, params.st, params.ou).withDefinition(params.t, params.w);
    logRequest(req, 200);

    var workout_filename = "";
    var workout_content = "";

    if (uri === "/workout.mrc") {
      workout_filename = builder.getMRCFileName();
      workout_content = builder.getMRCFile();
    } else {
      workout_filename = builder.getZWOFileName();
      workout_content = builder.getZWOFile();
    }

    res.writeHead(200,
      {
        "Content-Type": "application/octet-stream",
        "Content-Disposition": "attachment; filename=\"" + workout_filename + "\";"
      }
    );
    res.write(workout_content);
    res.end();
    return true;
  } else {
    return false;
  }
}

function handleSendEmail(req, res, uri, params) {
  if (params.w && params.ftp && params.tpace && params.st && params.ou && params.email) {
    var userProfile = new model.UserProfile(params.ftp, params.tpace, params.css, params.email);
    var builder = new model.WorkoutBuilder(userProfile, params.st, params.ou).withDefinition(params.t, params.w);
    logRequest(req, 200);

    // sending email
    var ms = new model_server.MailSender(config.smtp.server_host, config.smtp.server_port, config.smtp.use_ssl, config.smtp.login, config.smtp.password);

    var attachments = [];

    // Just send the attachment if its a bike workout
    if (builder.getSportType() == model.SportType.Bike) {
      var attachment_mrc = {
        name : builder.getMRCFileName(),
        data : builder.getMRCFile()
      };
      var attachment_zwo = {
        name : builder.getZWOFileName(),
        data : builder.getZWOFile()
      };                
      attachments.push(attachment_zwo);
      attachments.push(attachment_mrc);
    }

    res.write("Sending email...\n");
    ms.send(userProfile.getEmail(), builder.getMRCFileName(), builder.getPrettyPrint("<br />"), attachments, 
      function(status, message) {
          if (status) {
            res.write("Email successfully sent.\n");
          } else {
            res.write("Error while sending email.\n");
          }
          res.end();
      });
    return true;
  } else {
    return false;
  }
}

function handleGetWorkouts(req, res, uri, params) {
  logRequest(req, 200);
  var db = new model_server.WorkoutDB(config.mysql);
  db.connect();
  db.getAll(function(err, workouts) {
    db.close();    
    if (err) {
      res.write("Error");
    } else {
      res.write(JSON.stringify(workouts));
      res.end();            
    }
  });
}

function show404(req, res) {
  logRequest(req, 404);
  res.writeHead(404, {"Content-Type": "text/plain"});
  res.write("404 Not Found\n");
  res.end();
}

function handleSaveWorkout(req, res, uri, params) {
  logRequest(req, 200);
  var userProfile = new model.UserProfile(params.ftp, params.tpace, params.css, params.email);
  var builder = new model.WorkoutBuilder(userProfile, params.st, params.ou).withDefinition(params.t, params.w);

  var db = new model_server.WorkoutDB(config.mysql);
  db.connect();
  var w = new model_server.Workout();
  w.title = params.t;
  w.value = params.w;
  w.tags = "";
  w.duration_sec = builder.getInterval().getDuration().getSeconds();
  w.tss = builder.getInterval().getTSS();
  w.sport_type = params.st;

  db.add(w);               
  db.close();
  res.write("Workout saved");
  res.end();     
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
          handleExistentFile(req, res, fs, filename);
        } else {
          // make this more generic
          if (uri === "/workout.mrc" || uri === "/workout.zwo") {
            var params = parsed_url.query;
            if (!handleDownloadWorkout(req, res, uri, params)) {
              show404(req, res);              
            }     
          } else if (uri == "/send_mail") {
            var params = parsed_url.query;
			      if (!handleSendEmail(req, res, uri, params)) {
              show404(req, res);
            }
          } else if (uri == "/save_workout") {
            var params = parsed_url.query;
            if (params.w && params.ftp && params.tpace && params.st && params.ou && params.email && params.t) {
              handleSaveWorkout(req, res, uri, params);         
            } else {
              show404(req, res);          
            }
          } else if (uri == "/workouts") {
            var params = parsed_url.query;
            handleGetWorkouts(req, res, uri, params);
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
}).listen(config.port, '0.0.0.0');
console.log('Server running at http://0.0.0.0:' + config.port);
