/*global
 raspData,
 mainTableState,
 prevReqData,

 cellOnClick2swap,
 getRaspAndSetTable,
 changeShift,
*/

// eslint-disable-next-line no-unused-vars
function Global(raspData) {
  var mainTable = document.getElementById('mainTable');
  mainTable.innerHTML = '';
  mainTable.onclick = function() {
    return cellOnClick2swap(event, mainTableState);
  };
  mainTable.oncontextmenu = function() {
    return cellOnClick2swap(event, mainTableState);
  };

  mainTableState = {
    checkMute: false,
    checkCnt: 0,
    tdChecked: {}, // { tdId:_, ...}
    tdChanged: []  // [{ tdId:_, prevShift:_, newShift:_}, ...]
  };

  var tbody = document.createElement('tbody');

  TDconcat(raspData, tbody);
  condFormat(tbody);

  mainTable.appendChild(tbody);

  restoreState();
//    getPrevReqAndSetData();// Загрузить активные предыдущие запросы = допилить потом
}//=====END GLOBAL================================


// eslint-disable-next-line no-unused-vars
function callReset() {
  //get rasp data
  //set table
//    raspData = getRasp();
  var actualChanges = document.getElementsByClassName('changed');
  if (!actualChanges.length) {
    reset();
  } else {
    swal({
      buttons: ['Перезагрузить расписание', 'Вернуться'],
      title: 'Перезагрузка расписания!',
      text: 'Есть неотправленные изменения смен \n они будут потеряны!'
    })
      .then( (choice) => {
        if (!choice) {
          reset();
        }
      });
  }

}


function reset() {
  localStorage.removeItem('mainTableState');
  console.log('reset ' + this);
  getRaspAndSetTable();
}//End reset

// eslint-disable-next-line no-unused-vars
function SoftReload() {
  // raspData = raspData;
  var mainTable = document.getElementById('mainTable');
  var tbody = mainTable.tBodies[0];

  TDconcat(raspData, tbody);
  condFormat(tbody);

  localStorage.removeItem('mainTableState');

  mainTableState = {
    checkMute: false,
    checkCnt: 0,
    tdChecked: {},
    tdChanged: []
  };
}//End SoftReload

function restoreState() {
  var savedState = localStorage.getItem('mainTableState');
  if (!savedState) { return; }
  savedState = JSON.parse(savedState);
  console.log(savedState);
  savedState.tdChanged.forEach( function(td) {
    changeShift(td.tdId, td.newShift);
  });
}//End restoreState

// eslint-disable-next-line no-unused-vars
function showTableState() {
// var stateList = document.getElementById('tableState');
// stateList.innerHTML = '';
// var stateValues = ['checkCnt: ' + mainTableState.checkCnt,
//   'changedCnt: ' + mainTableState.tdChanged.length];

// stateValues.forEach( function(val, i) {
//   var li = document.createElement('li');
//   li.innerHTML = val;
//   stateList.appendChild(li);
// });
} // end showTableState


//-----TDconcat------------------------------------------------------------------------
function TDconcat(Arr, tbody) {

  tbody.innerHTML = '';

  var rowsN = Arr.length,
    colsN = Arr[0].length;

  for(var i = 0; i < rowsN; i++){
    let tr = document.createElement('tr');
    var rowStr = '';
    rowStr += '<th id="r' +i +'c0">' +
                          Arr[i][0] +
                '</th>';

    for (var j = 1; j < colsN; j++) {
      var tdID = 'r' +i +'c' +j;
      rowStr += '<td id="' +tdID +'">' +
                          Arr[i][j] +
                '</td>';
    }
    tr.innerHTML = rowStr;
    tbody.appendChild(tr);
  }

  // парсим массив свойств даты в первую строку
  var firstRow = tbody.rows[0];
  for (var ri = colsN; --ri >0;) {
    var dateStr = Arr[0][ri][2] + '/' + ( 1+Arr[0][ri][1] ) + '<br>' + Arr[0][ri][3]; //Arr[0][ri][1]+1 т.к. месяцы с 0 в JS
    firstRow.cells[ri].innerHTML = dateStr;
    firstRow.cells[ri].HDay = Arr[0][ri][4];
  }

  return(tbody);
}//=====END TDconcat==================


function condFormat(tbody) {
  var rowsCollection = tbody.rows;
  var colsCnt = rowsCollection[0].cells.length;

  // первая строка с датами
  for (let ci = colsCnt; --ci > 0;) {
    let td = rowsCollection[0].cells[ci];
    if (td.HDay) {
      td.classList.add('HDay');
    }
  }//endfor ci

  for (let ri=rowsCollection.length; --ri > 0;) {
    let tr = rowsCollection[ri];
    let groupName;
    switch (true) {
    case (ri <= 4):
      groupName = 'group1';
      break;

    case (ri <= 8):
      groupName = 'group2';
      break;

    case (ri <= 12):
      groupName = 'group3';
      break;

    case (ri <= 16):
      groupName = 'group4';
      break;

    case (ri > 16):
      groupName = 'group5';
      break;
    }

    tr.classList.add(groupName);
    tr.cells[0].classList.add(groupName + '-day');

    for (let ci = colsCnt; --ci > 0;) {
      let td = rowsCollection[ri].cells[ci];
      if (/[-vwsx]/i.test(td.innerHTML) ) {
        td.classList.add('zam0');
      } else if (/[ДЖ]/i.test(td.innerHTML) ) {
        td.classList.add(groupName + '-day');
      } if (/[Н]/i.test(td.innerHTML) ) {
        td.classList.add(groupName + '-night');
      } if (/[Ж]/i.test(td.innerHTML) ) {
        td.classList.add('joker');
      } if (/[*]/i.test(td.innerHTML) ) {
        td.classList.add('zam1');
      }

    }//endfor ci
  }//endfor ri

}//=====END condFormat===================





//======================================================================================
//===== working with previous requests =================================================
//======================================================================================

// eslint-disable-next-line no-unused-vars
function prevReqHandling(flag) {
  if(!prevReqData) return;
  //console.log(raspData[0]);
  //  console.log(prevReqData);
  //  console.log(mainTableState);

  for (let i = 0, last = prevReqData.length; i < last; i++) {
    // let curAuthorMail = prevReqData[i].authorMail;
    // let curReqStatus = prevReqData[i].status;
    let curReqChanges = prevReqData[i].changes;

    var curTdZamReq = {};
    curReqChanges.forEach( function(change) {
      var curDateIndex = findDateIndex(change.dateT);
      var curInstrIndex = findInstrIndex(change.instr);

      if (curDateIndex && curInstrIndex) {
        curTdZamReq.td = [curInstrIndex,curDateIndex];
        curTdZamReq.shift = change.shift;
        showPrevZamReq(curTdZamReq.td, curTdZamReq.shift);
        console.log(curTdZamReq);
      }
    });


  } // end for




}

function findDateIndex(DateMS) {
  var Dates = raspData[0];

  if (DateMS < Dates[1][0]) return null;

  for (var i=1; i<= Dates.length; i++) {
    if (DateMS <= Dates[i][0]) return i;
  }

  return null;
} // end findDateIndex return zero based index



function findInstrIndex(instr) {
  for (var i=1; i<= raspData.length; i++) {
    if (instr == raspData[i][0]) return i ;
  }
  return null;

} // end findInstrIndex return zero based index


function showPrevZamReq(td, zamShift) {
  var tdId = 'r' +td[0] +'c' +td[1];
  var actTD = document.getElementById(tdId);
  actTD.innerHTML = zamShift;
  actTD.classList.add('zamReq');
} //===== END showPrevZamReq
