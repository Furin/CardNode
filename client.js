var socket = io.connect();

var signInFunctionReference;

function addCard(){
  var result = document.getElementById('addCardResult');
  var name = document.getElementById('addCardName');
  var type = document.getElementById('addCardType');
  var cardClass = document.getElementById('addCardClass');
  var damage = document.getElementById('addCardDamage');
  var cost = document.getElementById('addCardCost');
  var cast = document.getElementById('addCardCast');
  result.innerHTML = "";
  socket.emit('addCard', name.value, type.value, cardClass.value, damage.value, cost.value, cast.value, function (data) {
    name.value = "";
    type.value = "";
    cardClass.value = "";
    damage.value = "";
    cost.value = "";
    cast.value = "";
    result.innerHTML = data; 
  });
}

var signIn = function() {
  var result = document.getElementById('signInResult')
  var signInID = document.getElementById('signInID').value
  result.innerHTML = "";
  socket.emit('signIn', signInID, function (data) {
    result.innerHTML = data; 
  });
}

var signOut = function() {
  socket.emit('signOut');
  var signInButton = document.getElementById('openSignIn');
  signInButton.innerHTML = 'Sign In';
  signInButton.removeEventListener('click', signInFunctionReference);
  if(panelManagement(document.getElementById('signInPanel'))){
    socket.emit('openPanel', 'signInPanel', function(data) {
      document.getElementById('userInterface').insertAdjacentHTML('beforeend', data);
    });
  }
  panelHandler('openSignIn', 'signInPanel', 'openPanel', 'signInPanel', function() {
    document.getElementById('submitSignIn').addEventListener('click',signIn);
  });
  document.getElementById('signInID').value = "";
}

socket.on('showSignIn', function(data) {
  var signInButton = document.getElementById('openSignIn');
  signInButton.innerHTML = 'Signed in as ' + data;
  signInButton.removeEventListener('click', signInFunctionReference);
  if(panelManagement(document.getElementById('signOutPanel'))){
    socket.emit('openPanel', 'signOutPanel', function(data) {
      document.getElementById('userInterface').insertAdjacentHTML('beforeend', data);
      document.getElementById('submitSignOut').addEventListener('click',signOut);
    });
  }
  panelHandler('openSignIn', 'signOutPanel', 'openPanel', 'signOutPanel', function() {
    document.getElementById('submitSignOut').addEventListener('click',signOut);
  });
});

window.onload = function() {
  var uiItems = document.getElementById('userInterface').getElementsByTagName('li');
  for (var i = 0; i < uiItems.length; ++i) {
    uiItems[i].style.width = (100 / uiItems.length) + "%";
  }
  
  panelHandler('openCardAdmin', 'cardAdminPanel', 'openPanel', 'cardAdmin', function() {
    document.getElementById('addCardSend').addEventListener('click',addCard);
  });
  panelHandler('openCardManagement', 'cardManagementPanel', 'openPanel', 'cardManagement', function() {
    var deckNavItems = document.getElementById('deckNav').getElementsByTagName('li');
    for (var i = 0; i < deckNavItems.length; ++i) {
      deckNavItems[i].style.width = (100 / deckNavItems.length) + "%";
    }
  });
  panelHandler('openSignIn', 'signInPanel', 'openPanel', 'signInPanel', function() {
    document.getElementById('submitSignIn').addEventListener('click',signIn);
  });
}

var panelHandler = function(liID, panelID, emit, emitParam, fn) {
  document.getElementById(liID).addEventListener("click", function() {
    if(liID == 'openSignIn') signInFunctionReference = arguments.callee;
    if(panelManagement(document.getElementById(panelID))){
      socket.emit(emit, emitParam, function(data) {
        document.getElementById('userInterface').insertAdjacentHTML('beforeend', data);
        fn();
      });
    }
  });
}



var panelManagement = function(panel) {
  var uiPanels = document.getElementsByClassName('uiPanel');
  for (var i = 0; i < uiPanels.length; ++i) {
    if(!panel || uiPanels[i].id != panel.id) {
      uiPanels[i].style.display = 'none';
    }
  }
  if(!panel){
    return true;
  } else {
    panel.style.display = "";
    return false;
  }
}