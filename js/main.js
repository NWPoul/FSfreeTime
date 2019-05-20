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


  // if (id) {
  //   // eslint-disable-next-line no-undef
  //   setLoginButtonText( id.slice(0,3) );
  //   // eslint-disable-next-line no-undef
  //   getRaspAndSetTable(); // Start point!
  // } else {
  //   // eslint-disable-next-line no-undef
  //   idRequest();
  // }
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

function shiftCompare(shift1, shift2) {
  var parsedShift = (shift) => {
    return ( /[0vswx-]/i.test(shift) ? '' : shift.replace(/\*+/,'') );
  };
  return ( parsedShift(shift1) === parsedShift(shift2) );
}//end shiftCompare

function defineShift(shift) {
  var shiftObj = {};
  shiftObj.Name = (!shift || /[0vswx-]/i.test(shift) ) ? '' : shift.replace(/\*+/,'');
  shiftObj.Part = [];

  if (shiftObj.Name == '') {
    shiftObj.Type = 'no';
    shiftObj.Cost = 0;

  } else if (/[JЖ]/i.test(shiftObj.Name)) {
    shiftObj.Type = 'Ж';
    shiftObj.Cost = 1;

  } else if (/Д/i.test(shiftObj.Name)) {
    if (/Н/i.test(shiftObj.Name)) {
      shiftObj.Type = 'ДН';
      shiftObj.Part = (/(С*Д\d?)(.*)/i).exec(shiftObj.Name).slice(0, 3); // раскладываем ДН смену в массив [смена, Дчасть, Нчасть] и слайсим лишнее (служебные свойства)
      shiftObj.Cost = 2;
    } else {
      shiftObj.Type = 'Д';
      shiftObj.Cost = 1;
    }
  } else if (/Н/i.test(shiftObj.Name)) {
    shiftObj.Type = 'Н';
    shiftObj.Cost = 1;
  } else {
    shiftObj.Type = 'ub'; // неопознанная смена
    shiftObj.Cost = 0;
  }// END all ifs

  return shiftObj;
}//===== End defineShift =============================================================

//swap Shift -----------------------------------------------------------------------
function swapShift(s1, s2) {
  if (s1.Name == s2.Name || s2.Type == 'ub' || s1.Type == 'ub') {
    return( [[]] );
  }

  var swSimple = [[s2.Name, s1.Name]]; // simple shift swap

  var swapMatrix = {
    s1_no: {
      s2_no: [[]], // for identical shifts
      s2_Ж:  swSimple, // simple swap (for any J)
      s2_Д:  swSimple, // simple swap
      s2_Н:  swSimple,
      s2_ДН: [ [s2.Name, s1.Name], [s2.Part[1], s2.Part[2]], [s2.Part[2], s2.Part[1]] ]
    },
    s1_Ж:  {    // simple swap (for any J)
      s2_no: swSimple,
      s2_Ж:  swSimple,
      s2_Д:  swSimple,
      s2_Н:  swSimple,
      s2_ДН: swSimple
    },
    s1_Д:  {
      s2_no: swSimple,
      s2_Ж:  swSimple,
      s2_Д:  swSimple,
      s2_Н:  [ [s2.Name, s1.Name], [s1.Name + s2.Name, ''], ['', s1.Name + s2.Name] ], // For D vs N
      s2_ДН: [ [s2.Name, s1.Name], [s1.Name + s2.Part[2], s2.Part[1]], [s2.Part[1], s1.Name + s2.Part[2]] ]
    },
    s1_Н: {
      s2_no: swSimple,
      s2_Ж:  swSimple,
      s2_Д:  [ [s2.Name, s1.Name], [s2.Name + s1.Name, ''], ['', s2.Name + s1.Name] ], // For N vs D
      s2_Н:  swSimple,
      s2_ДН: [ [s2.Name, s1.Name], [s2.Part[1] + s1.Name, s2.Part[2]], [s2.Part[2], s2.Part[1] + s1.Name] ]
    },
    s1_ДН: {
      s2_no: [ [s2.Name, s1.Name], [s1.Part[2], s1.Part[1]], [s1.Part[1], s1.Part[2]] ],
      s2_Ж:  swSimple,
      s2_Д:  [ [s2.Name, s1.Name], [s1.Part[1], s2.Name + s1.Part[2]], [s2.Name + s1.Part[2], s1.Part[1]] ],
      s2_Н:  [ [s2.Name, s1.Name], [s1.Part[2], s1.Part[1] + s2.Name], [s1.Part[1] + s2.Name, s1.Part[2]] ],
      s2_ДН: [ [s2.Name, s1.Name], [s1.Part[1] + s2.Part[2], s2.Part[1] + s1.Part[2]], [s2.Part[1] + s1.Part[2], s1.Part[1] + s2.Part[2]] ]
    }
  }; // end swapMatrix

  //Lets go and Swap))
  var s1Indx = 's1_' + s1.Type;
  var s2Indx = 's2_' + s2.Type;

  var swapList = swapMatrix[s1Indx][s2Indx];

  return swapList;

}  //===== End swapShift ===========================================================




