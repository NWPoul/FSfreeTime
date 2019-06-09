// eslint-disable-next-line no-unused-vars
var DEVMOD = false; // toggle for dev mode links/res on dev pages or not
var MODE = 'bookings'; //'freetime' or 'bookings'

//GLOBAL NAME SPACE
const GVAR = {
  user: '',
  userPs: '',
  userData: {},

  bookingData: {},
  bookingDataMap: {
    timeCol: 0, timeValCol: 1, restRecStCol: 2
  },

  bookingArr: [],
  bookingObj: {},

  stDate: '',
  endDate: '',
  minTime: 15,
  mainTableState: {},

  GMToffset: new Date().getTimezoneOffset() * 60000
};
/* global
 setUser

 getDates
 getBookingData
 proceedBookingData
 proceedBookingArrToObj
 testingrunTable
*/

// ===== END GLOBAL NAME SPACE =====


// !!! START POINT !!!
function start() {
  var mainTableStatus = document.getElementById('mainTable');
  mainTableStatus.innerHTML = '<tr><td>Нужна авторизация! Нажмите "Log_in"</td></tr>';

  setUser();
  getDates();
  getBookingData(GVAR.stDate, GVAR.endDate)
  // asyncGetTestData()
    .then( bookingData => {
      GVAR.bookingData = bookingData;
      GVAR.bookingArr = proceedBookingData( GVAR.bookingData );
      GVAR.bookingObj = proceedBookingArrToObj( GVAR.bookingArr );
      // testingrunTable(GVAR.bookingObj, 'freetime');
      switch (MODE) {
      case 'freetime':
        testingrunTable(GVAR.bookingObj, 'freetime');
        break;
      default: //'bookings'
        testingrunTable(GVAR.bookingArr, 'bookings');
      }//end swich
    });

  mainTableStatus.innerHTML = '<tr><td>Loading data...</td></tr>';

  //testing
  // let bookingData = getTestData('CSV0106');
  // GVAR.bookingArr = proceedBookingData(bookingData);
  // runTable(GVAR.bookingArr);
}// end start


function changeMode(callMode) {
  let dataForTable = GVAR.bookingObj; //default mode

  if (callMode) MODE = callMode;

  if (MODE == 'freetime') {
    MODE = 'bookings';
    dataForTable = GVAR.bookingArr;
    setButtonText('servButton', '↻');

  } else {
    MODE = 'freetime';
    setButtonText('servButton', GVAR.minTime + '\'') ;
  }

  testingrunTable(dataForTable, MODE);
} // end changeMode














function lookButton() {
  // start();
  // let res = bench( null, 100)
  // alert(res);

  scrollToCurrentTime();
}

function servButtonClick(servButton) {
  switch (MODE) {
  case 'freetime':
    setMinTime();
    break;
  case 'bookings':
    start();
    break;
  }
}// end servButtonClick

function setMinTime() {
  GVAR.minTime = prompt('Looking for ... (min)', 15);
  setButtonText('servButton', GVAR.minTime + '\'');
  testingrunTable(GVAR.bookingObj, 'freetime');
}// end setMinTime
