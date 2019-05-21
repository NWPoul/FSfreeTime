
/*global
 user,
 userPs,
 raspData,

 loginRequest,
 parseTdIndex,
 defineShift,
 uploadChanges,
 reset
 */

//////////////////////////////////////////////////////////////////////////////////////////////////////////
/////   Authorisation module /////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////

function logIn () {

  let preUser = prompt( 'введите Ваш login в системе', '-' );
  let ps = prompt('введите Ваш пароль в системе', '');

  storeUser(preUser, ps);
}

// eslint-disable-next-line no-unused-vars
function storeUser(preUser, ps) {
  if (!preUser || !ps) return;
  localStorage.setItem('user', preUser);
  localStorage.setItem('userPs', ps);
  user = preUser;
  userPs = ps;
}

function logOut() {
  localStorage.removeItem('user');
  localStorage.removeItem('userPs');
  user = null;
  userPs = null;
  setLoginButtonText('Log in');
}

function setLoginButtonText(text) {
  if (!text) return;
  var loginButton = document.getElementById('loginButton');
  loginButton.innerText = text;
}

// eslint-disable-next-line no-unused-vars
function loginButtonClick(button) {
  if (!button || button.id != 'loginButton') return;
  if (button.innerHTML != 'Log in') {
    var out = confirm('выйти?');
    if (out) logOut();
    return;
  }
  logIn();
}