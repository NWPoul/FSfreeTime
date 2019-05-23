/*global
 raspData,
 mainTableState,

 cellOnClick2swap,

*/


function getTestData(dataReq) {
  var testDataStoage = {
    ShortBookingsArrHor: [
      [20190424,20190424,20190424,20190424,20190424,20190424,20190424,20190424,20190424,20190424,20190424,20190424,20190424,20190424,20190424,20190424,20190424,20190424,20190424,20190424,20190424,20190424,20190424,20190424,20190424,20190424,20190424,20190424,20190424,20190424,20190424,20190424,20190424,20190424,20190425,20190425,20190425,20190425,20190425,20190425,20190425,20190425,20190425,20190425,20190425,20190425,20190425,20190425,20190425,20190425,20190425,20190425,20190425,20190425,20190425,20190425,20190425,20190425,20190425,20190425,20190425,20190425,20190425,20190425,20190425,20190425,20190425,20190425,20190425,20190425,20190425,20190425,20190425,20190425,20190425,20190426,20190426,20190426,20190426,20190426,20190426,20190426,20190426,20190426,20190426,20190426,20190426,20190426,20190426,20190426,20190426,20190426,20190426,20190426,20190426,20190426,20190426,20190426,20190426,20190426,20190426,20190426,20190426,20190426,20190426,20190426,20190426,20190426,20190426,20190426,20190426,20190426,20190426,20190426,20190426,20190426,20190426,20190426,20190426,20190426,20190426,20190426,20190426,20190426,20190426,20190426,20190426,20190426,20190426],
      [0,100,100,200,230,400,500,730,800,800,830,1000,1100,1100,1200,1300,1400,1430,1600,1630,1700,1730,1730,1830,1900,1930,2000,2030,2030,2100,2200,2200,2230,2330,0,100,100,200,230,400,500,700,800,800,830,830,900,930,1000,1030,1100,1130,1230,1300,1330,1430,1500,1500,1500,1530,1600,1630,1700,1700,1730,1730,1800,1830,1900,1930,2000,2030,2100,2200,2230,0,100,100,130,200,230,230,330,400,400,500,700,800,800,830,830,900,930,1000,1030,1100,1130,1200,1230,1300,1300,1330,1400,1400,1430,1500,1500,1500,1530,1600,1600,1600,1630,1700,1730,1800,1800,1830,1830,1900,1930,1930,2000,2030,2100,2200,2200,2230,2330],
      [60,15,15,15,15,15,15,15,15,15,15,6,4,15,15,15,15,15,15,15,30,15,15,15,30,15,4,15,15,60,15,15,60,30,60,15,15,15,15,15,15,15,15,15,15,15,30,30,30,30,30,30,30,20,30,30,2,2,20,30,4,30,15,15,15,15,20,30,30,30,20,30,60,30,60,60,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,30,30,30,30,30,30,10,30,4,20,30,10,15,30,6,4,20,30,2,15,6,20,30,30,4,20,15,15,30,15,15,20,30,60,6,15,60,15]
    ],
    ShortBookingsArr: [
      [20190424,0,60],[20190424,100,15],[20190424,100,15],[20190424,200,15],[20190424,230,15],[20190424,400,15],[20190424,500,15],[20190424,730,15],[20190424,800,15],[20190424,800,15],
      [20190424,830,15],[20190424,1000,6],[20190424,1100,4],[20190424,1100,15],[20190424,1200,15],[20190424,1300,15],[20190424,1400,15],[20190424,1430,15],[20190424,1600,15],[20190424,1630,15],
      [20190424,1700,30],[20190424,1730,15],[20190424,1730,15],[20190424,1830,15],[20190424,1900,30],[20190424,1930,15],[20190424,2000,4],[20190424,2030,15],[20190424,2030,15],[20190424,2100,60],
      [20190424,2200,15],[20190424,2200,15],[20190424,2230,60],[20190424,2330,30],[20190425,0,60],[20190425,100,15],[20190425,100,15],[20190425,200,15],[20190425,230,15],[20190425,400,15],
      [20190425,500,15],[20190425,700,15],[20190425,800,15],[20190425,800,15],[20190425,830,15],[20190425,830,15],[20190425,900,30],[20190425,930,30],[20190425,1000,30],[20190425,1030,30],
      [20190425,1100,30],[20190425,1130,30],[20190425,1230,30],[20190425,1300,20],[20190425,1330,30],[20190425,1430,30],[20190425,1500,2],[20190425,1500,2],[20190425,1500,20],[20190425,1530,30],
      [20190425,1600,4],[20190425,1630,30],[20190425,1700,15],[20190425,1700,15],[20190425,1730,15],[20190425,1730,15],[20190425,1800,20],[20190425,1830,30],[20190425,1900,30],[20190425,1930,30],
      [20190425,2000,20],[20190425,2030,30],[20190425,2100,60],[20190425,2200,30],[20190425,2230,60],[20190426,0,60],[20190426,100,15],[20190426,100,15],[20190426,130,15],[20190426,200,15],
      [20190426,230,15],[20190426,230,15],[20190426,330,15],[20190426,400,15],[20190426,400,15],[20190426,500,15],[20190426,700,15],[20190426,800,15],[20190426,800,15],[20190426,830,15],
      [20190426,830,15],[20190426,900,30],[20190426,930,30],[20190426,1000,30],[20190426,1030,30],[20190426,1100,30],[20190426,1130,30],[20190426,1200,10],[20190426,1230,30],[20190426,1300,4],
      [20190426,1300,20],[20190426,1330,30],[20190426,1400,10],[20190426,1400,15],[20190426,1430,30],[20190426,1500,6],[20190426,1500,4],[20190426,1500,20],[20190426,1530,30],[20190426,1600,2],
      [20190426,1600,15],[20190426,1600,6],[20190426,1630,20],[20190426,1700,30],[20190426,1730,30],[20190426,1800,4],[20190426,1800,20],[20190426,1830,15],[20190426,1830,15],[20190426,1900,30],
      [20190426,1930,15],[20190426,1930,15],[20190426,2000,20],[20190426,2030,30],[20190426,2100,60],[20190426,2200,6],[20190426,2200,15],[20190426,2230,60],[20190426,2330,15]
    ],
    csv: 'NO;BookingNo;Status;FlyTime;Minutes;Tariff;Name;Email;Phone;Comment;\n65;0280612;3;22.04.2019 13:00;10;10 минут (прайм-тайм);Гуров Кирилл ;25652040@flystation.net;+79523591179;;\n66;0280610;3;22.04.2019 18:30;6;Сертификат 6 мин.;Мартинович Полина ;polina_martinovich@mail.ru;+79110876427;;\n67;0280595;3;23.04.2019 18:00;2;2 минуты (прайм-тайм);Манифест Манифест Манифест;6330707@bk.ru;+78126330707;Савельева Светлана\n 8-911-943-38-34;\n68;0280580;3;22.04.2019 10:00;4;4 минуты (со скидкой);Мошек Лариса ;teplosk@inbox.ru;+79112233100;;\n69;0280579;3;24.04.2019 19:30;4;Сертификат 4 мин.;Сигинина Екатерина ;25183564@flystation.net;+79112406434;;\n70;0280505;3;24.04.2019 11:00;4;4 минуты (со скидкой);Огурская Елена ;logur_spb@mail.ru;+79215670062;',
    other: 'other'
  };

  return testDataStoage[dataReq] || null;
}// END GET test Data




