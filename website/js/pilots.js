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
};

async function checkLogin() {
  let data = {};
  data[callsign] = password;
  let response = await fetch("http://localhost:3000/login", {
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

async function getDataRestricted() {

};

var root = document.getElementById("root");
var loggedIn;
var password;
var callsign;
getCreds();
async () => {
  loggedIn = await checkLogin();
}

if (!loggedIn) {
  root.innerHTML = '<a id="nologin">You are not logged in!</a>';
} else {
  
};