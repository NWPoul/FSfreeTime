/*global

 GVAR

 _date

condFormatFreetime
 parseTariff
 setTimeSlotArr
 setBookingTable
 setFreeTimeTable
 scrollToCurrentTime
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


function tuneResult(resultsArr, tIndex = 0) {
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
        addRec[restRecStCol+1] = ' ^ см. выше ^ ';

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
    while (bookingArr[i+1] && bookingArr[i+1][timeCol] - curTime > _date.m30) {
      let addRec = new Array(colCnt).fill('');//bookingArr[i].slice();
      addRec[timeCol] = curTime + _date.m30;
      addRec[timeValCol] = 0;

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
function runTable(data, toggle) {
  var mainTable = document.getElementById('mainTable');
  mainTable.innerHTML = '';
  var tbody = document.createElement('tbody');

  switch (toggle) {
  case 'freetime': case 1:
    setFreeTimeTable(data, tbody);
    condFormatFreetime(tbody);
    break;
  case 'bookings': case 2:
    setBookingTable(data, mainTable);

    var noScrollToggle = !isNeedScroll();
    scrollToCurrentTime( noScrollToggle ); //here was a 100s delay (setTimeOun) to call scroll
    break;
  }
  mainTable.appendChild(tbody);


  function isNeedScroll() {
    let todayRu = new Date();
    let stDateRu = new Date( GVAR.stDate );

    let todayN = _date.dateMsToDateN(todayRu);
    let stDateN = _date.dateMsToDateN(stDateRu);

    if (stDateN == todayN - 1) {
      return true;
    }
  }
}//=====END runTable ================================
