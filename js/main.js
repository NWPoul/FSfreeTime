// eslint-disable-next-line no-unused-vars
var devMode = false; // toggle for dev mode links/res on dev pages or not

//GLOBAL NAME SPACE
var user;
var userPs;
var userData;

var raspData;          // массив с расписанием смен из гугла
var stDate;   // массив с данными сделаных запросов
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

}







// table On Click for SWAP ---------------

// eslint-disable-next-line no-unused-vars
function cellOnClick2swap(event) {

  console.log(event.type);


  if (event.target.tagName != 'TD' ||
            event.target.cellIndex < 2   ||         // не слушаем столбцы с инструкторами и со вчерашней датой
           !event.target.nextElementSibling   ||    // не слушаем последний столбец
            event.target.parentNode.rowIndex == 0) {return;}

  if (mainTableState.checkMute) {return;}       // check if table is locked/muted

  var actTD = event.target;
  var actTDiD = actTD.id;

  if (mainTableState.tdChecked[actTDiD]) {
    uncheckTD(actTD);
  } else {
    checkTD(actTD);
    if (event.type == 'contextmenu') {
      swapDialogData.checkedTdIds = [];
      swapDialogManual(actTDiD);
      return false;
    }
    if (mainTableState.checkCnt == 2) { swapModule(); }    // function swapModule() is on swapDialog.html file!
  }
} //=================================== END table On Click for SWAP


function checkTD(actTD) {
  if( actTD.classList.contains('check') ) {return;}

  var actTDiD = actTD.id;
  actTD.classList.add('check');
  mainTableState.tdChecked[actTDiD] = true;
  mainTableState.checkCnt++;

  showTableState();//debug
}  // ======================= end check td

function uncheckTD(actTD) {
  if( !actTD.classList.contains('check') ) {return;}

  var actTDiD = actTD.id;
  actTD.classList.remove('check');
  delete mainTableState.tdChecked[actTDiD];
  mainTableState.checkCnt--;

  showTableState();//debug
}  // ===================== end uncheck td

function parseTdIndex(tdId) {
  var index = tdId.slice(1).split('c').map(Number); //"r_c_" => cut "r" split on "c" and => number
  return index;
}  //================= end parse TdIndex

function isTdChanged(tdId) {
  var actTD = document.getElementById(tdId);
  var tdIndex = parseTdIndex(tdId);

  var curShift = actTD.innerHTML;
  var setShift = raspData[ tdIndex[0] ][ tdIndex[1] ],
    defSetShift = defineShift(setShift);

  if (curShift == '-' || curShift == 'no') {curShift = '';} // Костыль для срвнения пустых смен таблицы с данными из расписания

  return (curShift !== setShift &&          //проверка полного совпадения имен (для undo change)
          curShift !== defSetShift.Name);   //проверка с приведенным именем из исходного расписания (для change)
} //===== END isTdChanged  ============================================ isTdChanged

function closeDialog() {
  var dialogDiv = document.getElementById('swapDialog');
  dialogDiv.innerHTML = '';
  dialogDiv.style.display = 'none';
  mainTableState.checkMute = false;
} //===== END closeDialog  ============================================ closeDialog

