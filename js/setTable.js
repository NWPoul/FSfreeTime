/*global
 mainTableState,
 GVAR

 parseCSV
 _date
 setTimeSlotArr

*/




//-----------------------------------------------------------------------------------------------
//First step - prepare booking data------------------------------------------------------
//-----------------------------------------------------------------------------------------------

function proceedBookingData( bookingData ) {
  let {timeCol, timeValCol, restRecStCol} = GVAR.bookingDataMap;

  let bookingArr = bookingDataToArr( bookingData, timeCol );
  let colCnt = bookingArr[0].length;

  for (let i = 0; bookingArr[i+1] ; i++) {
    let curTime = bookingArr[i][timeCol];
    let curFTimeVal = bookingArr[i][timeValCol];


    // 1 GROUPING same TIMESLOTS
    // !!! Checking bookingArr[i+1] again - coz we deletng recs ahead!!!
    while (bookingArr[i+1] && bookingArr[i+1][timeCol] == curTime) {
      curFTimeVal += bookingArr[i+1][timeValCol];
      bookingArr[i][timeValCol] = curFTimeVal;

      for (let iSum = restRecStCol; iSum < colCnt; iSum++ ) {
        bookingArr[i][iSum] += '<br>' + bookingArr[i+1][iSum];
      }
      bookingArr.splice(i+1, 1); // Deleting rec ahead after sum!
    }//End grouping same timeslots


    // 2 SPREADING EXCEEDED TIME on next slots (insert slots if needed)
    if (curFTimeVal > 30) {
      bookingArr[i][timeValCol] = 30;
      curFTimeVal -= 30;

      let nextTime = curTime + _date.m30;
      if (  !bookingArr[i+1]
          || bookingArr[i+1][timeCol] != nextTime ) {
        let addRec = new Array(colCnt).fill('');//bookingArr[i].slice();
        addRec[timeCol] = nextTime;
        addRec[timeValCol] = curFTimeVal;
        addRec[restRecStCol+1] = '(from prev slot)';

        bookingArr.splice(i+1, 0, addRec);
      } else {
        bookingArr[i+1][timeValCol] += curFTimeVal;
      }

      //bookingArr[i+1][timeValCol+1] = '(+...)<br>' + bookingArr[i+1][timeValCol+1];

    }//End spreading exceeded
  }//END for bookings rec

  return bookingArr;
}// END convertBookingData

function bookingDataToArr( bookingData, sortCol ) {
  let bookingArr = parseCSV(bookingData, ';');
  bookingArr.sort(function (a, b) {
    return a[sortCol] - b[sortCol];
  });
  return bookingArr;
}


//////////////////////////////////////////////////////////////////////////////////////////////////////////
/////                           END first dtep for booking data                                      /////
//////////////////////////////////////////////////////////////////////////////////////////////////////////

// function setDatesRow( stDate, endDate ) {
//   var datesRow = [];
//   for (let i = 0, datesCount = endDate - stDate; i <= datesCount; i++) {
//     datesRow[i] = stDate + 1;
//   }
//   return setDatesRow;
// }




//--------------------------------------------------------------------------------------------------------
//           SECOND STEP - prepare data for result table                                             -----
//--------------------------------------------------------------------------------------------------------

function simpleTable(Arr, tbody) {
  tbody = tbody || document.createElement('tbody');
  let rowsN = Arr.length,
    colsN = Arr[0].length;

  for(let ri = 0; ri < rowsN; ri++){
    let tr = document.createElement('tr');
    var rowStr = '';
    rowStr += '<th id="r' +ri +'c0">' +
               Arr[ri][0] +
              '</th>';

    for (let ci = 1; ci < colsN; ci++) {
      let tdID = 'r' +ri +'c' +ci;
      rowStr += '<td id="' +tdID +'">' +
                 Arr[ri][ci] +
                '</td>';
    }// end for cols

    tr.innerHTML = rowStr;
    tbody.appendChild(tr);
  }//end for rows

  return(tbody);
}//=====END simpleTable==================




function setBookingTable(Arr, tbody) {
  tbody = tbody || document.createElement('tbody');
  let rowsN = Arr.length,
    colsN = Arr[0].length;
  let {timeCol} = GVAR.bookingDataMap;

  let firstRow = document.createElement('tr');
  firstRow.innerHTML = '<th id="r0c0">' + 'Date/Time' + '</th>' +
                       '<td>' + 'Tmin' + '</td>' +
                       '<td>' + 'Emin' + '</td>' +
                       '<td>' + 'Flyers' + '</td>' +
                       '<td>' + 'Notes' + '</td>' +
                       '<td>' + 'Booking №' + '</td>' +
                       '<td>' + 'Status' + '</td>' +
                       '<td>' + 'Tariff' + '</td>' +
                       '<td>' + 'mail' + '</td>' +
                       '<td>' + 'phone' + '</td>';
  tbody.appendChild(firstRow);

  for(let ri = 0; ri < rowsN; ri++) {
    let dateStr =  _date.msToCustomDateObj( Arr[ri][timeCol] );

    let tr = document.createElement('tr');
    let rowStr = '';
    rowStr += '<th id="r' +ri +'c0">' +
               dateStr.dayName + ', ' +
               dateStr.dayN + '/' +
               dateStr.monthN + ' ' +
               dateStr.time + ' ' +
               dateStr.dateN +
              '</th>';

    for (let ci = 1; ci < colsN; ci++) {
      let tdID = 'r' +ri +'c' +ci;
      rowStr += '<td id="' +tdID +'">' +
                 Arr[ri][ci] +
                '</td>';
    }// end for cols

    tr.innerHTML = rowStr;
    tbody.appendChild(tr);
  }//end for rows

  return(tbody);
}//=====END setBookingTable==================




