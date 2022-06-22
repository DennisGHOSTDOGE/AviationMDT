var user = document.getElementById("username");
var pass = document.getElementById("password");

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

async function validate() {
    if (!(user.value.length > 0 && pass.value.length > 0)) {
        alert("Make sure to fill out all the fields!");
        return;
    };
    let data = {};
    data[user.value] = pass.value;
    let response = await fetch("http://thcr.me:3000/login", {
        method: 'POST',
        mode: 'cors',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    });
    data = await response.json();
    if (data.valid == true) {
        document.cookie = `callsign=${user.value};`;
	    document.cookie = ` password=${pass.value}`;
        alert(`You are now logged in as pilot ${user.value}`);
        window.location.href = "./index.html";
    } else {
        alert("Your username, password or both are incorrect!");
    };
}

var callsign;
var password;

getCreds();
if (checkLogin()) window.location.href = "./index.html";
