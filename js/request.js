
/*global
 GVAR
 _date

 promisedPOST
 start
 setButtonText

*/
function inputDate() {
  let startDateInput = document.getElementById('startDateInput');
  let startDateButton = document.getElementById('startDateButton');

  let stDate = startDateInput.value;
  stDate = new Date(stDate);

  setButtonText('startDateButtonText', stDate.toLocaleDateString());

  stDate.setDate(stDate.getDate() - 1); //also take data for prev day
  let stDateStr = _date.dateToYYYYMMDD(stDate, '-');
  GVAR.stDate = stDateStr;

  getDates();
  start();
}

function getDates(buttonCall) {
  if (!GVAR.stDate) {
    let startDateInput = document.getElementById('startDateInput');

    let stDate = new Date();

    setButtonText('startDateButtonText', stDate.toLocaleDateString());

    stDate.setDate(stDate.getDate() - 1); //also take data for prev day
    let stDateStr = _date.dateToYYYYMMDD(stDate, '-');
    GVAR.stDate = stDateStr;
  }

  let endDate = new Date(GVAR.stDate);
  endDate.setDate(endDate.getDate() + 15);
  GVAR.endDate = _date.dateToYYYYMMDD(endDate, '-');

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

    'login':                  GVAR.user,
    'password':               GVAR.userPs,
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

async function getSwVersion (stDate, endDate) {
  var url = 'https://fakeURLForSWGetVersion';

  var params = { 'method': 'POST' };

  return promisedPOST (url, params)
    .catch(error => {
      console.error('SW version request Failed!', error);
      return false;
    })
    .then(response => {
      return response;
    });

}//end getSwVersion







//////////////////////////////////////////////////////////////////////////////////////////////////////////
/////   Authorisation module /////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////

function setUser() {
  if ( localStorage.getItem('user') &&
       localStorage.getItem('userPs') ) {

    GVAR.user = localStorage.getItem('user');
    GVAR.userPs = localStorage.getItem('userPs');
    GVAR.userData = localStorage.getItem('userData');
    setButtonText('loginButton', GVAR.user.slice(0, 6));
  } else {
    logIn();
  }
}

function logIn () {
  let user = prompt( 'введите Ваш  (e-mail) в системе', '' );
  let ps = prompt('введите Ваш пароль в системе', '');
  if (!user || !ps) {
    alert('user and password required!');
    return;
  }
  storeUser(user, ps);
  setButtonText( 'loginButton', user.slice(0, 6) );
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
  setButtonText('loginButton', 'Log in');
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







//////////////////////////////////////////////////////////////////////////////////////////////////////////
/////   additional functional module /////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////

function callRaspPage(e) {
  let targetDay = e.srcElement.dataset.day;

  let url = 'http://booking.flystation.net/Control/Booking/Timetable/?';
  let params = {
    'wtime':                 targetDay,
    'login':                 GVAR.user,
    'password':              GVAR.userPs
  };

  let qString = '';
  for (let param in params){
    qString += '&' + param + '=' + params[param];
  }
  let reqString = url+qString;
  window.open(reqString);
}

function getBookingSummary(bookingId) {
  // let e = {
  //   srcElement: {dataset: {day: '20190805'}}
  // }
  // callRaspPage(e)
  let url = 'https://booking.flystation.net/Control/My/getBookingSummary?';
  let params = {
    'bookingid':                 282562,
    'login':                 'instruktor@flystation.net',
    'password':              'hfcgbcfybt'
  };

  let qString = '';
  for (let param in params){
    qString += '&' + param + '=' + params[param];
  }
  let reqString = url+qString;
  window.open(reqString);
}


function prevDayButtonClick() {
  switch ( MODE ) {

  case 'bookings':
    moveToDay('prev');
    break;

  case 'freetime':
    moveToBlock('prev');
    break;
  }
}

function nextDayButtonClick() {
  switch ( MODE ) {

  case 'bookings':
    moveToDay('next');
    break;

  case 'freetime':
    moveToBlock('next');
    break;
  }
}

function moveToDay(direction) {
  let anchorId, yRef, yOffset, dayOffset;

  if (direction == 'next') {
    anchorId = 'inner';
    yRef = 'bottom';
    yOffset = -30;
    dayOffset = +1;

  } else {
    anchorId = 'divHeader';
    yRef = 'bottom';
    yOffset = 10;
    dayOffset = -1;
  }

  let curElem = findCurElem(anchorId, 10, yOffset, yRef);
  let curTr = findParent(curElem, 'TR')
  let curTrId = curTr.id;
  let curDateN = +curTr.id.slice(0,5);
  let targedDateN = +curDateN +dayOffset;
  let targetId = targedDateN +'_0';

  // console.log('moveToDay ', curTr);

  scrollToElement( targetId, true, {block: 'center', behavior: 'instant'} );
}

function moveToBlock(direction) {
  let startDateInput = document.getElementById('startDateInput');
  let curStDate = GVAR.stDate;
  let curEndDate = GVAR.endDate;

  let newStDate;

  switch (direction) {
  case 'next':
    newStDate = curEndDate;
    break;

  case 'prev':
    newStDate = new Date(curStDate);
    newStDate.setDate(newStDate.getDate() - 13);
    newStDate = _date.dateToYYYYMMDD(newStDate, '-');
    break;
  }

  startDateInput.value = newStDate;
  inputDate();
}