///////////////////////////////////////////////////////////
////// SWAP Code--------------------------------------
///////////////////////////////////////////////////////////
//SWAP Code SWAP Code SWAP Code SWAP Code SWAP Code SWAP Code


// SWAP DIALOG-------------------------------------------------

function swapModule() {
  var swSet= {
    tdId: [],
    shiftDate: [],
    instr: [],
    shiftRasp: [],
    shiftTable: []
  };

  swSet.tdId = Object.keys(mainTableState.tdChecked);
  swSet.tdId.sort( (a, b) => {
    return parseTdIndex(a)[0] - parseTdIndex(b)[0];
  });

  swSet.tdId.forEach(function(tdId, i) {
    var tdIndex = parseTdIndex(tdId);
    swSet.shiftDate[i] = raspData[0][ tdIndex[1] ];
    swSet.instr[i] = raspData[ tdIndex[0] ][0];
    swSet.shiftRasp[i] = raspData[ tdIndex[0] ][ tdIndex[1] ];
    swSet.shiftTable[i] = document.getElementById(tdId).innerHTML;
  });

  if (swSet.shiftDate[1] != swSet.shiftDate[0]) {
    alert('Выберите смены на одну дату!');
    uncheckTD( document.getElementById( swSet.tdId[1] )  );
    return;
  }

  swapDialog(swSet);

} //===== END swapModule  =========================================END swapModule

function swapDialog(swSet) {
  var shiftsObj1 = defineShift( swSet.shiftTable[0] ),
    shiftsObj2 = defineShift( swSet.shiftTable[1] );

  var shiftDate = new Date( swSet.shiftDate[0][0] );

  var swOptions = swapShift(shiftsObj1, shiftsObj2);

  var dialogDiv = document.getElementById('swapDialog');

  var swHead = document.createElement('h4');
  var instrRow = '<span style="min-width: 45%; display: inline-block">' + swSet.instr[0] + '</span>'
               + '<span style="min-width: 10%; display: inline-block">' + ' vs ' + '</span>'
               + '<span style="min-width: 45%; display: inline-block">' + swSet.instr[1] + '</span>';

  swHead.innerHTML =  shiftDate.toLocaleDateString('ru', { weekday: 'narrow', year: 'numeric', month: 'long', day: 'numeric' })
                        +'<br>'+
                        instrRow;

  swHead.className = 'swHead';

  dialogDiv.appendChild(swHead);
  console.log(swSet.tdId);
  swOptions.forEach(
    function(item) {
      if(!item.length) return;   //выход если нет вариантов (выбраны пустые ячейки)
      var button = document.createElement('button');
      button.innerHTML = '<div style="min-width: 45%; display: inline-block">' + item[0] + '</div>'
                           + '<div style="min-width: 10%; display: inline-block">' + ' | ' + '</div>'
                           + '<div style="min-width: 45%; display: inline-block">' + item[1] + '</div>';
      button.choise = 'swap';
      button.swapDataSet = {
        tdId: swSet.tdId,
        newShifts: item,
        instr: swSet.instr,
        Date: swSet.shiftDate
      };
      button.className = 'swOption';
      button.onclick = function() { swapDualActionClick(this); };

      dialogDiv.appendChild(button);
    }
  ); // end for each swap list element

  var button = document.createElement('button');
  button.innerHTML =  'Ввести свой вариант';
  button.choise = 'Manual';
  button.className = 'swOption';
  button.tdId = swSet.tdId;
  button.onclick = function() { manualSwapClick(this); };
  dialogDiv.appendChild(button);

  button = document.createElement('button');
  button.innerHTML =  'Отмена';
  button.choise = 'Cancel';
  button.className = 'swOption';
  button.onclick = function() { cancelSwapClick(); };
  dialogDiv.appendChild(button);

  dialogDiv.style.display = 'block';
  mainTableState.checkMute = true;   // mute mainTable

}  //===== END swapDialog  ====================================================END SWAP DIALOG





