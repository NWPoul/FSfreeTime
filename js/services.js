


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



var _date = {
  m30: 1800000, //30*60*1000
  hr24: 86400000, //24*60*60*1000

  timeStrToMS: function timeStrToMS(str) {
    //'24.01.2019 08:00';
    var timeArr = str.split(/[.:\s]/);
    var FTime_ms = Date.UTC(
      +timeArr[2],
      +timeArr[1]-1, // Month in JS starts from 0 !!!
      +timeArr[0],
      +timeArr[3],//-3, // hours => per UTC !
      +timeArr[4] );
    return FTime_ms;
  },

  dateMsToDateN: function dateMsToDateN(dateMs) {
    let dateN = Math.trunc( dateMs / 86400000 );
    return dateN;
  },

  dateToYYYYMMDD: function dateToYYYYMMDD(srcDate, delimeter) {
    delimeter = delimeter || '-';
    var year =   srcDate.getFullYear(),
      month = (+srcDate.getMonth()+1),
      day =    +srcDate.getDate();
    var resDate = year + delimeter
               + ( (month>9) ? month : ('0' + month) ) + delimeter
               + ( (day>9)   ? day   : ('0' + day)   );
    return resDate;
  },

  msToCustomDateObj: function msToCustomDateObj(msTime) {
  // var SSTime = (jsTime+3*60*60*1000)/1000/60/60/24+25569;
    let date = new Date(msTime);
    let dateObj = _date.customDate(date);
    return dateObj;
  },// end parse msToCustomDateObj

  customDate: function customDate ( date ) {
    let timeMS = date.getTime();
    let dateN = _date.dateMsToDateN(timeMS);
    let monthN = date.getUTCMonth();
    let dayN = date.getUTCDate();
    let time = date.getUTCHours() + ':' + ( (+date.getUTCMinutes() == 30) ? '30' : '00' );
    let dayWeekN = date.getUTCDay();
    let HDay = _date.isHoliday(monthN, dayN, dayWeekN);

    let dayName = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];
    let dateObj = {
      time: time,
      dateN: dateN,
      monthN: +monthN+1,
      dayN: dayN,
      dayName: dayName[dayWeekN],
      HDay: HDay
    };
    // let JSONdateObj = JSON.stringify(dateObj)
    return dateObj;//[time, monthN, dayN, dayName[dayWeekN], HDay];
  },//end customDate

  isHoliday: function isHoliday(monthN, dayN, dayWeekN){
    var holidays2019 = [
      [1,2,3,4,7,8], //[0]JAN 2019
      [],            //[1]FEB
      [8],           //[2]MAR
      [],            //[3]ARP
      [1,2,3,9,10],  //[4]MAY
      [12],          //[5]JUN
      [],[],[],[],   //JUL//AUG//SEP//OKT
      [4], []        //[10]NOV//DEC
    ];

    if (dayWeekN == 0 || dayWeekN == 6) {
      return true;
    } else if (holidays2019[monthN].indexOf(dayN)!= -1) {
      return true;
    }
    return false;
  }//end isHoliday


}; // ===== END custom DATE OBJ ===== custom DATE OBJ ===== custom DATE OBJ ===== custom DATE OBJ =====





// end dateToYYYYMMDD









function setTimeSlotArr() {

  let timeSlotArr = [];
  for (let i = 0; i <= 23; i++ ) {
    timeSlotArr.push([i*2*_date.m30, i*100+0, i + ':00' ]);
    timeSlotArr.push([i*2*_date.m30 + _date.m30, i*100+30, i + ':30']);
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


function promisedPOST(url, params) {
  return new Promise(function(resolve, reject) {
    var paramsQstring = '';
    for (let param in params){
      paramsQstring += '&' + param + '=' + params[param];
    }

    var req = new XMLHttpRequest();

    req.open('post', url);

    req.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');

    req.onload = function() {
      if (req.status == 200) {
        resolve(req.response);
      } else {
        reject(Error(req.statusText));
      }
    };
    // handle network errors
    req.onerror = function() {
      reject(Error('Network Error'));
    };
    // make the request
    req.send(paramsQstring);
  });
}//===END promisedPOST================================================
