/*global
 GVAR
 MODE

 getSVGicon

 _date

*/



function setBookingTable(Arr, tbody, appendToggle) {
  tbody = tbody || document.createElement('tbody');
  tbody.classList.add('bookingTbody');

  let minFreeTime = 2;
  let nowTimeUTC = Date.now();

  let tbodyInnerHtmlStr = '';

  let colsN = Arr[0].length;

  let {timeCol, timeValCol} = GVAR.bookingDataMap;

  let firstRowStr = '<th id="r0c0" class="th0">' + 'Date /<br>Time' + '</th>' +
                    '<td>' + getSVGicon('stopwatch') + '</td>' +
                    '<td>' + 'Tariff' + '</td>' +
                    '<td>' + 'Flyers' + '</td>' +
                    '<td>' + 'Notes' + '</td>' +
                    '<td>' + 'Booking №' + '</td>' +
                    '<td>' + 'paid' + '</td>';

  // !!! DEV - cut off phones & e-mails
  if (GVAR.user.toLowerCase() == 'tst') {
    firstRowStr += '<td>' + 'mail' + '</td>' + '<td>' + 'phone' + '</td>';
  } else {
    colsN -= 2; // !!! DEV - cut off phones & e-mails
  }

  if (appendToggle) {
    tbody.insertAdjacentHTML('beforeEnd', doRowsStr(Arr));
    return;
  }

  tbodyInnerHtmlStr += firstRowStr;

  tbodyInnerHtmlStr += doRowsStr(Arr);
  tbody.innerHTML = tbodyInnerHtmlStr;

  // tbody.addEventListener('scroll', (e) => {
  //   console.log(e);
  // });
  return(tbody);


  function doRowsStr(Arr) {
    let rowsN = Arr.length;

    let RowsStr = '';
    for(let ri = 0; ri < rowsN; ri++) {
      let dateStr = _date.msToCustomDateObj( Arr[ri][timeCol] );
      let freeTime = 30 - Arr[ri][timeValCol];
      var curTime = Arr[ri][timeCol]; // !var - coz need scope!
      let curTimeslotN = _date.msToSlotN( curTime );

      let trId = (dateStr.dateN + '_' + dateStr.time);

      let trClassStr = condFormatBookingTable(freeTime, minFreeTime, curTimeslotN, curTime);
      let rowSpan = ( freeTime >= minFreeTime && freeTime < 30) ? 'rowspan="2"' : '' ;

      let trStrStart = '<tr ' +('id="' +trId +'" ') +('class="' +trClassStr +'" ') +' >';
      let thStr = doThStr(ri, rowSpan, dateStr);
      let tdStr = doTdStr(freeTime, ri);

      let trStr = trStrStart +thStr +tdStr +'</tr>';
      RowsStr += trStr;

      if(rowSpan) {
        let adTrStr = '<tr ' +('class="' +trClassStr +'" ') +' >' +
        '<td colspan="10" class="freeTimeTd">' +' -- свободно ' +freeTime +' мин. --' +'</td>' +
        '<tr>';
        RowsStr += adTrStr;
      }
    }//end for rows
    return RowsStr;
  }//END doRowsStr

  function doThStr(ri, rowSpan, dateStr) {
    let ThStr = '<th ' + ('id="r' + ri + 'c0" ') + rowSpan + ' >' + // +('class="' +groupName +'"')
      '<span class="tdSpan">' +
      dateStr.dayName + ', ' +
      dateStr.dayN + '/' +
      dateStr.monthN + ' ' +
      '</span><br />' +
      dateStr.time + ' ' +
      //  dateStr.dateN +
      '</th>';
    return ThStr;
  }// end doThStr
  function doTdStr(freeTime, ri) {
    let tdStr = '';
    if (freeTime < 30) {
      for (let ci = 2; ci < colsN; ci++) {
        //let tdID = 'r' +ri +'c' +ci;
        tdStr += '<td>' + Arr[ri][ci] + '</td>';
      } // end for cols
    }
    else {
      tdStr += '<td colspan="10" class="freeTimeTd"> -- свободно -- </td>';
    }
    return tdStr;
  }//end doTdStr

  function condFormatBookingTable(freeTime, minFreeTime, timeslotN, curTime) {
    let trClassList = [];
    let groupName;
    if (timeslotN <= 17) {
      groupName = 'groupN';
    } else {
      groupName = 'groupD';
    }

    if (timeslotN % 2) {
      groupName += '-odd';
    }
    trClassList.push(groupName);

    if(freeTime <= minFreeTime) {
      trClassList.push('noTime-book');
    }

    if ( curTime < (nowTimeUTC - GVAR.GMToffset) ) { // - offset for UTC!!! ) {
      trClassList.push('pastSlot');
    }

    let trClassStr = trClassList.join(' ');
    return trClassStr;
  }
}//=====END setBookingTable==================


function parseTariff(tariffStr) {
  let resStr;
  switch (true) {
  case (tariffStr == '1.5 минуты'):
    resStr = 'ПР доп. 1.5';
    break;
  case /Серт/i.test(tariffStr):
    resStr = 'ПР Серт.';
    break;
  case /Спорт.*Лик.*Борз/i.test(tariffStr):
    resStr = 'Спорт БЛЮкэмп';
    break;

  case /Спорт/i.test(tariffStr):
    resStr = 'Спорт ';
    resStr += /\d+.*\d+/.exec(tariffStr);
    if ( /ночн/.test(tariffStr) ) {
      resStr += ' Н';
    } else if ( /прайм/.test(tariffStr) ) {
      resStr += ' PR';
    }
    break;

  case /Pro /i.test(tariffStr):
    resStr = 'Sport ';
    resStr += /\d+/.exec(tariffStr);
    if ( /night/.test(tariffStr) ) {
      resStr += ' N';
    } else if ( /peak/.test(tariffStr) ) {
      resStr += ' PR';
    }
    break;

  case /^\d+/.test(tariffStr):
    resStr = 'ПР ';
    break;
  case /-\s*20%$/i.test(tariffStr):
    resStr = 'ПР -20%';
    break;

  case /благотв/i.test(tariffStr):
    resStr = 'Бл-ть';
    break;


  default:
    resStr = tariffStr.substr(0, 15);
    break;
  }

  return resStr;
}






function scrollToCurrentTime(noScrollToggle) {
  if (MODE != 'bookings') return;
  let currentTime = Date.now();
  let targetTr = getTarget( currentTime, true );

  if( !targetTr || noScrollToggle ) {
    let targetTime = Date.parse(GVAR.stDate);
    targetTr = getTarget( targetTime + _date.hr24, false);
  }

  scrollToElement(targetTr);
  blinkElem(targetTr);

  setTimeout( () => {
    scrollToElement('homeButton');
  }, 5000);

  function getTarget(timeMs, toggleGMT) {

    let dateStr = _date.msToCustomDateObj(timeMs, toggleGMT);
    let targetTrId = (dateStr.dateN + '_' + dateStr.time);
    let targetTr = document.getElementById(targetTrId);
    return targetTr;
  }
}// end scrollToCurrentTime

function scrollToElement(theElement) {
  if (typeof theElement === 'string') {
    theElement = document.getElementById(theElement);
  }

  theElement.scrollIntoView(
    {
      block: 'center',
      behavior: 'smooth'
    }
  );
}// end scrollToElement

function blinkElem(elem) {
  if (typeof(elem) === 'string') {
    elem = document.getElementById(elem);
  }
  elem.classList.toggle( 'blinkElem' );
  setTimeout( () => {
    elem.classList.toggle( 'blinkElem' );
  }, 4000);
}// end blinkElem