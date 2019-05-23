// eslint-disable-next-line no-unused-vars
var devMode = false; // toggle for dev mode links/res on dev pages or not

//GLOBAL NAME SPACE
var user;
var userPs;
var userData;

var raspData;
var stDate;
var endDate;
// eslint-disable-next-line no-unused-vars
var APIanswer;
var mainTableState;
var swapDialogData = {};

/* global
 logIn,
 setLoginButtonText,
 getBookingDataAndSetTable,
 showTableState,


*/



// ===== END GLOBAL NAME SPACE =====


// !!! START POINT !!!
// eslint-disable-next-line no-unused-vars
function start() {
  //localStorage.removeItem('author'); //избавляемся от записи прошлой версий!
  var mainTableStatus = document.getElementById('mainTable');

  if ( localStorage.getItem('user') ) {
    user = localStorage.getItem('user');
    userPs = localStorage.getItem('userPs');
    userData = localStorage.getItem('userData');

    setLoginButtonText(user);
    getBookingDataAndSetTable();
    mainTableStatus.innerHTML = '<tr><td>Loading data...</td></tr>';

  } else {
    mainTableStatus.innerHTML = '<tr><td>Нужна авторизация! Нажмите "Log_in"</td></tr>';
    logIn();
  }

}// end start














function lookButton() {
  if(!stDate) getDates();
  getBookingDataAndSetTable (stDate, endDate);
}

function checkTD(actTD) {
  if( actTD.classList.contains('check') ) {return;}

  var actTDiD = actTD.id;
  actTD.classList.add('check');
  mainTableState.tdChecked[actTDiD] = true;
  mainTableState.checkCnt++;
  // showTableState();//debug
}  // ======================= end check td

function uncheckTD(actTD) {
  if( !actTD.classList.contains('check') ) {return;}

  var actTDiD = actTD.id;
  actTD.classList.remove('check');
  delete mainTableState.tdChecked[actTDiD];
  mainTableState.checkCnt--;
  // showTableState();//debug
}  // ===================== end uncheck td

function closeDialog() {
  var dialogDiv = document.getElementById('swapDialog');
  dialogDiv.innerHTML = '';
  dialogDiv.style.display = 'none';
  mainTableState.checkMute = false;
} //===== END closeDialog  ============================================ closeDialog








// function test() {
//   var testVal;
//   for (var i = 0; i <= 47; i++) {
//     var arg = timeIndexFunc(i, 'time');
//     testVal =  timeIndexFunc(arg, 'next');
//     console.log(arg+'-'+testVal);
//   }
// }
