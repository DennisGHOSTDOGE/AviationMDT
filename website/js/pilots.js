const url = "thcr.me";
const port = "3000";

//Function to retrieve cookies
function getCookie(cname) {
  let name = cname + "=";
  let decodedCookie = decodeURIComponent(document.cookie);
  let ca = decodedCookie.split(';');
  for(let i = 0; i <ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) == ' ') {
      c = c.substring(1);
    };
    if (c.indexOf(name) == 0) {
      return c.substring(name.length, c.length);
    };
  };
  return "";
};

//Updates credentials (if they exist)
function getCreds() {
  callsign = getCookie("callsign");
  password = getCookie("password");
  console.log(callsign, password)
};

async function checkLogin() {
  console.log("Checking login");
  let data = {};
  data[callsign] = password;
  let response = await fetch("http://" + url + ":" + port + "/login", {
        method: 'POST',
        mode: 'cors',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    });
    data = await response.json();
    return data.valid;
};

async function getData(pass, call) {
  let response = await fetch("http://" + url + ":" + port + "/getData?password=" + pass + "&callsign=" + call, {
    method: 'GET',
    mode: 'cors',
  });
  let data = await response.json();
  return data;
};

async function getDataRestricted(pass, call) {
  let response = await fetch("http://" + url + ":" + port + "/getDataRestricted?password=" + pass + "&callsign=" + call, {
    method: 'GET',
    mode: 'cors',
  });
  let data = await response.json();
  return data;
};

var root = document.getElementById("root");
var loggedIn;
var password;
var callsign;
getCreds();
loggedIn = checkLogin();

if (!loggedIn) {
  root.innerHTML = '<a id="nologin">You are not logged in!</a>';
} else {
  var data = getData(password, callsign);
  if (data[callsign].certs[5]) data = getDataRestricted(password, callsign);
};