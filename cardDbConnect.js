(function() {
  var dbUrl = 'localhost/cards';
  var collections = ['cardsmain','menu','users'];
  var db = require('mongojs').connect(dbUrl, collections);
  var util = require('util');
  
  db.cardsmain.ensureIndex({name:1}, {unique:true});
  
  module.exports.card = function(name, type, className, damage, cost, cast) {
    this.name = name;
    this.type = type;
    this.className = className
    this.damage = damage;
    this.cost = cost;
    this.cast = cast;
  }

  module.exports.findCards = function(criteria, fn) {
    db.cardsmain.find(criteria, fn);
  }
  
  module.exports.getProfessions = function(fn) {
    db.cardsmain.distinct('className', fn);
  }
  
  module.exports.findMenu = function(criteria, fn) {
    db.menu.find(criteria, fn);
  }
  
  module.exports.findUser = function(criteria, fn) {
    db.users.findOne(criteria, fn);
  }
  
  isInt = function (value)
	{
    if(/^\-?([0-9]+)$/.test(value))
      return true;
    return false;
	}
  
  module.exports.addCard = function(passedCard, fn) {
    var correctCard = true;
    var msg = "";
    if(passedCard.name == ""){
      correctCard = false;
      msg += "<p>A name is required.</p>";
    } else if(db.cardsmain.find({name:passedCard.name}).length == 1) {
      correctCard = false;
      msg += "<p>A card with this name already exists.</p>";
    }
    if(passedCard.type == ""){
      correctCard = false;
      msg += "<p>A type is required.</p>";
    }
    if(passedCard.className == ""){
      correctCard = false;
      msg += "<p>A class name is required.</p>";
    }
    if(!isInt(passedCard.damage)){
      correctCard = false;
      msg += "<p>A numeric damage amount is required.</p>";
    }
    if(!isInt(passedCard.cost)){
      correctCard = false;
      msg += "<p>A numeric cost amount is required.</p>";
    }
    if(!isInt(passedCard.cast)){
      correctCard = false;
      msg += "<p>A numeric cast time amount is required.</p>";
    }
    if(!correctCard){
      fn(msg);
      return;
    }
    db.cardsmain.save(passedCard, function(err, savedCard) {
      if (err || !savedCard) fn("<p>Card " + passedCard.name + " not saved because of the following error: " + err + ".</p>");
      else fn("<p>Card " + savedCard.name + " saved.</p>");
    });
  }
}());