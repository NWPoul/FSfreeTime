
/*global
 user,
 userPs,
 raspData,

 loginRequest,
 parseTdIndex,
 defineShift,
 uploadChanges,
 reset
 */


// eslint-disable-next-line no-unused-vars
function checkChanges() {
  var changeList = getChangeList();
  if (!changeList.length) return;
  var RecordsPerDate = getRecordsPerDate(changeList);
  var problemSum = getProblems(RecordsPerDate);

  if (problemSum.length) {
    var message = '';
    problemSum.forEach( (elem) => {
      message += elem.Date + ':';
      if (elem.nonMatched) {
        if (elem.nonMatched.missed) { message += '\n Потеряно: ' + elem.nonMatched.missed.join(', '); }
        if (elem.nonMatched.over) {message += '\n Лишнее: ' + elem.nonMatched.over.join(', '); }
      }
      if (elem.dnViolations) {
        message += '\n Не выспятся: ';
        for ( let key in elem.dnViolations ) {
          message += ' ' + key;
        }
      }
      if (elem.HDayViolations) {
        message += '\n Устанут в выходной: ';
        for ( let key in elem.HDayViolations ) {
          message += ' ' + key;
        }
      }
      message += ' \n\n';
    });// end for each problem (result - the message)
    //message += 'Ввести комментарий/объяснение, нажать "OK" и отправить запрос как есть \n';
    //message += 'Нажать "Отмена" и исправить запрос\n\n';

    //Problem dialog:
    swal({
      buttons: ['Добавить комментарий и отправить', 'Исправить запрос' ],
      title: 'Проблемы с запросом!',
      text: message
    })
      .then((choice) => {
        if (!choice) {
          swal('введите комментарий / объяснение', {
            content: 'input'
          })
            .then( (ask1) => {
              if (ask1) {
                sendRequest( RecordsPerDate, false, 'bad ' + ask1); //("Запрос с каментом1: " + ask1);
                //return;
              } else {
                swal('комментарий при отправке проблемного запроса обязателен!', {
                  timer: 1500
                });
              }//end if for 1st ask for comment
            });
        } else {
          return; // confirm = возврат и правка:
        }// end problems solving choice
      });// END Problem dialog

  } else {

    //NO problem dialog:
    swal({
      title: 'Запрос проверен!',
      buttons: {
        back: {
          text: 'вернуться к заменам',
          value: 'back',
        },
        comment: {
          text: 'добавить комментарий',
          value: 'comment',
        },
        confirm: {
          text: 'отправить запрос',
          value: 'confirm'
        }
      }
    })
      .then((choice) => {
        switch  (choice) {
        case 'comment':
          swal('комментарий к запросу', {
            content: {
              element: 'input',
              attributes: {
                placeholder: 'комментарий'
              }
            }
          })
            .then( (note) => {
              sendRequest(RecordsPerDate, true, note);
            });
          break;

        case 'confirm':
          sendRequest(RecordsPerDate, true);
          break;

        case 'back':
          return;
        }
      });// END NO Problem dialog

  }//end if problems

}// END checkChanges

function getChangeList() {
  var mainTable = document.getElementById('mainTable');
  var changedTdList = Array.prototype.slice.call( mainTable.getElementsByClassName('changed') );
  var changeList = [];

  changedTdList.forEach( function(td) {
    var tdIndex = parseTdIndex(td.id);
    var newShift = td.innerHTML;
    if (newShift == '-' || newShift == 'no') {newShift = '';} // Костыль для срвнения пустых смен таблицы с данными из расписания

    var shiftDate = raspData[0][ tdIndex[1] ];
    var instr = raspData[ tdIndex[0] ][0];

    var raspShift = raspData[ tdIndex[0] ][ tdIndex[1] ];


    changeList.push({
      TD: td,
      tdIndex: tdIndex,
      shiftDate: shiftDate, //shiftDate[2] + "/" + shiftDate[1] + " " + shiftDate[3],
      instr: instr,
      newShift: newShift,
      raspShift: raspShift
    });

  }); //end for each td
  return changeList;
} //===== END getChangeList (return changeList) =====

