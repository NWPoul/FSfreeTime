// eslint-disable-next-line no-unused-vars
var devMode = false; // toggle for dev mode links/res on dev pages or not

//GLOBAL NAME SPACE
const GVAR = {
  user: '',
  userPs: '',
  userData: {},
  bookingData: {},
  stDate: '',
  endDate: '',
  mainTableState: {},

  GMToffset: new Date().getTimezoneOffset() * 60000
};
/* global
 setUser,

 getDates,
 getBookingData,
 proceedBookingData
*/
// ===== END GLOBAL NAME SPACE =====


// !!! START POINT !!!
function start() {
  var mainTableStatus = document.getElementById('mainTable');
  mainTableStatus.innerHTML = '<tr><td>Нужна авторизация! Нажмите "Log_in"</td></tr>';

  setUser();
  getDates();
  getBookingData(GVAR.stDate, GVAR.endDate)
    .then( bookingData => {
      GVAR.bookingArr = proceedBookingData(bookingData);
      Global2(GVAR.bookingArr, 1);
      let bookingObj = proceedBookingArrToObj( GVAR.bookingArr );
      Global2(bookingObj, 2);
    });

  mainTableStatus.innerHTML = '<tr><td>Loading data...</td></tr>';

    //testing

    // let bookingData = getTestData('newCSV');
    // GVAR.bookingArr = proceedBookingData(bookingData);
    // Global(GVAR.bookingArr);




}// end start














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