// MANUAL SWAP DIALOG-------------------------------------------------
function swapDialogManual(tdId) {
  console.log(tdId);
  var tdIndex = parseTdIndex(tdId);
  var shiftDate = new Date(raspData[0][ tdIndex[1] ][0])
    .toLocaleDateString('ru', { weekday: 'narrow', year: 'numeric', month: 'long', day: 'numeric' });
  var instr = raspData[ tdIndex[0] ][0];

  var shiftRasp = raspData[ tdIndex[0] ][ tdIndex[1] ],
    shiftTable = document.getElementById(tdId).innerText;

  var dialogDiv = document.getElementById('swapDialog');
  dialogDiv.swapData = {
    tdId: tdId,
    tdIndex: tdIndex,
    shiftDate: shiftDate,
    instr: instr,
    shiftRasp: shiftRasp,
    shiftTable: shiftTable,
    newShift: ''
  };

  var swHead = document.createElement('h3');
  swHead.innerHTML = ( shiftDate + ' ' +  instr);
  swHead.className = 'swHead manualSwHead';
  dialogDiv.appendChild(swHead);

  var buttonsSet = [
    ['СД','Д1','Д2'],
    ['СН','Н1','Н2'],
    ['Ж', 'Ж1','Ж2']
  ];

  // eslint-disable-next-line no-unused-vars
  buttonsSet.forEach(   function(subset) {
    var setBlock = document.createElement('div');
    setBlock.className = (subset[0] == 'Ж') ? 'swSubsetH' : 'swSubsetV';

    subset.forEach(   function(shift, _j, subset)   {
      var button = document.createElement('button');
      button.innerHTML = shift;

      button.className = (subset[0] == 'Ж') ? 'Jbtn' : 'swOption Vmod';
      button.sType = (subset[0] == 'Ж') ? 'Ж' : 'half';

      button.onclick = function() { swapActionClick(this); };

      setBlock.appendChild(button);   }
    ); // end for each button

    dialogDiv.appendChild(setBlock);   }
  ); // end for each buttun sub set

  var button;

  button = document.createElement('button');
  button.id = 'manualRaspShift';
  button.innerHTML =  shiftRasp +' (из расписания)';
  button.className = 'swOption';
  button.onclick = function() { return manualRaspShift(this); };
  dialogDiv.appendChild(button);

  button= document.createElement('button');
  button.id = 'manualSubmit';
  button.innerHTML =  'Ввести " "';
  button.className = 'swOption Hmod';
  button.onclick = function() { return submitlSwapClick(this); };
  dialogDiv.appendChild(button);

  button = document.createElement('button');
  button.id = 'manualCancel';
  button.innerHTML =  'Отмена';
  button.className = 'swOption Hmod';
  button.onclick = function() { return cancelSwapClick(this); };
  dialogDiv.appendChild(button);

  dialogDiv.style.display = 'block';
  mainTableState.checkMute = true;
  return dialogDiv.innerHTML;

}  //===== END swapDialog MANUAL  =========================================END swapDialog MANUAL



