function getCookie(cname) {
    let name = cname + "=";
    let decodedCookie = decodeURIComponent(document.cookie);
    let ca = decodedCookie.split(';');
    for(let i = 0; i <ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) == ' ') {
        c = c.substring(1);
      }
      if (c.indexOf(name) == 0) {
        return c.substring(name.length, c.length);
      }
    }
    return "";
  }

getData();

callsign = "";
password = "";

async function getData() {
    getCreds();
    let res = await fetch(`http://thcr.me:81/getData?callsign=${callsign}&password=${password}`, {
        method: 'GET',
        mode: 'cors',
        headers: {
            'Content-Type': 'application/json'
        },
    });
    let data = await res.json();
    console.log(data);
};

async function getDataRestricted() {

};

function getCreds() {
    callsign = getCookie("callsign");
    password = getCookie("password");
};