//////////////////////////////////////////////////////////////////////////////////////////////////////////
/////                           END SECOND STEP for result table                                     /////
//////////////////////////////////////////////////////////////////////////////////////////////////////////

function proceedBookingArrToObj( bookingArr ) {
  let bookingObj = {};
  let {timeCol, timeValCol} = GVAR.bookingDataMap;

  let curDateN = _date.dateMsToDateN( bookingArr[0][timeCol] );

  let timeSlots = setTimeSlotArr();
  let rowsCnt = timeSlots.length;

  let curDateRec = new Array(rowsCnt).fill(30);
  for (const booking of bookingArr) {
    let iBookDateN = _date.dateMsToDateN( booking[timeCol] );
    let iBookTime = booking[timeCol] - iBookDateN * _date.hr24;

    if (iBookDateN != curDateN) {
      bookingObj[curDateN] = curDateRec;
      curDateN = iBookDateN;
    // let curDate = new Date( booking[timeCol] );
      curDateRec = new Array(rowsCnt).fill(30);
    }
    let BTi = iBookTime / _date.m30; //iBookTimeIndex
    curDateRec[BTi] -= booking[timeValCol];
  }

  return bookingObj;
}// END proceedBookingArrToObj








function setBookingObjTable(bookingObj, tbody) {
  tbody = tbody || document.createElement('tbody');

  let days = Object.keys(bookingObj);

  let tr1 = '<th id="r0c0">' + 'Slot' + '</th>';
  days.forEach(day => {
    let testDayVal = new Date( +day * _date.hr24 );
    let hDayStr = ( _date.isHoliday( testDayVal.getUTCMonth(), testDayVal.getUTCDate(), testDayVal.getUTCDay() ) ) ?
      ' class = "hDay"' : '';
    testDayVal = (testDayVal.getUTCDate() +'/' +(testDayVal.getUTCMonth()+1) );

    tr1 += '<td' +hDayStr +' >' +testDayVal +'</td>';
  });
  let firstRow = document.createElement('tr');
  firstRow.innerHTML = tr1;
  tbody.appendChild(firstRow);


  let timeSlots = setTimeSlotArr();
  let trStrArr = [];
  timeSlots.forEach( (slot, iSlot) => {
    let initContent = timeSlots[iSlot][2];
    initRow(trStrArr, iSlot, initContent);
  });//end for cols

  days.forEach( (day, iDay) => {
    rowsCycle(day, iDay);
  });//end for cols


  function rowsCycle(day, iDay) {
    let curDayTimeSlots = bookingObj[day];
    curDayTimeSlots.forEach( (freeTimeVal, iSlot) => {
      fillRow(trStrArr, iSlot, iDay, freeTimeVal);
    });
  }// end for rows

  function initRow(rowsArr, ri, content) {
    rowsArr[ri] ='<th id="r' +ri +'c0">'
                  +content +'</th>';
  }

  function fillRow(rowsArr, ri, ci, content) {
    let tdID = 'r' +ri +'c' +ci;
    rowsArr[ri] += '<td id="' +tdID +'">'
                    +content +'</td>';
  }


  trStrArr.forEach( (trStr) => {
    let tr = document.createElement('tr');
    tr.innerHTML = trStr;
    tbody.appendChild(tr);
  });

  return(tbody);
}//=====END setBookingTable==================





//--------------------------------------------------------------------------------------------------------
//           FINALLY SET and SHOW table                                                            -----
//--------------------------------------------------------------------------------------------------------

// eslint-disable-next-line no-unused-vars
function Global(bookingData) {
  var mainTable = document.getElementById('mainTable');
  mainTable.innerHTML = '';
  // mainTable.onclick = ;
  // mainTable.oncontextmenu = ;

  mainTableState = {
    checkMute: false,
    checkCnt: 0,
    tdChecked: {}, // { tdId:_, ...}
    tdChanged: []  // [{ tdId:_, prevShift:_, newShift:_}, ...]
  };

  var tbody = document.createElement('tbody');

  // TDconcat(bookingData, tbody);
  // condFormat(tbody);

  // setBookingTable(bookingData, tbody);
  setBookingObjTable(bookingData, tbody);

  mainTable.appendChild(tbody);
}//=====END GLOBAL================================




function reset() {
  localStorage.removeItem('mainTableState');
  console.log('reset ' + this);
  proceedBookingData();
}//End reset




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
    }// end for cols

    tr.innerHTML = rowStr;
    tbody.appendChild(tr);
  }//end for rows

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
  let minTime = GVAR.minTime || 15;

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
    case (ri <= 17):
      groupName = 'groupN';
      break;

    default:
      groupName = 'groupD';
      break;
    }
    tr.classList.add(groupName);
    // tr.cells[0].classList.add(groupName + '-day');

    for (let ci = colsCnt; --ci > 0;) {
      let td = rowsCollection[ri].cells[ci];
      let freeTimeVal = +td.innerHTML;
      if (freeTimeVal > 28 ) {
        td.classList.add('fullTime');
      } else if(freeTimeVal < 2 ) {
        td.classList.add('noTime');
      } else if (freeTimeVal < minTime ) {
        td.classList.add('lessTime');
      }
    }//endfor ci
  }//endfor ri

}//=====END condFormat===============================
