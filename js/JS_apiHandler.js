//GLOBAL VARIABLES
var TOGGLE = 'JSONP';//'local'//

var TESTCopyExecuteShiftChangeAPI_url = 'https://script.google.com/macros/s/AKfycbye8JAXiJfseuPCq-X8z7CWqEc6vq-y9GqjhpFk8ump2Rx-HQ/exec';

/*global
 user,
 userPs,
 raspData,
 testAPIanswer,
 prevReqData,
 devMode,

 start,
 storeUser,
 prevReqHandling,
 logInResponseHandler,
 changesUpploadResponse,
*/

// eslint-disable-next-line no-unused-vars
function loginRequest (nick, ps) {
  let url = TESTCopyExecuteShiftChangeAPI_url;
  let parametersObj = {
    'user': nick,
    'ps': ps
  };

  let callBackFunction = function () {
    let response = '';
    if (!APIanswer) {
      response = 'No response!';
    } else if (!APIanswer.code || !APIanswer.val) {
      response = 'invalid response';


    } else if (APIanswer.code == '200') {
      storeUser(nick, ps);
      response = 'Пользователь ' + nick + ' успешно авторизован!';
      start();


    } else {
      response = APIanswer.val;
    }

    console.log( response );
    swal(response);
  };

  JSONP_HTTP_Request(url, parametersObj, callBackFunction);
}





function JSONP_HTTP_Request(url, parametersObj, callBackFunction) {
  var targetNode = document.head;
  var newScript_tag = document.createElement('script');

  var parametersStr = '';
  for (var parameter in parametersObj){
    if (parameter == 'callBackFunction') continue;
    parametersStr += '&' + parameter + '=' + parametersObj[parameter];
  }
  var src = url + '?' + parametersStr;

  callBackFunction =    callBackFunction || parametersObj.callBackFunction
                     || function () { console.log(APIanswer); };

  newScript_tag.type = 'text/javascript';
  newScript_tag.src = src;
  newScript_tag.onload = function () {
    console.log('reqLoaded!');
    callBackFunction();
    targetNode.removeChild(newScript_tag);
    console.log(APIanswer);
  };

  targetNode.appendChild(newScript_tag);
}





function promisedPOST(url, params) {
  return new Promise(function(resolve, reject) {
    var paramsQstring = '';
    for (let param in params){
      paramsQstring += '&' + param + '=' + params[param];
    }

    var req = new XMLHttpRequest();

    req.open('post', url);
    //request.setRequestHeader("X-Requested-With", "XMLHttpRequest");
    req.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    //request.setRequestHeader('Accept', 'charset=windows-1252');
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
    }; // make the request

    req.send(paramsQstring);//formData);

  });
}