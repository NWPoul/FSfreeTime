//GLOBAL VARIABLES
var TOGGLE = 'JSONP';//'local'//

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