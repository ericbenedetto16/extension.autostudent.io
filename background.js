// This is the script that listens for events
// const API_URL = 'https://pacific-shore-95767.herokuapp.com';
const API_URL = 'http://localhost:5000';

// Alarm Handler
const alarmCallback = async (a) => {
    console.log(`Alarm Fired: ${a.name} ${a.scheduledTime}`);

    // Attach SessionID
    const headers = new Headers();
    headers.append('sessionid', window.sessionid);

    // TODO: Check if Update Alarm
    /*const s = await fetch(`${API_URL}/api/v1/events/refresh`,{
        method: 'POST',
        headers
    })*/

    // TODO: Get Login/Logout Script
    const s = await fetch(`${API_URL}/api/v1/events/trigger/${a.name}`, {
        method: 'POST',
        headers,
    });

    // Set the Alarms
    const j = await s.json();
    if (!j.success) throw new Error('Invalid Response from Server');
    setAlarms(j.events);

    //TODO: Implement Sending Notifications
    // sendNotification(j.notification_title, j.notification_body, j.notification_action);
};

// Notification Handler
const notificationAcceptCallback = (n) => {
    console.log(n);
};

const notificationDismissCallback = (n) => {
    console.log(n);
};

const notificationButtonCallback = (n) => {
    console.log(n);
};

// Register Event Listeners Here
chrome.alarms.onAlarm.addListener(alarmCallback);
chrome.notifications.onClosed.addListener(notificationAcceptCallback);
chrome.notifications.onClicked.addListener(notificationDismissCallback);
chrome.notifications.onButtonClicked.addListener(notificationButtonCallback);

// Login Here
const login = async (d) => {
    const headers = new Headers();
    headers.append('Content-Type', 'application/json');
    d = {
        email: 'ericbenedettodev@gmail.com',
        password: 'password',
    };
    const logged = await fetch(`${API_URL}/api/v1/users/login`, {
        method: 'POST',
        headers,
        body: JSON.stringify(d),
    });

    const j = await logged.json();
    if (j.success === true) {
        // console.log(j.student.login_key);
        window.sessionid = j.student.login_key;
        getAlarms(window.sessionid, j.student._id);
        // console.log('logged in');
    }
};

const getAlarms = async (sessionid, uid) => {
    const headers = new Headers();
    headers.append('Content-Type', 'application/json');
    headers.append('sessionid', sessionid);

    const a = await fetch(`${API_URL}/api/v1/student/${uid}`, {
        method: 'POST',
        headers,
    });

    const j = await a.json();
    // console.log(j);
    if (!j.success) throw new Error('Problem Getting Alarms');

    setAlarms(j.events);
};

const setAlarms = async (als) => {
    chrome.alarms.clearAll();
    als.forEach(({ id, when }) => {
        chrome.alarms.create(id, {
            when: new Date(when).getTime(),
        });
    });

    chrome.alarms.getAll((a) =>
        a.map((al) => {
            console.log(al, new Date(al.scheduledTime).toLocaleString());
        })
    );
};

// TODO: On Startup Clear Alarms and Login
login();

console.log('Background Script Running!');
