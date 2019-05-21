function parseFTime(str) {
  //'24.01.2019 08:00';
  var timeArr = str.split(/[.:\s]/);
  var FTime_ms = Date.UTC( +timeArr[2],
    +timeArr[1]-1, // Month in JS starts from 0!!!
    +timeArr[0],
    +timeArr[3]-3, // hours per UTC !
    +timeArr[4] );
  return FTime_ms;
}// end parae FTime







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
}//end tuneResult

function extractDateTime(rec, tIndex) {
  var dateTime = rec[tIndex].split(' ');
  var dateArr = dateTime[0].split('.');

  var dateVal = +dateArr[0] + dateArr[1]*100 + dateArr[2]*10000;
  var timeVal = +dateTime[1].replace(':','');

  return([+dateVal, +timeVal]);
}//end extractDateTime



function setTimeSlotArr() {
  var timeSlotArr = [];
  for (var i = 0; i <= 23; i++ ) {
    timeSlotArr.push([i*100+0,0]);
    timeSlotArr.push([i*100+30,0]);
  }
  return(timeSlotArr);
}//end setTimeSlotArr


function timeIndexFunc(arg, mode) {
  arg = +arg;
  var result;

  switch (mode) {
  case 'index':
    result = Math.ceil( (arg / 100)*2 );
    break;
  case 'time':
    result = arg*50 - (arg%2*20);
    break;
  case 'next':
    result = (arg > 2300) ? 0 :
      arg + ( (arg%100) ? 70 : 30 );
    break;
  }

  return(result);
}//end timeIndexFunc




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





////////////////////////////////////////////////////
///// MAIN                                 /////////
////////////////////////////////////////////////////





function lookButton() {
  callConvertBookingData();
}

function callConvertBookingData() {
  var dates = getDatesFromSS();
  var stDate = dates.stDate,
    endDate = dates.endDate;
  //  var bookingArr = getTestData('csv');
  //      bookingArr = parseCSV(bookingArr,';')
  var bookingArr = getBookingData(stDate, endDate);
  writeToSS( bookingArr, 2, 1, 'tSrc' );

  convertBookingData( bookingArr );
  writeToSS( bookingArr, 2, 12, 'tSrc' );
}// END callConvertBookingData




function getDates() {
  if (!stDate){
    stDate = prompt('Start Date YYYY-MM-DD:');
  }
  var endDate = new Date(stDate);
  endDate.setMonth(endDate.getMonth() + 1);

  //   stDate = dateToYYYYMMDD(stDate);
  endDate = dateToYYYYMMDD(endDate);

  return endDate;
}// end getDatesFromSS


function getBookingDataAndSetTable (stDate, endDate) {
  stDate = stDate || '2019-04-30';
  endDate = endDate || '2019-05-01';

  var url = 'https://booking.flystation.net/Control/Booking/ListBooking'
           + '/loadDataList'
           +'/0/1/1';

  var params = {
  // '_search': "false",  GFilter[search]': '',  'GFilterReset': 1,
    'method': 'POST',

    'login':                 'instruktor@flystation.net',
    'password':              'hfcgbcfybt',
    'GFilter[filtermore]':    1,
    'GFilter[bookingactive]': 'y',
    'GFilter[dateid]':        'bookingtimefly',
    'GFilter[sdate]':         stDate,
    'GFilter[edate]':         endDate
  };

  promisedPOST(url, params)
    .then(
      function(response) {
        let bookingArr = parseCSV(response,';');
        bookingArr.sort(function(a,b){
          return a[0] - b[0];
        });
        Global(bookingArr);
      },
      function(error) {
        console.error('Failed!', error);
        return( [ ['Loading error'], [error] ] );
      });

//   console.log(bookingArr);
}//end getBookingData
////////////////////////////////////////////////////////////////////////









