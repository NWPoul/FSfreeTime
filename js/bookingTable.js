/*global
 GVAR
 MODE

 getSVGicon

 _date

*/



function setBookingTable(Arr, mainTable) {
  let minFreeTime = 2;
  let nowTimeUTC = Date.now();
  let {timeCol, timeValCol} = GVAR.bookingDataMap;
  let adminToggle = (GVAR.user.toLowerCase() == 'tst');

  let colsCnt = (adminToggle) ? Arr[0].length : Arr[0].length - 2; // !!! DEV - cut off phones & e-mails

  mainTable.innerHTML = doHeaderStr(adminToggle);
  mainTable.insertAdjacentHTML( 'beforeEnd', doRowsStr(Arr, colsCnt) );

  let hTh = document.getElementById('th0');
  setHeaderDiv(hTh);
  setDayHeaderObserver();

  return;



  function doHeaderStr(adminToggle) {
    let headerArr = [ 'Time', getSVGicon('stopwatch'), 'Tariff', 'Flyers', 'Notes', 'Booking №', 'paid' ];
    let headerAdm = ['mail','phone'];
    if(adminToggle) headerArr = headerArr.concat(headerAdm);

    let headerStr = '<tbody id="btHeaderTbody" class="bookingTbody">' +
                    '<tr id="btHeaderTr" class="tableHeader">' +
                    '<th id="th0" class="th0">' +headerArr.shift() +'</th>';
    headerStr += '<th class="th-header">' +headerArr.join('</th><th class="th-header">') +'</th>';

    return headerStr;
  }

  function doRowsStr(Arr, colsCnt) {
    let rowsCnt = Arr.length;
    let RowsStr = initDailyTbody( Arr[0][timeCol] );

    for(let ri = 1; ri < rowsCnt; ri++) {               // ri=1 coz continue after setup in let Rowstr
      var curTime = Arr[ri][timeCol];                   // !var - coz need scope!
      let dateObj = _date.msToCustomDateObj( curTime );
      let curTimeslotN = _date.msToSlotN( curTime );

      if (curTimeslotN === 0) {
        RowsStr += '</tbody>' +initDailyTbody( curTime );
      } // end marking new date

      let freeTime = 30 - Arr[ri][timeValCol];

      let trId = (dateObj.dateN + '_' + dateObj.time);

      let trClassStr = condFormatBookingTable(freeTime, minFreeTime, curTimeslotN, curTime);
      let rowSpan = ( freeTime >= minFreeTime && freeTime < 30) ? 'rowspan="2"' : '' ;

      let trStrStart = '<tr ' +('id="' +trId +'" ') +('class="' +trClassStr +'" ') +' >';
      let thStr = doThStr(ri, rowSpan, dateObj);
      let tdStr = doTdStr(freeTime, ri);

      let trStr = trStrStart +thStr +tdStr +'</tr>';
      RowsStr += trStr;

      if(rowSpan) {
        let adTrStr = '<tr ' +('class="' +trClassStr +'" ') +' >' +
        '<td colspan="' +colsCnt +'" class="freeTimeTd">' +' -- свободно ' +freeTime +' мин. --' +'</td>' +
        '</tr>';
        RowsStr += adTrStr;
      }
    }//end for rows
    return RowsStr;
  }//END doRowsStr

  function initDailyTbody( msTime ) {
    let date = new Date(msTime);
    let dateStr = date.toLocaleDateString('ru-RU', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    let dateObj = _date.customDate(date);

    let tbodyId = _date.dateToYYYYMMDD(date,'');//dateObj.dayN +'_' +dateObj.monthN;
    let newDayTrStr =
      '<tr id="' +dateObj.dateN +'_0"' +'class="newDayTr">' +
        '<th>' + dateObj.dayName +', ' +
                 dateObj.dayN +'/' +
                 dateObj.monthN +' ' +
        '</th>' +
        '<td></td>' +
        '<td colspan="' +(colsCnt-1) +'">' +
                 dateStr +( (dateObj.HDay) ? ' (вых) ' : ' (будень)' ) +
        '</td>' +
      '</tr>';

    let tbodyInitStr = '<tbody id=' +tbodyId +' class="bookingTbody"' +'>' +newDayTrStr;
    return tbodyInitStr;
  }//end initDailyTbody

  function setHeaderDiv(hTh) {
    let divHeader = document.createElement('div');
    divHeader.id = 'divHeader';
    divHeader.classList.add('divHeader');
    divHeader.setAttribute('data-day', '');
    divHeader.onclick = callRaspPage;

    divHeader.innerHTML = 'div Header!';
    hTh.appendChild(divHeader);

    return divHeader;
  }// end setHeaderDiv

  function doThStr(ri, rowSpan, dateObj) {
    let ThStr = '<th ' +rowSpan +' >' +
      dateObj.time +' <br />' +
      '<span class="tdSpan">' +'</span>' +
    '</th>';
    return ThStr;
  }// end doThStr
  function doTdStr(freeTime, ri) {
    let tdStr = '';
    if (freeTime < 30) {
      for (let ci = 2; ci < colsCnt; ci++) {
        tdStr += '<td class="pf">' +Arr[ri][ci] +'</td>';
      } // end for cols
    }
    else {
      tdStr += '<td colspan="' +colsCnt +'" class="freeTimeTd"> -- свободно -- </td>';
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

    trClassList.push(groupName);

    if (timeslotN % 2) {
      trClassList.push('odd');
    }


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
  let targetTime = currentTime;
  let toggleGMT = true;

  let targetTr = getTarget( currentTime, toggleGMT );
  if ( !targetTr || noScrollToggle ) {
    targetTime = Date.parse(GVAR.stDate) + _date.hr24;
    toggleGMT = false;
  }

  scrollToTime(targetTime, toggleGMT);
} //end scrollToCurrentTime


function scrollToTime(targetTime, toggleGMT = true) {
  if (MODE != 'bookings') return;
  let targetTr = getTarget( targetTime, toggleGMT );

  if( !targetTr ) return;

  scrollToElement(targetTr);
}// END scrollToCurrentTime


function scrollToElement(theElement, observerToggle = true, scrollOptions) {
  if (typeof theElement === 'string') {
    theElement = document.getElementById(theElement);
  }

  if (!theElement) {
    console.log('element not found! ');
    return;
  }

  if (observerToggle) setTargetObserver(theElement);

  theElement.scrollIntoView(
    scrollOptions ||
    {
      block: 'center',
      behavior: 'smooth'
    }
  );
}// end scrollToElement





function getTarget(timeMs, toggleGMT) {
  let dateObj = _date.msToCustomDateObj(timeMs, toggleGMT);
  let targetTrId = (dateObj.dateN + '_' + dateObj.time);
  let targetTr = document.getElementById(targetTrId);
  return targetTr;
}//End getTarget

function setTargetObserver(targetElem) {
  // let options = {
  //   root: document.getElementById('inner'),
  //   rootMargin: '-40% 0% -40% 0%'
  // };
  // let callback = function (entries, observer) {
  //   entries.forEach(entry => {
  //     if (entry.isIntersecting) {
  //       blinkElem(entry.target);
  //       observer.disconnect();
  //       changeHeader();
  //       scrollToElement('homeButton', false);
  //     }
  //   });
  // };
  // let observer = new IntersectionObserver(callback, options);
  // observer.observe(targetElem);

  console.log('setTargetObserver');
}//end setTargetObserver

function blinkElem(elem) {
  if (typeof(elem) === 'string') {
    elem = document.getElementById(elem);
  }
  elem.classList.toggle( 'blinkElem' );
  setTimeout( () => {
    elem.classList.toggle( 'blinkElem' );
  }, 3000);
}// end blinkElem