function manualSwapClick(button) {
  swapDialogData.checkedTdIds = button.tdId.slice();
  var curTdId = swapDialogData.checkedTdIds.shift();
  closeDialog();
  swapDialogManual(curTdId);
} //===== END manualSwap  =============================================manualSwap




///// Responces to swapButton click------------------------------------------

function swapActionClick(button) {
  var subset = button.parentElement;
  var subsetBtns = subset.children;
  var dialogDiv = document.getElementById('swapDialog');
  var submitBtn = document.getElementById('manualSubmit');

  var newShift = '';

  [].forEach.call(subsetBtns, function(elem) {
    if (elem===button) {
      elem.classList.toggle('btnCheck');
    } else {
      elem.classList.remove('btnCheck');
    }
  });

  var checkBtns;
  if (button.sType == 'Ж') {
    checkBtns = dialogDiv.getElementsByClassName('Vmod btnCheck');  // Выбираем все отмеченные кнопки со сменами Д* и Н* (им назначались соотв CSS clas)
    checkBtns = Array.prototype.slice.call(checkBtns);            // Фиксируем в массиве (иначе при удалении класса кнопка удалится из коллекции)

    checkBtns.forEach( function(elem) {
      elem.classList.remove('btnCheck');
    });
  } else {
    checkBtns = dialogDiv.getElementsByClassName('Jbtn btnCheck');  // Выбираем отмеченные кнопки со сменами J (им назначались соотв CSS clas)
    if (checkBtns[0]) { checkBtns[0].classList.remove('btnCheck'); }
  } // end if

  checkBtns = dialogDiv.getElementsByClassName('btnCheck'); // Выбираем все отмеченные в итоге кнопки
  checkBtns = Array.prototype.slice.call(checkBtns);

  checkBtns.forEach( function(elem) {
    newShift += elem.innerText;
  });

  dialogDiv.swapData.newShift = newShift;
  submitBtn.innerText = 'Ввести "' + ( (newShift)? newShift : ' ' ) + '"';

} //===== END swapAction  ============================================ swapAction



function swapDualActionClick(button) {
  var tdIDs = button.swapDataSet.tdId;
  var newShifts = button.swapDataSet.newShifts;

  tdIDs.forEach( function(tdID, i) {
    changeShift( tdID, newShifts[i] );
  });

  closeDialog();

} //===== END swapDualActionClick  ============================================swapDualActionClick



function cancelSwapClick() {

  Object.keys(mainTableState.tdChecked).forEach( (tdId) => {
    var curTD = document.getElementById(tdId);
    uncheckTD(curTD);
  });

  closeDialog();
} //===== END cancelSwap  ============================================ cancelSwap

function submitlSwapClick() {
  var dialogDiv = document.getElementById('swapDialog');
  var newShift = dialogDiv.swapData.newShift;
  var actTDiD = dialogDiv.swapData.tdId;

  changeShift(actTDiD, newShift);

  closeDialog();
  var nextTdId = swapDialogData.checkedTdIds.shift();
  if (nextTdId) { swapDialogManual(nextTdId); }
} //===== END submitlSwapClick  ====================================== submit Swap

