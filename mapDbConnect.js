(function() {
  var dbUrl = 'localhost/almost3d';
  var collections = ['map'];
  var db = require('mongojs').connect(dbUrl, collections);
  var util = require('util');
  
  db.cardsmain.ensureIndex({name:1}, {unique:true});
  
  module.exports.card = function(name, type, className, damage, cost, recharge) {
    this.name = name;
    this.type = type;
    this.className = className
    this.damage = damage;
    this.cost = cost;
    this.recharge = recharge;
  }

  isInt = function (value) {
    if(/^\-?([0-9]+)$/.test(value))
      return true;
    return false;
	}
  
  module.exports.addCard = function(passedCard, fn) {
    db.cardsmain.save(passedCard, function(err, savedCard) {
      if (err || !savedCard) fn("<p>Card " + passedCard.name + " not saved because of the following error: " + err + ".</p>");
      else fn("<p>Card " + savedCard.name + " saved.</p>");
    });
  }
}());