//-----------------------------------------------------------------------------------------------
//First step - get and prepare booking data------------------------------------------------------
//-----------------------------------------------------------------------------------------------

function handlingGetBookingResponse (bookingResponse) {
  let bookingArr = parseCSV( bookingResponse, ';' );
  bookingArr.sort(function(a,b){
    return a[0] - b[0];
  });
  convertBookingData( bookingArr );
  Global( bookingArr );
}


function convertBookingData( bookingArr ) {
  bookingArr = bookingArr || getTestData('ShortBookingsArr');

  let block30 = 30*60*1000;

  let timeCol = 0,
    dateStrCol = 1,
    timeValCol = 2,
    restRecStCol = 3,
    colCnt = bookingArr[0].length;

  for (let i = 0; bookingArr[i+1] ; i++) {

    let curTime = bookingArr[i][timeCol];
    let curFTimeVal = bookingArr[i][timeValCol];

    //summarise same timeslots !(bookingArr[i+1] again - needed coz we deletng rows ahead!)
    while (bookingArr[i+1] && bookingArr[i+1][timeCol] == curTime) {
      curFTimeVal += bookingArr[i+1][timeValCol];
      bookingArr[i][timeValCol] = curFTimeVal;

      for (let iSum = restRecStCol; iSum < colCnt; iSum++ ) {
        bookingArr[i][iSum] += '<br>' + bookingArr[i+1][iSum];
      }
      bookingArr.splice(i+1,1);
    }

    if (curFTimeVal > 30) {
      bookingArr[i][timeValCol] = 30;
      curFTimeVal -= 30;

      let nextTime = curTime + block30;
      if (  !bookingArr[i+1]
            || bookingArr[i+1][timeCol] != nextTime ) {
        let addRec = new Array(colCnt);
        addRec[timeCol] = nextTime;
        addRec[timeValCol] = curFTimeVal;
        bookingArr.splice(i+1,0,addRec);
      } else {
        bookingArr[i+1][timeValCol] += curFTimeVal;
      }
    }

    bookingArr[i][dateStrCol] = JSON.stringify( msToCustomDateObj(curTime) );
  }//END for bookings rec

  return bookingArr;
}// END convertBookingData

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
}//=====END TDconcat==================








//////////////////////////////////////////////////////////////////////////////////////////////////////////
/////                           END SECOND STEP for result table                                     /////
//////////////////////////////////////////////////////////////////////////////////////////////////////////











//--------------------------------------------------------------------------------------------------------
//           FINALLY SET the result table                                                            -----
//--------------------------------------------------------------------------------------------------------

// eslint-disable-next-line no-unused-vars
function Global(raspData) {
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

  // TDconcat(raspData, tbody);
  // condFormat(tbody);

  simpleTable(raspData, tbody);

  mainTable.appendChild(tbody);
}//=====END GLOBAL================================




function reset() {
  localStorage.removeItem('mainTableState');
  console.log('reset ' + this);
  getBookingDataAndSetTable();
}//End reset



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