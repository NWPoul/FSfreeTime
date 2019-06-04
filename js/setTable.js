/*global
 mainTableState,
 GVAR
 toggle

 parseCSV
 _date
 setTimeSlotArr
 setBookingTable
 setFreeTimeTable
 condFormatFreetime

*/




//-----------------------------------------------------------------------------------------------
//First step - prepare booking data------------------------------------------------------
//-----------------------------------------------------------------------------------------------
function parseCSV(strCSV, delimiter) {
  delimiter = delimiter || ';';
  var parsedArr = [];
  var regexp = new RegExp(delimiter+'\n', 'mg');
  var rows = strCSV.split(regexp);

  for (var i = 1, rowsCnt = rows.length - 1; i < rowsCnt; i++) {  //length - 1 => remoove last empty row
    var preRow = rows[i].split(';');
    var row = [
      _date.timeStrToMS(preRow[7]),// FlyTime
      // '', // empty for DateString
      +preRow[8], // Minutes
      +preRow[8], // Minutes (for further individual meter)
      parseTariff(preRow[9]),// + ' (' + preRow[9] +')', // Tariff
      preRow[10], // Name
      preRow[13], // Comment
      preRow[1], // BookingNo
      preRow[5], // Status

      preRow[11], // Email
      preRow[12]  // Phone
    ];
    parsedArr.push(row);
  }
  return parsedArr;
}//end parseCSV


function sortBookingData( bookingArr, colIndex ) {
  bookingArr.sort(function(a,b){
    var date1 = a[colIndex],
      time1 = a[colIndex+1];
    var date2 = b[colIndex],
      time2 = b[colIndex+1];

    var dateDiff = date1-date2;
    if (dateDiff === 0) {
      return time1 - time2;
    } else {
      return dateDiff;
    }
  });
}// end sortBookingData


function tuneResult(resultsArr, tIndex) {
  tIndex = tIndex || 0;

  resultsArr.forEach(function(rec) {
    var extractedDateTimeValues = extractDateTime(rec, tIndex);
    rec.splice(tIndex, 1, extractedDateTimeValues[0], extractedDateTimeValues[1]);
  });
  function extractDateTime(rec, tIndex) {
    var dateTime = rec[tIndex].split(' ');
    var dateArr = dateTime[0].split('.');
    var dateVal = +dateArr[0] + dateArr[1]*100 + dateArr[2]*10000;
    var timeVal = +dateTime[1].replace(':','');
    return([+dateVal, +timeVal]);
  }//end extractDateTime
}//end tuneResult



function proceedBookingData( bookingData ) {
  let {timeCol, timeValCol, restRecStCol} = GVAR.bookingDataMap;
  let timeSlots = setTimeSlotArr();
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



    // LAST ----- NORMALIZE ARR (insert missed timeslots) --------------------------------
    // !!! SHOULD BE LAST!!! or some bloks can be lost !

    // let curTimeStr = new Date(curTime);
    // let nextTimeStr = new Date(bookingArr[i+1][timeCol]);
    // let testv = bookingArr[i+1][timeCol] - curTime;
    // let excSteps = testv / _date.m30;
    while (bookingArr[i+1][timeCol] - curTime > _date.m30) {
      let addRec = new Array(colCnt).fill('');//bookingArr[i].slice();
      addRec[timeCol] = curTime + _date.m30;
      addRec[timeValCol] = 0;
      addRec[restRecStCol+1] = 'empty slot';

      bookingArr.splice(i+1, 0, addRec);
      curTime += _date.m30;
      i++;
    } //END normalize arr


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




// eslint-disable-next-line no-unused-vars
function runTable(bookingData) {

  var mainTable = document.getElementById('mainTable');
  mainTable.innerHTML = '';

  // mainTableState = {
  //   checkMute: false,
  //   checkCnt: 0,
  //   tdChecked: {}, // { tdId:_, ...}
  //   tdChanged: []  // [{ tdId:_, prevShift:_, newShift:_}, ...]
  // };

  var tbody = document.createElement('tbody');

  switch (toggle) {
  case 1:
    setBookingTable(bookingData, tbody);
    break;
  case 2:
    setFreeTimeTable(bookingData, tbody);
    condFormatFreetime(tbody);
    break;
  }
  mainTable.appendChild(tbody);
}//=====END runTable================================




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