function convertBookingData( bookingArr ) {
  bookingArr = bookingArr || getDataFromSS();//getTestData('ShortBookingsArr');

  var block30 = 30*60*1000;

  var timeCol = 0,
    dateStrCol = 1,
    timeValCol = 2,
    restRecStCol = 3,
    colCnt = bookingArr[0].length;

  for (var i = 0; bookingArr[i+1] ; i++) {

    var curTime = bookingArr[i][timeCol];
    var curFTimeVal = bookingArr[i][timeValCol];

    //summarise same timeslots !(bookingArr[i+1] again - needed coz we deletng rows ahead!)
    while (bookingArr[i+1] && bookingArr[i+1][timeCol] == curTime) {
      curFTimeVal += bookingArr[i+1][timeValCol];
      bookingArr[i][timeValCol] = curFTimeVal;

      for (var iSum = restRecStCol; iSum < colCnt; iSum++ ) {
        bookingArr[i][iSum] += '\n' + bookingArr[i+1][iSum];
      }

      bookingArr.splice(i+1,1);
    }


    if (curFTimeVal > 30) {
      bookingArr[i][timeValCol] = 30;
      curFTimeVal -= 30;

      var nextTime = curTime + block30;

      if (  !bookingArr[i+1]
            || bookingArr[i+1][timeCol] != nextTime ) {
        var addRec = new Array(colCnt);
        addRec[timeCol] = nextTime;
        addRec[timeValCol] = curFTimeVal;
        bookingArr.splice(i+1,0,addRec);
      } else {
        bookingArr[i+1][timeValCol] += curFTimeVal;
      }
    }

    bookingArr[i][dateStrCol] = jsTimeToSS(curTime);
  }//END for bookings rec

  return bookingArr;
}// END convertBookingData
















function test() {
  var testVal;
  for (var i = 0; i <= 47; i++) {
    var arg = timeIndexFunc(i, 'time');
    testVal =  timeIndexFunc(arg, 'next');
    Logger.log(arg+'-'+testVal);
  }
}

/// Services   //////////////////////////////////////////////////////////////////////////
//Logger.log(bookingArr);




function writeToSS( dataArr, stRow, stCol, sheet ) {
  stRow = stRow || 2;
  stCol = stCol || 1;
  sheet = sheet || 'tSrc';

  var recordsCnt = dataArr.length;
  var colsCnt = dataArr[0].length;

  var SS = SpreadsheetApp.getActiveSpreadsheet();

  var distSheet = SS.getSheetByName(sheet);
  var LastRow = distSheet.getLastRow();
  var distRange = distSheet.getRange(stRow,stCol,recordsCnt,colsCnt);

  distRange.offset(0, 0, LastRow-stRow, colsCnt).clearContent();

  //     for (var ii = 0; ii < dataArr.length; ii++) {
  //       if (dataArr[ii].length != colsCnt) {
  //         var itest = ii +" "+ dataArr[ii];
  //         dataArr[ii].length = colsCnt;
  //         dataArr[ii][3] = 'HERE!!!' + itest;
  //         Logger.log(itest)
  //       }
  //     }

  distRange.setValues(dataArr);
}// end writeToSS









// function fetchData(url, parametersObj, method) {


//     fetch('ajax_quest.php'+ '?' + 'id_product=' + id_product + '&qty_product=' + qty_product,

//     // Второй аргумент это объект с указаниями, методаи заголовка
//     {
//       method: 'GET',
//       headers:{'content-type':'application/x-www-form-urlencoded'}
//     })

//     .then( response => {
//       if (response.status !== 200) {

//         return Promise.reject();
//       }
//       return response.text()
//     })
//     .then(i => console.log(i))
//     .catch(() => console.log('ошибка'));


// }











function parseCSV(strCSV, delimiter) {
  // 0_NO 1_BookingNo 2_Status 3_FlyTime 4_Minutes 5_Tariff 6_Name 7_Email 8_Phone 9_Comment

  delimiter = delimiter || ';';
  var parsedArr = [];

  var regexp = new RegExp(delimiter+'\n', 'mg');
  var rows = strCSV.split(regexp);

  for (var i = 1, rowsCnt = rows.length - 1; i < rowsCnt; i++) {  //length - 1 => remoove last empty row
    var preRow = rows[i].split(';');
    var row = [
      parseFTime(preRow[7]),// FlyTime
      '', // empty fot DateString
      +preRow[8], // Minutes
      +preRow[8], // Minutes (for further individual meter)
      preRow[10], // Name
      preRow[13], // Comment
      preRow[1], // BookingNo
      preRow[5], // Status
      preRow[9], // Tariff
      preRow[11], // Email
      preRow[12]  // Phone
    ];
    parsedArr.push(row);
  }
  return parsedArr;
}//end parseCSV


function dateToYYYYMMDD(srcDate, delimeter) {
  delimeter = delimeter || '-';
  var year =   srcDate.getFullYear(),
    month = (+srcDate.getMonth()+1),
    day =    +srcDate.getDate();

  var resDate = year + delimeter
             + ( (month>9) ? month : ('0' + month) ) + delimeter
             + ( (day>9)   ? day   : ('0' + day)   );

  return resDate;
}


function jsTimeToSS(jsTime) {
  // var SSTime = (jsTime+3*60*60*1000)/1000/60/60/24+25569;
  var SSTime = new Date(jsTime);
  return SSTime;
}


