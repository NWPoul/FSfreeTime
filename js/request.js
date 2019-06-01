
/*global
 GVAR,

 promisedPOST,
 _date,

*/


function getDates(buttonCall) {
  let today = new Date();
  let todayStr = _date.dateToYYYYMMDD(today);
  let startDateInput = document.getElementById('startDate');

  if (!GVAR.stDate) {
    GVAR.stDate = todayStr;
  }

  if (buttonCall) {
    GVAR.stDate = startDateInput.value;
    start();
  } else {
    startDateInput.value = GVAR.stDate;
  }



  let endDate = new Date(GVAR.stDate);
  endDate.setDate(endDate.getDate() + 15);
  GVAR.endDate = _date.dateToYYYYMMDD(endDate);

  return {
    stDate: GVAR.stDate,
    endDate: GVAR.endDate
  };
}// end getDatesFromSS



async function getBookingData (stDate, endDate) {
  var url = 'https://booking.flystation.net/Control/Booking/ListBooking'
           +'/loadDataList'
           +'/0/1/1';

  var params = {
  // '_search': "false",  GFilter[search]': '',  'GFilterReset': 1,
    'method': 'POST',

    'login':                 'instruktor@flystation.net',
    'password':              'hfcgbcfybt',
    'GFilter[filtermore]':    1,
    'GFilter[bookingactive]': 'y',
    'GFilter[dateid]':        'bookingtimefly',
    'GFilter[sdate]':         stDate,
    'GFilter[edate]':         endDate
  };

  return promisedPOST (url, params)
    .catch(error => {
      console.error('Failed!', error);
      return( [ ['Loading error'], [error] ] );
    })
    .then(response => {
      return response;
    });

}//end getBookingData


function setMinTime() {
  GVAR.minTime = prompt('Looking for ... (min)', 15);
  setButtonText('minTimeButton', GVAR.minTime +' min');
  start();
}




//////////////////////////////////////////////////////////////////////////////////////////////////////////
/////   Authorisation module /////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////

function setUser() {
  if ( localStorage.getItem('user') &&
       localStorage.getItem('userPs') ) {

    GVAR.user = localStorage.getItem('user');
    GVAR.userPs = localStorage.getItem('userPs');
    GVAR.userData = localStorage.getItem('userData');
    setLoginButtonText(GVAR.user);
  } else {
    logIn();
  }
}

function logIn () {
  let user = prompt( 'введите Ваш login в системе', '' );
  let ps = prompt('введите Ваш пароль в системе', '');
  if (!user || !ps) {
    alert('user and password required!');
    return;
  }
  storeUser(user, ps);
  setLoginButtonText(user);
}

// eslint-disable-next-line no-unused-vars
function storeUser(user, ps) {
  localStorage.setItem('user', user);
  localStorage.setItem('userPs', ps);
  GVAR.user = user;
  GVAR.userPs = ps;
}

function logOut() {
  localStorage.removeItem('user');
  localStorage.removeItem('userPs');
  GVAR.user = null;
  GVAR.userPs = null;
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
