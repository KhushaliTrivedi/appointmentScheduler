const {google} = require('googleapis');
require('dotenv').config();

const SCOPES = 'https://www.googleapis.com/auth/calendar';

const CREDENTIALS = { "type": "service_account",
"project_id": "test-chatbot-ycs9",
"private_key_id": "069ce7063219c96a94c053b2ba27febb040ba429",
"private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQCoDFCCwMMSPIYM\nRdxEPg4AIed/dT/CE5OSij3J36ZRnyLi9r7ANG7/TkdVXnu4rqKacjeUcdiqxbUH\nuV98YatQIeBfu80dszhvjiqRGy9kFyc5YsSYYcSvYJRMEJ5tDlp9Qxq3intWnDbh\noGZn2hUIf3+RqTMFCX0zWJ5qQGBL4EXEmWtbl22BksNr7qT1WVc39i+6E56yY4S6\ns8/Ar/uMz+yLVlN51CJS6YDCxneIwJF3+1puTeAzO4HGWkGaeYIPSeYrP+hmI+IF\n36CGwrnkXSl+bOtoSIm5+BJ7RFEIRRRE7AbbdbU4w3WWxcnL3ZKCUPeCcCvHwW68\nb8LeNxEjAgMBAAECggEABseYZ+4G8LFoZw5aeJZYUkEL6eR9EgNgLMVPANn5B8n3\nylhSEccLw1kRH6yUKTtCbCC3hVGigCFB0HH2HDqEgtMbDkGxYMVePYHqzbffDZax\nimslq1AmczzePsNc4OF3XR5b8ZOwrinXPPsPppjxyEn8h4/f8xAS8QNeQMMgH294\nDLim5+8DC/XtB2F/BJ6PlEMueg1amNSbAP7cYpy7f0uIfOAFo6yZ0eWltSGNDLoE\ncWP5+5FbPAFd2UaQcg21NK2qjlUxm03dAMFWLunMim+SMH//IQr6Y+YC/DAu/qif\nzumSu90F9JK7qdg+NF3MevXhDMn1Sj1O/iHBxtel4QKBgQDmjz83+TiITcpXMLCe\ntrK4+cgitIlSMfg29uYLpAAF4DmyMH6JAx64HWGBy369S3bpyjgR3zrOzR/hGZ6q\nhys7FusfOZQ18gBYha3ptzqIg1Yqy/ZEALIgxkp+C7CxgnwFTOF86aKYPnjgV4o8\nF/pMYhfFQn0dXS48qLfqRsizxwKBgQC6l0TvjSylZglkW+rpYVqwjz5wb6y0eMAj\nAforw4CBe+HFWmgB4DjzEZCN/rXlAh9TsZhazkReubRtrwQ8AIHb2Liz94EZz/p0\nVV2UtGxcWH7+sLPhyPspKE+TcsFnFw6IPHVFpGPIx+BxLEOukEGw8ehAUj+J8X0A\nK6hc/MN/xQKBgQCkFjrV6Ub0qvhgiUSKEFiuEQcAvCAnIW0YISukCToC9IvbZ2wG\nsvO/8RkeOOegbP7acJLrFUZTO+V+XK9xifWYfj0j4eS7Z9obJjiZ509/LIm8t6Ay\n0ZP0g2ssvcEo9Eaztv2b2uNfGscIUwUMs7vtdLqaJzHIHjLz9Ne/olTgrQKBgBoN\nEKTZcwhMrLcEVlHrM7w+45rTHKu9yCWbGxCNJR3u6+Cf9LF+WrUlGKeajk7A8xq+\nSuUyszz+dIBz1QWDlJ3bLj6CKdYuwWsImB4w6ogiGuj4RsUZSGfApwuRFAuOnorK\n1hy5DO11apKieXifz2wi+igw04ow2yDw93q0F595AoGAcl7xpO1Xtc/X0pcTGj/1\nFC1F/FUC3oSZm37OS9DvJ8gtGFFVN/yYApYr77RpaCqMP0hWwuQ1i8EOxgsn7PvD\n3oV1d8r+ijMTTOlBw16cgXWtcywYvnUrogAAs+6LWiTdBcXVay4KlCOIOkFAu6ed\nQdN3zYqdgPdp/P3cvt3PUho=\n-----END PRIVATE KEY-----\n",
"client_email": "appointment-scheduler@test-chatbot-ycs9.iam.gserviceaccount.com",
"client_id": "102709412193164064227",
"auth_uri": "https://accounts.google.com/o/oauth2/auth",
"token_uri": "https://oauth2.googleapis.com/token",
"auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
"client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/appointment-scheduler%40test-chatbot-ycs9.iam.gserviceaccount.com"
};

const calendarId = '5a6f689a60100f5ba9734706864e6dbb6d1bc6adb73ff3072a727b5664bab9c8@group.calendar.google.com';
const calendar = google.calendar({version : "v3"});

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