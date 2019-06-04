/*global
 mainTableState,
 GVAR


 _date

*/



function setBookingTable(Arr, tbody) {
  tbody = tbody || document.createElement('tbody');
  let rowsN = Arr.length,
    colsN = Arr[0].length;
  let {timeCol, timeValCol} = GVAR.bookingDataMap;

  let firstRow = document.createElement('tr');
  firstRow.innerHTML = '<th id="r0c0">' + 'Date/Time' + '</th>' +
                       '<td>' + 'min' + '</td>' +
                       '<td>' + 'Tariff' + '</td>' +
                       '<td>' + 'Flyers' + '</td>' +
                       '<td>' + 'Notes' + '</td>' +
                       '<td>' + 'Booking №' + '</td>' +
                       '<td>' + 'Status' + '</td>' +
                       '<td>' + 'mail' + '</td>' +
                       '<td>' + 'phone' + '</td>';
  tbody.appendChild(firstRow);

  for(let ri = 0; ri < rowsN; ri++) {
    let dateStr =  _date.msToCustomDateObj( Arr[ri][timeCol] );
let freeTime = 30 - Arr[ri][timeValCol];
let curTimeslotN = _date.msToSlotN( Arr[ri][timeCol] );

    let tr = document.createElement('tr');
    
    if (curTimeslotN <= 17) {
      tr.classList.add('groupN');
    } else {
      tr.classList.add('groupD');
    }
    if (curTimeslotN % 2) {
      tr.classList.add('odd');
    }

    if(freeTime <= 0) {
      tr.classList.add('noTime-book');
    }


    let rowStr = '';
    rowStr += '<th id="r' +ri +'c0">' +
            '<span class="tdSpan">'+
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
