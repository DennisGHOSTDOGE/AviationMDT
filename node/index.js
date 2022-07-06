const express = require('express');
const cors = require('cors');
const hash = require('sha1');
const fs = require('fs');

//Get data
var dataRaw = fs.readFileSync('./node/data.json', 'utf8');
var data;

if (dataRaw.length < 1) {
    data = {
        pilots: {

        },
        pilotsRestricted: {

        }
    };
    saveData();
} else {
    data = JSON.parse(dataRaw);
};

//Helper functions
function saveData() {
    if (!fs.existsSync('./node/data.json')) fs.writeFile('./node/data.json', "", 'utf8');
    fs.writeFileSync('./node/data.json', JSON.stringify(data), 'utf8');
};

function getLowestCallsign() {
    for (let i = 50; i <= 1000; i++) {
        if (!(i in data.pilots) && !(i in data.pilotsRestricted)) {
            return i;
        };
    };
};

//Classes
class Lesson {
    constructor(notes, type, student) {
        this.notes = notes;
        this.type = new lessonTypes(parseInt(type));
        this.student = student;
    };
};

class Pilot {
    constructor(name, planeLessons, heliLessons, certs, lessons, override) {
        this.name = name;
        this.planeLessons = planeLessons;
        this.heliLessons = heliLessons;
        this.certs = certs;
        this.lessons = lessons;
        this.override = override;
        this.password = hash(name);
    };
};

class Certs {
    constructor(heli, heavyheli, plane, heavyplane, perfplane, cfi) {
        this.heli = heli;
        this.heavyheli = heavyheli;
        this.plane = plane;
        this.heavyplane = heavyplane;
        this.perfplane = perfplane;
        this.cfi = cfi;
    };
};

class lessonTypes {
    constructor(type) {
        switch (type) {
            case 0:
                this.type = "Helicopter";
                break;
            case 1:
                this.type = "Heavyweight Helicopter";
                break;
            case 2:
                this.type = "Plane";
                break;
            case 3:
                this.type = "Heavyweight Plane";
                break;
            case 4:
                this.type = "Performance Plane";
                break;
        };
    };
};

saveData();

//API
const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

app.get('/getData', (req, res) => {
    let callsignAuth = req.query.callsign;
    let password = req.query.password;
    if (!data.pilots[callsignAuth].password == password) return;
    let pilots = data.pilots;
    res.send(pilots);
});

app.get('/getDataRestricted', (req, res) => {
    let callsignAuth = req.query.callsign;
    let password = req.query.password;
    if (!data.pilots[callsignAuth].password == password || !data.pilots[callsignAuth].certs.cfi) return;
    let pilots = data.pilots;
    pilots = { ...data.pilots, ...data.pilotsRestricted };
    res.send(pilots);
});

app.post('/addPilot', (req, res) => {
    if (req.query.name.length < 1) {
        res.send("Please enter a name!");
        return;
    };
    let callsignAuth = req.query.callsign;
    let password = hash(req.query.password);
    if (!data.pilots[callsignAuth].password == password || !data.pilots[callsignAuth].certs.cfi) {
        res.send("Invalid perms");
        return;
    };
    let callsign = getLowestCallsign();
    data.pilots[callsign] = new Pilot(req.query.name, 0, 0, new Certs(false, false, false, false, false, false), [], null, hash("ILoveAviation"));
    res.send('done');
    saveData();
});

app.post('/addPilotRestricted', (req, res) => {
    console.log(req.query.password)
    if (req.query.name.length < 1) {
        res.send("Please enter a name!");
        return;
    };
    let callsignAuth = req.query.callsign;
    let password = hash(req.query.password);
    if (callsignAuth in data.pilots) {
        if (!data.pilots[callsignAuth].password == password || !data.pilots[callsignAuth].certs.cfi) {
            res.send("Invalid perms");
            return;
        };
    } else if (callsignAuth in data.pilotsRestricted) {
        if (!data.pilotsRestricted[callsignAuth].password == password || !data.pilotsRestricted[callsignAuth].certs.cfi) {
            res.send("Invalid perms");
            return;
        };
    } else {
        res.send("Invalid login!");
        return;
    }

    let callsign = getLowestCallsign();
    data.pilotsRestricted[callsign] = new Pilot(req.query.name, 0, 0, new Certs(false, false, false, false, false, false), [], null, hash("ILoveAviation"));
    res.send('done');
    saveData();
});

app.post('/addPilotManual', (req, res) => {
    let callsignAuth = req.query.callsign;
    let password = req.query.password;
    if (!data.pilots[callsignAuth].password == password || !data.pilots[callsignAuth].certs.cfi) return;
    if (req.query.restricted == "true") {
        data.pilotsRestricted[req.query.callsign] = new Pilot(req.query.name, 0, 0, new Certs(false, false, false, false, false, false), [], null, hash("ILoveAviation"));
    } else {
        data.pilots[req.query.callsign] = new Pilot(req.query.name, 0, 0, new Certs(false, false, false, false, false, false), [], null, hash("ILoveAviation"));
    }

    res.send('done');
    saveData();
});

app.post('/changeLicense', (req, res) => {
    let callsignAuth = req.query.callsign;
    let password = req.query.password;
    if (!data.pilots[callsignAuth].password == password || !data.pilots[callsignAuth].certs.cfi) return;
    if (req.query.callsign in data.pilotsRestricted) {
        data.pilotsRestricted[req.query.callsign].certs[req.query.cert] = !(data.pilotsRestricted[req.query.callsign].certs[req.query.cert]);
    } else {
        data.pilots[req.query.callsign].certs[req.query.cert] = !(data.pilots[req.query.callsign].certs[req.query.cert]);
    }
    saveData();
    res.send("done");
});

app.post('/setOverride', (req, res) => {
    let callsignAuth = req.query.callsign;
    let password = req.query.password;
    if (!data.pilots[callsignAuth].password == password || !data.pilots[callsignAuth].certs.cfi) return;
    if (req.query.callsign in data.pilots) {
        data.pilots[req.query.callsign].override = req.query.override;
    } else {
        data.pilotsRestricted[req.query.callsign].override = req.query.override;
    }
    saveData();
    res.send("done");
});

app.post('/addLesson', (req, res) => {
    let callsignAuth = req.query.callsign;
    let password = req.query.password;
    if (!data.pilots[callsignAuth].password == password || !data.pilots[callsignAuth].certs.cfi) return;
    let cfi = req.query.cfi;
    let student = req.query.student;
    let notes = req.query.notes;
    let type = req.query.type;
    let lesson = new Lesson(notes, type, student);
    if (cfi in data.pilots) {
        data.pilots[cfi].lessons.push(lesson);
    } else {
        data.pilotsRestricted[cfi].lessons.push(lesson);
    };
    saveData();
    res.send("done");
});

app.post('/login', (req, res) => {
    let callsign = Object.keys(req.body)[0];
    let password = hash(Object.values(req.body)[0]);
    let data = JSON.parse(fs.readFileSync('./node/data.json', 'utf8'));
    console.log("Login requested.")
    if (callsign in data.pilots) {
        if (data.pilots[callsign].password == password) {
            res.send(JSON.stringify({ valid: true }));
        } else {
            res.send(JSON.stringify({ valid: false }));
        }
    } else if (callsign in data.pilotsRestricted) {
        if (data.pilotsRestricted[callsign].password == password) {
            res.send(JSON.stringify({ valid: true }));
        } else {
            res.send(JSON.stringify({ valid: false }));
        }
    } else {
        res.send(JSON.stringify({ valid: false }));
    }

})

app.listen(port, () => {
    console.log(`Server started on port ${port}`);
});
