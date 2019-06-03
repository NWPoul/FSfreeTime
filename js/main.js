// eslint-disable-next-line no-unused-vars
var DEVMOD = false; // toggle for dev mode links/res on dev pages or not
var MODE = 'freetime'; //'bookings'

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
      GVAR.bookingArr = proceedBookingData(bookingData);
      GVAR.bookingObj = proceedBookingArrToObj( GVAR.bookingArr );
      testingrunTable(GVAR.bookingObj, 'freetime');
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
  } else {
    MODE = 'freetime';
  }

  testingrunTable(dataForTable, MODE);

} // end changeMode














function lookButton() {
  start();
}

function checkTD(actTD) {
  if( actTD.classList.contains('check') ) {return;}

  var actTDiD = actTD.id;
  actTD.classList.add('check');
  GVAR.mainTableState.tdChecked[actTDiD] = true;
  GVAR.mainTableState.checkCnt++;
  // showTableState();//debug
}  // ======================= end check td

function uncheckTD(actTD) {
  if( !actTD.classList.contains('check') ) {return;}

  var actTDiD = actTD.id;
  actTD.classList.remove('check');
  delete GVAR.mainTableState.tdChecked[actTDiD];
  GVAR.mainTableState.checkCnt--;
  // showTableState();//debug
}  // ===================== end uncheck td

function closeDialog() {
  var dialogDiv = document.getElementById('swapDialog');
  dialogDiv.innerHTML = '';
  dialogDiv.style.display = 'none';
  GVAR.mainTableState.checkMute = false;
} //===== END closeDialog  ============================================ closeDialog
