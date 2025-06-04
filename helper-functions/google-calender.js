const { google } = require('googleapis');
require('dotenv').config();

const SCOPES = 'https://www.googleapis.com/auth/calendar';

const CREDENTIALS = require("../service-account.json");
const calendarId = '5a6f689a60100f5ba9734706864e6dbb6d1bc6adb73ff3072a727b5664bab9c8@group.calendar.google.com';
const calendar = google.calendar({ version: "v3" });

const auth = new google.auth.JWT(
    CREDENTIALS.client_email,
    null,
    CREDENTIALS.private_key,
    SCOPES
);

const insertEvent = async (event) => {

    let response = await calendar.events.insert({
        auth: auth,
        calendarId: calendarId,
        resource: event
    });

    if (response['status'] == 200 && response['statusText'] === 'OK') {
        return 1;
    } else {
        return 0;
    }
};

const getEvents = async (dateTimeStart, dateTimeEnd, timeZone) => {

    let len = [];
    let response = await calendar.events.list({
        auth: auth,
        calendarId: calendarId,
        timeMin: dateTimeStart,
        timeMax: dateTimeEnd,
        timeZone: timeZone
    });

    len['count'] = response['data']['items'].length;
    len['data'] = response['data'];

    return len;
};

module.exports = {
    insertEvent,
    getEvents
}