var user = document.getElementById("username");
var pass = document.getElementById("password");

async function validate() {
    if (!(user.value.length > 0 && pass.value.length > 0)) {
        alert("Make sure to fill out all the fields!");
        return;
    };
    let data = {};
    data[user.value] = pass.value;
    let response = await fetch("http://thcr.me:81/login", {
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