function manualRaspShift() {
  let dialogDiv = document.getElementById('swapDialog');
  let submitBtn = document.getElementById('manualSubmit');
  let checkBtns = dialogDiv.getElementsByClassName('btnCheck');

  let raspShift = dialogDiv.swapData.shiftRasp;

  dialogDiv.swapData.newShift = raspShift;

  checkBtns = Array.prototype.slice.call(checkBtns);            // Фиксируем в массиве (иначе при удалении класса кнопка удалится из коллекции)
  checkBtns.forEach( function(elem) {
    elem.classList.remove('btnCheck');
  });

  // button.classList.toggle('btnCheck');
  submitBtn.innerText = 'Ввести "' + ( (raspShift)? raspShift : ' ' ) + '"';


  // FOR IMMIDIATE SUBMITTING SHIFT FROM RASP:

  // var actTDiD = dialogDiv.swapData.tdId;
  // var newShift = raspShift;

  // changeShift(actTDiD, newShift);

  // closeDialog();
  // var nextTdId = swapDialogData.checkedTdIds.shift();
  // if (nextTdId) { swapDialogManual(nextTdId); }
} //===== END manualRaspShift  ====================================== manualRaspShift



function changeShift(tdId, newShift) {
  var actTD = document.getElementById(tdId);
  var prevShift = actTD.innerHTML;

  if(actTD.classList.contains('check')) {uncheckTD(actTD);}

  if ( shiftCompare(prevShift, newShift) ) return;

  actTD.innerHTML = newShift;

  if ( isTdChanged(tdId) ) {
    actTD.classList.add('changed');
  } else {
    actTD.classList.remove('changed');
  }

  mainTableState.tdChanged.push(
    { tdId: tdId,
      prevShift: prevShift,
      newShift: newShift }
  );

  localStorage.setItem('mainTableState', JSON.stringify(mainTableState) );
} //===== END changeShift  ============================================ changeShift

function closeDialog() {
  var dialogDiv = document.getElementById('swapDialog');
  dialogDiv.innerHTML = '';
  dialogDiv.style.display = 'none';
  mainTableState.checkMute = false;
} //===== END closeDialog  ============================================ closeDialog

// eslint-disable-next-line no-unused-vars
function undoLastChange() {
  var lastChange = mainTableState.tdChanged.pop();
  if (!lastChange) {return;}

  var tdId = lastChange.tdId,
    shift = lastChange.prevShift;
  changeShift(tdId, shift);
  mainTableState.tdChanged.pop(); // удаляем еще раз послднюю запись о заменах (т.к. она добавилась в этой функции)

  localStorage.setItem('mainTableState', JSON.stringify(mainTableState));

} //===== END undoLastChange  ========================================= undoLastChange

// eslint-disable-next-line no-unused-vars
function helpButtonClick() {
  var helpDiv = document.createElement('div');
  var helpText = `<b>Режимы работы:</b><br>
          <br>
        <b>Авто (основной):</b><br>
        - выбираем день, в нем выбираем (кликаем) пару инструкторов,<br>
        смены которых меняем<br>
        - в открывшемся диалоге выбираем из возможных вариантов<br>
          <br>
        <b>Одиночный-прямой:</b><br>
        -долгий тап в телефоне (правая кнопка мыши в компе)<br>
        на смене, которую хотим изменить<br>
        -или выбор "ввести свой вариант" в диалоге автозамены<br>
        (если не один из официально возможных не подошел)<br>
          <br>
        В одном запросе можно заявлять замен на несколько дней:<br>
        Запрос должен быть законченным,<br>
        если для того, чтобы он не нарушал правил (День-Ночь, Выходной...)<br>
        нужно выставить замены в другие дни - <br>
        они должны быть отправлены в том же запросе.<br>
          <br>
        <b>Кнопки:</b><br>
        <b>Ctrl Z</b> - откат на шаг (замену) назад<br>
        <b>Reset</b> - перезагрузка расписания (неотправленные замены пропадут)<br>
        <b>Отправить</b> - автопроверка и отправка запроса<br>
        <b>кнопка с ником или Log in</b> - разлогиниться / перелогиниться<br>
          <br>
        Если запрос нарушает правила - <br>
        будет выдано предупреждение со списком нарушений<br>
        Если такой запрос все равно хотим отправить - <br>
        нужно ввести комментраий/причину
    `;

  helpDiv.innerHTML = helpText;

  swal({
    content: helpDiv
  });
}//end helpButtonClick
