/*global
 mainTableState,
 GVAR

 getSVGicon

 _date

*/



function setBookingTable(Arr, tbody) {
  tbody = tbody || document.createElement('tbody');
  tbody.classList.add('bookingTbody');
  let rowsN = Arr.length,
    colsN = Arr[0].length;


  let {timeCol, timeValCol} = GVAR.bookingDataMap;

  let firstRow = document.createElement('tr');
  firstRow.innerHTML = '<th id="r0c0" class="th0" >' + 'Date/Time' + '</th>' +
                       '<td>' + getSVGicon('stopwatch') + '</td>' +
                       '<td>' + 'Tariff' + '</td>' +
                       '<td>' + 'Flyers' + '</td>' +
                       '<td>' + 'Notes' + '</td>' +
                       '<td>' + 'Booking №' + '</td>' +
                       '<td>' + 'Status' + '</td>';

// !!! DEV - cut off phones & e-mails
if (GVAR.user.toLowerCase() == 'tst') {
  firstRow.innerHTML += '<td>' + 'mail' + '</td>' + '<td>' + 'phone' + '</td>';
} else {
  colsN -= 2; // !!! DEV - cut off phones & e-mails
}

  tbody.appendChild(firstRow);

  for(let ri = 0; ri < rowsN; ri++) {
    let dateStr =  _date.msToCustomDateObj( Arr[ri][timeCol] );
let freeTime = 30 - Arr[ri][timeValCol];
let curTimeslotN = _date.msToSlotN( Arr[ri][timeCol] );

    let tr = document.createElement('tr');
    tr.setAttribute( 'id', (dateStr.dateN + '_' + dateStr.time) );

    let groupName;
    if (curTimeslotN <= 17) {
      groupName = 'groupN';
    } else {
      groupName = 'groupD';
    }
    if (curTimeslotN % 2) {
      groupName += '-odd';
    }
    tr.classList.add(groupName);

    if(freeTime <= 0) {
      tr.classList.add('noTime-book');
    }


    let rowStr = '';
    rowStr += '<th ' + ('id="r' +ri +'c0" ') +'>' + // +('class="' +groupName +'"')
            '<span class="tdSpan">' +
               dateStr.dayName + ', ' +
               dateStr.dayN + '/' +
               dateStr.monthN + ' ' +
            '</span><br />'+
               dateStr.time + ' ' +
            //  dateStr.dateN +
            '</th>';

    for (let ci = 2; ci < colsN; ci++) {
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




/* condFormatBooking
function condFormatBooking(tbody) {
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
*/


function parseTariff(tariffStr) {
  let resStr;
  switch (true) {
  case (tariffStr == '1.5 минуты'):
    resStr = 'ПР доп. 1.5';
    break;
  case /Серт/i.test(tariffStr):
    resStr = 'ПР Серт.';
    break;
  case /Спорт*Лик*Борз/i.test(tariffStr):
    resStr = 'Спорт БЛЮ кэмп';
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