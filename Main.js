var http = require('http');
var url = require('url');
var cardDb = require('./cardDbConnect');
var fs = require('fs');
var jade = require('jade');

var userID = "";

var server = http.createServer(function (req, res) {
  var uri = url.parse(req.url).pathname;
  if (uri == "/" || uri == "/index")
  {
    uri = "/index.jade";
  }
  
  handleFile(uri, req, res);
});

var handleFile = function(uri, req, res) {
  var type = 'text/html';
  if(uri.substring(uri.length, uri.length - 5) == ".jade") {
    if(uri == "/index.jade") {
      cardDb.findMenu({},function(err, docs){
        jade.renderFile(__dirname + uri, {menu:docs},
        function(err, data) {
          if (err) {
            res.writeHead(500);
            return res.end('Error loading ' + uri + "\n" + err);
            console.log(err);
          }
          res.writeHead(200,{'Content-Length': data.length,'Content-Type': type});
          res.end(data);
        });
      })
    } else {
      jade.renderFile(__dirname + uri, 
      function(err, data) {
        if (err) {
          res.writeHead(500);
          return res.end('Error loading ' + uri + "\n" + err);
          console.log(err);
        }
        res.writeHead(200,{'Content-Length': data.length,'Content-Type': type});
        res.end(data);
      });
    }
  }
  fs.readFile(__dirname + uri, "binary",
  function (err, data) {
    if (err) {
      res.writeHead(500);
      return res.end('Error loading ' + uri + "\n" + err);
    }
    if(uri.substring(uri.length, uri.length - 3) == ".js") type = 'text/javascript';
    if(uri.substring(uri.length, uri.length - 4) == ".css") type = 'text/css';
    res.writeHead(200,{'Content-Length': data.length,'Content-Type': type});
    res.end(data);
  }); 
}

var io = require('socket.io').listen(server);

server.listen(8124);

io.sockets.on('connection', function (socket) {
  socket.on('addCard', function (name, type, cardClass, damage, cost, cast, fn) {
    var cardToAdd = new cardDb.card(name, type, cardClass, damage, cost, cast);
    cardDb.addCard(cardToAdd, function(msg){
      fn(msg);
    });
  });
  socket.on('openPanel', function (panelName, fn) {
    switch (panelName) {
      case "cardAdmin":
        fn(jade.renderFile(__dirname + "/Panels/CardAdminPanel.jade"));
        break;
      case "cardManagement":
        cardDb.findCards({},function(err, cardDocs){
          cardDb.getProfessions(function(err, profDocs) {
            fn(jade.renderFile(__dirname + "/Panels/CardManagementPanel.jade", {cards:cardDocs, professions:profDocs}));
          });
        });
        break;
      case "signInPanel":
        fn(jade.renderFile(__dirname + "/Panels/SignInPanel.jade"));
        break;
      case "signOutPanel":
        fn(jade.renderFile(__dirname + "/Panels/SignOutPanel.jade"));
        break;
    }
  });
  socket.on('signIn', function(userName, fn) {
    cardDb.findUser({displayName:userName},function(err,doc){
      if(doc) {
        userID = doc._id;
        socket.emit('showSignIn', doc.displayName);
      } else {
        fn("Invalid Username.");
      }
    });
  });
  socket.on('signOut', function() {
    userID = "";
  });
});