function getRecordsPerDate(changeList) {
  var RecordsPerDate = [];

  changeList.forEach( function(chRecord, i) {
    var DateIndex = changeList[i].tdIndex[1];
    var curNewShift = defineShift(changeList[i].newShift),
      curRaspShift = defineShift(changeList[i].raspShift);

    if (!RecordsPerDate[DateIndex]) {
      RecordsPerDate[DateIndex] =    {
        shiftDate: changeList[i].shiftDate,
        dateIndex: DateIndex,
        showDate: changeList[i].shiftDate[2] + '/' + changeList[i].shiftDate[1] + ' ' + changeList[i].shiftDate[3],

        TDchanged: [],
        tdIndexes: [],
        newShifts: [],
        raspShifts: [],
        newShiftsCnt: {},
        raspShiftsCnt: {}   };
    }

    var curRec = RecordsPerDate[DateIndex];
    curRec.TDchanged.push(chRecord.TD);
    curRec.tdIndexes.push(chRecord.tdIndex);
    curRec.newShifts.push(curNewShift);
    curRec.raspShifts.push(curRaspShift);

    doShiftsSet(curNewShift, curRec.newShiftsCnt);
    doShiftsSet(curRaspShift, curRec.raspShiftsCnt);
  });
  return RecordsPerDate;
}//end getRecordsPerDate (return RecordsPerDate) ===

function doShiftsSet(curShift, ShiftsCnt) {// --- sub function for Shifts counter
  if (curShift.Type == 'no') return;
  var tmpShiftSet = (curShift.Type == 'ДН')?
    curShift.Part.slice(1) :
    [curShift.Name];

  tmpShiftSet.forEach( (tmpShift) => {
    if (!ShiftsCnt[tmpShift]) { ShiftsCnt[tmpShift] = 1;
    } else { ShiftsCnt[tmpShift]++ ;
    }
  }); //end for each tmpShift
} //=== end subfunction (set shifts counter)



function getProblems(RecordsPerDate) {

  var nonMatched = {};
  var dnViolations = {};
  var HDayViolations = {};
  var problemSum = [];

  RecordsPerDate.forEach( function(Record) {

    // 1 check for missed/over shifts ---
    for (let shift in Record.raspShiftsCnt) {
      if (!Record.newShiftsCnt[shift]) {
        nonMatchedAdd(nonMatched, Record.showDate, 'missed', shift, Record.raspShiftsCnt[shift]);
      } else if (Record.newShiftsCnt[shift] != Record.raspShiftsCnt[shift]) {
        var shiftDiff = Record.raspShiftsCnt[shift]-Record.newShiftsCnt[shift];
        var diffType = (shiftDiff > 0) ? 'missed' : 'over';

        nonMatchedAdd(nonMatched, Record.showDate, diffType, shift, Math.abs(shiftDiff) );
      }
    } //end for raspShifts

    for (let shift in Record.newShiftsCnt) {
      if (!Record.raspShiftsCnt[shift]) {
        nonMatchedAdd(nonMatched, Record.showDate, 'over', shift, Record.newShiftsCnt[shift]);
      }
    } //end for newShifts


    for (let i=0; i < Record.TDchanged.length; i++) {

      var TD = Record.TDchanged[i];
      var tdIndex = parseTdIndex(TD.id);
      var instr = raspData[ tdIndex[0] ][0];
      var NewShift = Record.newShifts[i];


      // 2 check for D - N rule ---
      var prevRaspShift = defineShift(TD.previousElementSibling.innerHTML || '');
      var nextRaspShift = defineShift(TD.nextElementSibling.innerHTML || '');

      if (    /Н/i.test(NewShift.Type) && /[ДЖ]/i.test(nextRaspShift.Type) ||
           /[ДЖ]/i.test(NewShift.Type) &&    /Н/i.test(prevRaspShift.Type)   ) {

        violationsAdd(dnViolations, instr, Record.showDate, tdIndex);
      }


      // 3 check for HDay rule ---
      if (NewShift.Type == 'ДН' && Record.shiftDate[4]) {
        violationsAdd(HDayViolations, instr, Record.showDate, tdIndex);
      }

    }//end for shifts in Record



    var cur_problems = {};
    if ( nonMatched[Record.showDate] ) { cur_problems.nonMatched = (nonMatched[Record.showDate]); }
    if ( dnViolations[Record.showDate] ) { cur_problems.dnViolations = (dnViolations[Record.showDate]); }
    if ( HDayViolations[Record.showDate] ) { cur_problems.HDayViolations = (HDayViolations[Record.showDate]); }

    if (Object.keys(cur_problems).length) {
      cur_problems.Date = Record.showDate;
      problemSum.push(cur_problems);
    }

  }); //end for each RecordsPerDate


  console.log(problemSum);

  return problemSum;
} // ===== End getProblems (return problemSum) =====

