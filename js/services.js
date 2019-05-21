


function parseCSV(strCSV, delimiter) {
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



function parseFTime(str) {
  //'24.01.2019 08:00';
  var timeArr = str.split(/[.:\s]/);
  var FTime_ms = Date.UTC( +timeArr[2],
    +timeArr[1]-1, // Month in JS starts from 0!!!
    +timeArr[0],
    +timeArr[3]-3, // hours per UTC !
    +timeArr[4] );
  return FTime_ms;
}// end parse FTime

function jsTimeToSS(jsTime) {
  // var SSTime = (jsTime+3*60*60*1000)/1000/60/60/24+25569;
  var SSTime = new Date(jsTime)
  return SSTime;
}
  
function dateToYYYYMMDD(srcDate, delimeter) {
  delimeter = delimeter || '-';
  var year =   srcDate.getFullYear(),
    month = (+srcDate.getMonth()+1),
    day =    +srcDate.getDate();
  var resDate = year + delimeter
               + ( (month>9) ? month : ('0' + month) ) + delimeter
               + ( (day>9)   ? day   : ('0' + day)   );
  return resDate;
}// end dateToYYYYMMDD







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