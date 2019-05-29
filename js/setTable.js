/*global
 mainTableState,

 parseCSV
 msToCustomDateObj
 _date
 setTimeSlotArr

*/




//-----------------------------------------------------------------------------------------------
//First step - prepare booking data------------------------------------------------------
//-----------------------------------------------------------------------------------------------

function proceedBookingData( bookingData ) {

  let timeCol = 0,
    timeValCol = 1,
    restRecStCol = 2;

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

function setDatesRow( stDate, endDate ) {
  var datesRow = [];
  for (let i = 0, datesCount = endDate - stDate; i <= datesCount; i++) {
    datesRow[i] = stDate + 1;
  }
  return setDatesRow;
}




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




function simpleTable2(Arr, tbody) {
  tbody = tbody || document.createElement('tbody');
  let rowsN = Arr.length,
    colsN = Arr[0].length;
  let timeCol = 0;

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
    let dateStr = msToCustomDateObj( Arr[ri][timeCol] );

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
}//=====END simpleTable2==================




//////////////////////////////////////////////////////////////////////////////////////////////////////////
/////                           END SECOND STEP for result table                                     /////
//////////////////////////////////////////////////////////////////////////////////////////////////////////

function proceedBookingArrToObj( bookingArr ) {
  // let stDateMs = Date.parse( GVAR.stDate );
  // let stDateN = dateMsToDateN( stDateMs );

  let timeCol = 0,
    timeValCol = 1,
    restRecStCol = 2;
  let colCnt = bookingArr[0].length;

  let bookingObj = {};
  let curDateBookingObj = [];
  let curDateN = _date.dateMsToDateN( bookingArr[0][timeCol] );

  bookingObj['' + curDateN] = curDateBookingObj;
  for (let i = 0; bookingArr[i+1] ; i++) {
    let iTime = bookingArr[i][timeCol];
    let iDateN = _date.dateMsToDateN(iTime);
    if (iDateN != curDateN) {
      curDateN = iDateN;
      curDateBookingObj = [];
      bookingObj['' + curDateN] = curDateBookingObj;
    }
    curDateBookingObj.push( bookingArr[i] );
  } //end for bookings rec

  return bookingObj;
}// END proceedBookingArrToObj








function setBookingObjTable(bookingObj, tbody) {
  tbody = tbody || document.createElement('tbody');

  let timeCol = 0;
  let timeValCol = 1;

  let days = Object.keys(bookingObj),
    daysN = days.length;


  let tr1 = '<th id="r0c0">' + 'Time \\ Date' + '</th>';
  days.forEach(day => {
    tr1 += '<td>' + day + '</td>';
  });
  let firstRow = document.createElement('tr');
  firstRow.innerHTML = tr1;
  tbody.appendChild(firstRow);


  let timeSlots = setTimeSlotArr();
  let trStrArr = [];
  timeSlots.forEach( (slot, iSlot) => {
    let initContent = timeSlots[iSlot][2];
    initRow(trStrArr, iSlot, timeSlots[iSlot][2]);
    // rowsCycle(day, iDay);
  });//end for cols

  days.forEach( (day, iDay) => {
    rowsCycle(day, iDay);
  });//end for cols

  function rowsCycle(day, iDay) {
    let curDayBookings = bookingObj[day];

    for (let sri = 0, rowsN = curDayBookings.length; sri < rowsN; sri++) {
      let sriTime = curDayBookings[sri][timeCol] - day * _date.hr24;
      let sriTimeIndex = sriTime / _date.m30;
        let sriDate = new Date(curDayBookings[sri][timeCol]);
        let sriTimeStr = sriDate.getUTCHours() + ':' + sriDate.getUTCMinutes();
      let iCorr = sriTimeIndex - sri;
      let ri = sri + iCorr;


      let riFreeTime = 30 - curDayBookings[sri][timeValCol];
      fillRow(trStrArr, ri, iDay, (sriTimeIndex + ' ' + sriTimeStr + ' ' + iCorr));
    }
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
}//=====END simpleTable2==================





//--------------------------------------------------------------------------------------------------------
//           FINALLY SET the result table                                                            -----
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

  // simpleTable2(bookingData, tbody);
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

}//=====END condFormat===============================