function nonMatchedAdd(nonMatchedArr, date, type, shift, shiftCnt) {
  if (!nonMatchedArr[date]) nonMatchedArr[date] = {};
  if (!nonMatchedArr[date][type]) nonMatchedArr[date][type] = [];

  nonMatchedArr[date][type].push(shiftCnt+'_'+shift);
}//=== end subfunction (add nonMatched)

function violationsAdd(violationArr, instr, date, tdIndex) {

  if (!violationArr[date]) {
    violationArr[date] = {};
  }
  violationArr[date][instr] = tdIndex.slice();

}//=== end subfunction (add violations)



//+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
//===== Send requests block =================================================================
//===========================================================================================

function sendRequest(Records, valid, notes) {

  var changesForUpload = prepareChangesForUpload(Records, valid, notes);
  uploadChanges(changesForUpload);
  swal({
    title: 'Запрос отправлен!',
    timer: 1000
  });

  reset();
}//end sendRequest

function prepareChangesForUpload( Records, valid, notes ) {
  var changesForUppload = {
    'user'  : user,
    'ps'    : userPs,
    'reqN'  : ~~(Date.now()/1000) - 1500000000,
    'valid' : valid,
    'notes' : notes,
    'shifts': []
  };

  Records.forEach( (rec) => {
    var curChange = {
      date: ~~(rec.shiftDate[0]/86400000), //выводим в кол дней по JS +отбрасываем дробную часть
      dateShifts: []
    };
    rec.tdIndexes.forEach( (tdIndex, i) => {

      curChange.dateShifts.push(
        {instr: raspData[ tdIndex[0] ][0],
          shift: rec.newShifts[i].Name}
      );
    }); //end foreach newShifts

    changesForUppload.shifts.push(curChange);
  }); //end foreach record

  console.log(changesForUppload);
  return changesForUppload;
}//end prepareChangesForUpload











//////////////////////////////////////////////////////////////////////////////////////////////////////////
/////   Authorisation module /////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////

// id = localStorage.getItem('id');
// if(!id) {
//   id = idRequest();
// }

function logIn () {

  let nick = prompt( 'введите Ваш ник в системе', '' );

  if (!nick) {
    alert('Ник - обязателен!');
    return false;
  } else {
    nick = nick.toUpperCase();
  }

  let ps = prompt('введите Ваш пароль в системе или "?" для отправки пароля на e-mail', '');

  loginRequest(nick, ps);
}

// eslint-disable-next-line no-unused-vars
function storeUser(nick, ps) {
  if (!nick || !ps) return;
  localStorage.setItem('user', nick);
  localStorage.setItem('userPs', ps);
  user = nick;
  userPs = ps;
}

function logOut() {
  localStorage.removeItem('user');
  localStorage.removeItem('id');
  user = null;
  userPs = null;
  setLoginButtonText('Log in');
}

function setLoginButtonText(text) {
  if (!text) return;
  var loginButton = document.getElementById('loginButton');
  loginButton.innerText = text;
}

// eslint-disable-next-line no-unused-vars
function loginButtonClick(button) {
  if (!button || button.id != 'loginButton') return;
  if (button.innerHTML != 'Log in') {
    var out = confirm('выйти?');
    if (out) logOut();
    return;
  }
  logIn();
}

/*
// eslint-disable-next-line no-unused-vars
function logInResponseHandler(logInResponse) {
  var userRec = JSON.parse(logInResponse) || 'error';
  console.log(logInResponse);
  if (userRec == 'error') {
    alert('Ошибка авторизации, обратись к админу!');
  }

  if (!userRec.lName || userRec.nick == 'NoN') {
    alert('Аккаунт не опознан, продолжай как анонимоус и обратись к админу!');
  } else {
    //      alert('Аккаунт: ' + userRec.lName);
  }

  logIn(userRec.nick);
}// END logInResponseHandler ==========================
*/



//===== End authorisation module ========================================================================




// new req module++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++


// function testPOSTButtonClick(button) {
//   uploadChanges();
// }
