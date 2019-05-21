
/*global
 user,
 userPs,
 raspData,
 stDate,
 endDate

 promisedPOST,
 dateToYYYYMMDD,
 parseCSV
*/


function getDates() {
  if (!stDate){
    stDate ='2019-05-21';
    // stDate = prompt('Start Date YYYY-MM-DD:');
  }
  endDate = new Date(stDate);
  endDate.setMonth(endDate.getMonth() + 1);
  //   stDate = dateToYYYYMMDD(stDate);
  endDate = dateToYYYYMMDD(endDate);

  return {
    stDate: stDate,
    endDate: endDate
  };
}// end getDatesFromSS


function getBookingDataAndSetTable (stDate, endDate) {
  if (!stDate) { var dates = getDates(); }
  
  stDate = dates.stDate || '2019-05-21';
  endDate = dates.endDate || '2019-05-23';

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

  promisedPOST (url, params)
    .catch(error => {
      console.error('Failed!', error);
      return( [ ['Loading error'], [error] ] );
    })
    .then(response => handlingGetBookingResponse(response) );
}//end getBookingData







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