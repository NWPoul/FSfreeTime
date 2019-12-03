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
 disableCSS
 setUser
 getDates
 getBookingData
 proceedBookingData
 proceedBookingArrToObj
 runTable
 setButtonText
 setButtonVis
 scrollToCurrentTime
*/

// ===== END GLOBAL NAME SPACE =====


// !!! START POINT !!!
function start() {
  let mainTable = document.getElementById('mainTable');
  mainTable.innerHTML = '<tr><td>Нужна авторизация! Нажмите "Log_in"</td></tr>';

  setUser();
  getDates();
  getBookingData(GVAR.stDate, GVAR.endDate)
    .then( bookingData => {
      GVAR.bookingData = bookingData;
      GVAR.bookingArr = proceedBookingData( GVAR.bookingData );
      GVAR.bookingObj = proceedBookingArrToObj( GVAR.bookingArr );

      initMode();
    });
  mainTable.innerHTML = '<tr><td>Loading data...</td></tr>';
}// end start





function initMode() {
  if(GVAR.dayHeaderObserver) {
    console.log('Disconection of GVAR.dayHeaderObserver /initMode');
    GVAR.dayHeaderObserver.disconnect();
  }

  switch (MODE) {
  case 'freetime':
    setButtonText('setMintimeButton', GVAR.minTime + '\'') ;
    setButtonVis('setMintimeButton', true);
    setButtonVis('homeButton', false);

    // setButtonVis('prevDayButton', false);
    // setButtonVis('nextDayButton', false);

    runTable(GVAR.bookingObj, 'freetime');

    disableCSS('freetimeCSS', false);
    disableCSS('bookingsCSS', true);


    break;

  default: //'bookings'
    setButtonVis('homeButton', true);
    setButtonVis('setMintimeButton', false);

    // setButtonVis('prevDayButton', true);
    // setButtonVis('nextDayButton', true);

    runTable(GVAR.bookingArr, 'bookings');

    disableCSS('bookingsCSS', false);
    disableCSS('freetimeCSS', true);

  }//end swich
}


function changeMode(callMode) {
  if (callMode) {
    MODE = callMode;
  } else if (MODE == 'freetime') {
    MODE = 'bookings';
  } else {
    MODE = 'freetime';
  }
  initMode();
} // end changeMode








function homeButtonClick() {
  scrollToCurrentTime();
}

function setMintime() {
  GVAR.minTime = prompt('Looking for ... (min)', 15);
  setButtonText('setMintimeButton', GVAR.minTime + '\'');
  runTable (GVAR.bookingObj, 'freetime');
}// end setMinTime

function reloadButtonClick() {
  if(GVAR.dayHeaderObserver) {
    console.log('Disconection of GVAR.dayHeaderObserver /reload button');
    GVAR.dayHeaderObserver.disconnect();
  }
  start();
  // let res = bench( null, 100)
  // alert(res);
}