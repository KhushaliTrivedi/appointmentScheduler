const express = require('express');
const bodyParser = require('body-parser');
require('dotenv').config();

const webApp = express();

webApp.use(bodyParser.urlencoded({
    extended: true
}))

webApp.use(bodyParser.json()); 

const PORT = 8000;

webApp.get('/', (req, res) => {
    res.send(`Hello World.!`);
});

const gc = require('../helper-functions/google-calender');

// Converts the date and time from Dialogflow into
// date --> year-month-day
// time --> hour:minute
// hour --> (Integer) hour
const getDateTimeHour = (date, time) => {

    let year = date.split('T')[0].split('-')[0];
    let month = date.split('T')[0].split('-')[1];
    let day = date.split('T')[0].split('-')[2];

    let hour = time.split('T')[1].split(':')[0];
    let minute = time.split('T')[1].split(':')[1];

    return {
        'date': `${year}-${month}-${day}`,
        'time': `${hour}:${minute}`,
        'hour': parseInt(hour)
    };
};

// Converts the date and time from Dialogflow into
// January 18, 9:30 AM
const dateTimeToString = (date, time) => {

    let year = date.split('T')[0].split('-')[0];
    let month = date.split('T')[0].split('-')[1];
    let day = date.split('T')[0].split('-')[2];

    let hour = time.split('T')[1].split(':')[0];
    let minute = time.split('T')[1].split(':')[1];

    let newDateTime = `${year}-${month}-${day}T${hour}:${minute}`;

    let event = new Date(Date.parse(newDateTime));

    let options = { month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric' };

    return event.toLocaleDateString('en-US', options);
};

const TIMEOFFSET = '+00:00';

// Get date-time string for calender
const dateTimeForCalander = (date, time) => {

    let year = date.split('T')[0].split('-')[0];
    let month = date.split('T')[0].split('-')[1];
    let day = date.split('T')[0].split('-')[2];

    let hour = time.split('T')[1].split(':')[0];
    let minute = time.split('T')[1].split(':')[1];

    let newDateTime = `${year}-${month}-${day}T${hour}:${minute}:00.000${TIMEOFFSET}`;

    let event = new Date(Date.parse(newDateTime));

    let startDate = event;
    let endDate = new Date(new Date(startDate).setHours(startDate.getHours()+1));

    return {
        'start': startDate,
        'end': endDate
    }
};

// Converts 24 hrs time into 12 hrs time
const convertTime24to12 = (time24) => {

    let tmpArr = time24.split(':'), time12;
    if (+tmpArr[0] == 12) {
        time12 = tmpArr[0] + ':' + tmpArr[1] + ' PM';
    } else {
        if (+tmpArr[0] == '00') {
            time12 = '12:' + tmpArr[1] + ' AM';
        } else {
            if (+tmpArr[0] > 12) {
                time12 = (+tmpArr[0] - 12) + ':' + tmpArr[1] + ' PM';
            } else {
                time12 = (+tmpArr[0]) + ':' + tmpArr[1] + ' AM';
            }
        }
    }
    return time12;
};

// converts 12 hrs time into 24 hrs time
const convertTime12To24 = timeStr => {
    const [time, modifier] = timeStr.split(" ");

    let [hours, minutes] = time.split(':');

    if (hours === '12') {
        hours = '00';
    }
    if (modifier.includes('PM')) {
        hours = parseInt(hours, 10) + 12;
        console.log(`hours2:${hours}`);
    }
    return `${hours}:${minutes}`;
 };

let slots = [];
const getFilledTimeSlots = data => {
    let dateTimeX = data.start.dateTime;
    let newTime = new Date(dateTimeX).toLocaleString('en-US', {
        timeZone : 'GMT',
    });
    let timeX = newTime.split(', ')[1]
        var a = timeX;
        var b = " ";
        var position = 7;
        var output = [a.slice(0, position), b, a.slice(position)].join('');
    const newTimeX = convertTime12To24(output);
    console.log(`getslots${newTimeX}`);
    slots.push(newTimeX);
}

function removeDuplicates(arr) {
    return arr.filter((item,
        index) => arr.indexOf(item) === index);
}

const OPENTIME = 10;
const CLOSETIME = 16;

const TIMEZONE = 'Asia/Kolkata';

// Schedule Appointment Action
const ScheduleAppointment = async (req) => {

    let timeString = req['body']['queryResult']['parameters']['time'];
    let dateString = req['body']['queryResult']['parameters']['date'];

    let dateTimeHour = getDateTimeHour(dateString, timeString);
    let appointmentTimeString = dateTimeToString(dateString, timeString);
    let dateTimeCalander = dateTimeForCalander(dateString, timeString);

    let outString;
    let responseText = {};

    // If time is out of range for opening and closing hours
    if (dateTimeHour['hour'] < OPENTIME || dateTimeHour['hour'] > CLOSETIME) {
        outString = 'We are open from 10 AM to 8 PM, please choose a time in between.';
        responseText = {'fulfillmentText': outString};
    // If time is exactly same as opening and closing hours
    } else if (dateTimeHour['hour'] == OPENTIME || dateTimeHour['hour'] == CLOSETIME) {
        outString = 'Please choose a time after 10 AM and before 8 PM.';
        responseText = {'fulfillmentText': outString};
    // If time is good then check for the existing appointments
    } else {
        // Check here with the airtable data
        // let len = await ad.checkAppointmentExist(dateTimeHour['date'], dateTimeHour['time']);

        //

        //    your code should be here and it should return the numbers of appointment at the
        //    perticular time  

        //

        console.log('here in else');
        let len = await gc.getEvents(dateTimeCalander['start'], dateTimeCalander['end'], TIMEZONE);

        if (len.count != 3 || len.count < 3) {
            outString = `We are available on ${appointmentTimeString}. Do you want to confirm it?`;
            let session = req['body']['session'];
            let context = `${session}/contexts/await-confirmation`;
            let sessionVars = `${session}/contexts/sessionvars`;
            responseText = {
                'fulfillmentText': outString,
                'outputContexts': [{
                    'name': context,
                    'lifespanCount': 1
                }, {
                    'name': sessionVars,
                    'lifespanCount': 50,
                    'parameters': {
                        'time': timeString,
                        'date': dateString
                    }
                }]
            };
        } else {

            // If we are full at the give time and date
            // Show some options to the user

            // let availableTimeSlots = await ad.getTimeslots(dateTimeHour['date']);
            let len = await gc.getEvents(dateTimeCalander['start'], dateTimeCalander['end'], TIMEZONE);

            let items = len.data.items;
            for (const [key, value] of Object.entries(items)) {
                getFilledTimeSlots(value);
            }

            slots = removeDuplicates(slots);
            console.log(`slots: ${slots}`)

            let totalTimeSlots = ['10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00'];

            let availableTimeSlots = totalTimeSlots.filter(x => !slots.includes(x));
            console.log(availableTimeSlots);
            // If by chance we don't have any free slot
            if (availableTimeSlots.length == 0) {
                outString = `Sorry, we are not available on ${appointmentTimeString}`;
                responseText = {
                    'fulfillmentText': outString
                }
            } else {
                // Show the free time slots
                outString = `Sorry, we are not available on ${appointmentTimeString}. However, we are free on ${appointmentTimeString} at {${availableTimeSlots}}`;
                let session = req['body']['session'];
                let rescheduleAppointment = `${session}/contexts/await-reschedule`;
                let sessionVars = `${session}/contexts/sessionvars`;
                responseText = {
                    'fulfillmentText': outString,
                    'outputContexts': [{
                        'name': rescheduleAppointment,
                        'lifespanCount': 1
                    }, {
                        'name': sessionVars,
                        'lifespanCount': 50,
                        'parameters': {
                            'time': timeString,
                            'date': dateString
                        }
                    }]
                };
            }
        }
    }
    return responseText;
};

// Insert the invent to the calender
const addEventInCalender = async (req) => {

    let outString;
    let responseText = {};

    let outputContexts = req['body']['queryResult']['outputContexts'];
    let name, number, time, date;

    // console.dir(outputContexts);

    outputContexts.forEach(outputContext => {
        let session = outputContext['name'];
        if (session.includes('/contexts/sessionvars')) {
            name = outputContext['parameters']['name'];
            number = outputContext['parameters']['phone-number'];
            time = outputContext['parameters']['time'];
            date = outputContext['parameters']['date'];
        }
    });

    let calenderDates = dateTimeForCalander(date, time);
    let appointmentTimeString = dateTimeToString(date, time);

    let event = {
        'summary': `Appointment for ${name}.`,
        'description': `Customer mobile number ${number}.`,
        'start': {
            'dateTime': calenderDates['start'],
            'timeZone': TIMEZONE
        },
        'end': {
            'dateTime': calenderDates['end'],
            'timeZone': TIMEZONE
        }
    };

    // Insert the data to Google Calender
    let flag = await gc.insertEvent(event);

    // let fields = {
    //     'Name': name,
    //     'Mobile Number': number,
    //     'Appointment Date': date.split('T')[0],
    //     'Appointment Time': time.split('T')[1].substring(0, 5)
    // }
    // Insert the data to the Airtable
    // let atflag = await ad.insertAppointment(fields);

    // Reset all the context
    let session = req['body']['session'];
    let awaitName = `${session}/contexts/await-number`;
    let sessionVars = `${session}/contexts/sessionvars`;

    if (flag == 1) {
        outString = `Appointment is set for ${appointmentTimeString}.`;
        responseText = {
            'fulfillmentText': outString,
            'outputContexts': [{
                'name': awaitName,
                'lifespanCount': 0
            }, {
                'name': sessionVars,
                'lifespanCount': 0,
            }]
        };
    } else {
        outString = 'An error occured, please try again after some time.';
        responseText = {
            'fulfillmentText': outString,
            'outputContexts': [{
                'name': awaitName,
                'lifespanCount': 0
            }, {
                'name': sessionVars,
                'lifespanCount': 0,
            }]
        };
    }

    return responseText;
};

// When user chooses the time slots provided by us
const rescheduleAppointment = async (req) => {

    let timeString = req['body']['queryResult']['parameters']['reTime'];

    outString = `What first name I use to book the appointment?`;
    
    let session = req['body']['session'];
    let sessionVars = `${session}/contexts/sessionvars`;

    responseText = {
        'fulfillmentText': outString,
        'outputContexts': [{
            'name': `${session}/contexts/await-name`,
            'lifespanCount': 1
        }, {
            'name': sessionVars,
            'lifespanCount': 50,
            'parameters': {
                'time': timeString,
            }
        }]
    };

    return responseText;
}

webApp.post('/webhook', async (req, res) => {

    let action = req['body']['queryResult']['action'];
    let responseText = {};
    
    if (action === 'schedule-appointment') {
        console.log('here in schedule appointment')
        responseText = await ScheduleAppointment(req);
    } else if (action === 'user-number-entered') {
        console.log('here in Add event')
        responseText = await addEventInCalender(req);
    } else if (action === 'reschedule-appointment') {
        console.log('here in Reschedule')
        responseText = await rescheduleAppointment(req);
    }

    res.send(responseText);
});

webApp.listen(PORT, () => {
    console.log(`Server is running at ${PORT}`);
});