/*global
 mainTableState,
 GVAR
 toggle

 _date
 setTimeSlotArr

*/

function setFreeTimeTable(bookingObj, tbody) {
  tbody = tbody || document.createElement('tbody');

  let days = Object.keys(bookingObj);

  let tr1 = '<th id="r0c0">' + 'Slot' + '</th>';
  days.forEach(day => {
    let testDayVal = new Date( +day * _date.hr24 );
    let hDayStr = ( _date.isHoliday( testDayVal.getUTCMonth(), testDayVal.getUTCDate(), testDayVal.getUTCDay() ) ) ?
      ' class = "hDay"' : '';
    testDayVal = (testDayVal.getUTCDate() +'/' +(testDayVal.getUTCMonth()+1) );

    tr1 += '<td' +hDayStr +' >' +testDayVal +'</td>';
  });
  let firstRow = document.createElement('tr');
  firstRow.innerHTML = tr1;
  tbody.appendChild(firstRow);


  let timeSlots = setTimeSlotArr();
  let trStrArr = [];
  timeSlots.forEach( (slot, iSlot) => {
    let initContent = timeSlots[iSlot][2];
    initRow(trStrArr, iSlot, initContent);
  });//end for cols

  days.forEach( (day, iDay) => {
    rowsCycle(day, iDay);
  });//end for cols


  function rowsCycle(day, iDay) {
    let curDayTimeSlots = GVAR.bookingObj[day];
    curDayTimeSlots.forEach( (freeTimeVal, iSlot) => {
      fillRow(trStrArr, iSlot, iDay, freeTimeVal);
    });
  }// end for rows

  function initRow(rowsArr, ri, content) {
    rowsArr[ri] ='<th id="r' +ri +'c0">'
                  +content +'</th>';
  }

  function fillRow(rowsArr, ri, ci, content) {
    let tdID = 'r' +ri +'c' +ci;
    rowsArr[ri] += '<td id="' +tdID +'">'
                    +content +'</td>';
  }


  trStrArr.forEach( (trStr) => {
    let tr = document.createElement('tr');
    tr.innerHTML = trStr;
    tbody.appendChild(tr);
  });

  return(tbody);
}//=====END setBookingTable==================



function condFormatFreetime(tbody) {
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
    if (ri % 2) { groupName+='-odd'; }

    tr.classList.add(groupName);
    tr.cells[0].classList.add(groupName);

    for (let ci = colsCnt; --ci > 0;) {
      let td = rowsCollection[ri].cells[ci];
      let freeTimeVal = +td.innerHTML;
      let tdClass;
      if (freeTimeVal > 28 ) {
        tdClass = 'fullTime';
      } else if(freeTimeVal < 2 ) {
        tdClass = 'noTime';
      } else if (freeTimeVal < minTime ) {
        tdClass = 'lessTime';
      }
      td.classList.add(tdClass);
    }//endfor ci
  }//endfor ri

}//=====END condFormatFreetime===============================
