# Appointment Scheduler using Google Calendar API

This is a Node.js-based appointment scheduling service that integrates with **Google Calendar** and **Dialogflow** to book and manage appointments in real-time. The service uses a Google Service Account to interact with the Google Calendar API and schedule appointments based on user input, checking availability and managing slots.

---

## 🚀 Features

- 📅 Schedules appointments directly in a Google Calendar.
- ⚖️ Automatically checks availability and offers alternative time slots if fully booked.
- 🧠 Dialogflow webhook support for natural language input.
- ⏰ Timezone-aware event scheduling (supports `Asia/Kolkata`).
- 🔐 Secure access using a Google Service Account.

---

## 🛠️ Setup

### 1. Clone the Repository

```bash
git clone https://github.com/KhushaliTrivedi/appointmentScheduler.git
cd appointmentScheduler
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Add Google Service Account

- Go to Google Cloud Console.
- Create a Service Account.
- Enable Google Calendar API.
- Download the service account JSON key.
- Place the JSON file inside your project root (e.g., service-account.json).

### 4. Share Google Calendar with Service Account

- Go to Google Calendar
- Open the calendar you're using.
- Click on Settings and Sharing.
- Under Share with specific people, add the service account email (xxx@xxx.iam.gserviceaccount.com) and give Make changes to events permission.

### 📁 File Structure

```bash
.
├── helper-functions/
│   └── google-calender.js        # Contains logic for interacting with Google Calendar API
├── service-account.json          # Your Google service account credentials
├── src/
│   └── index.js                  # Main Express app and webhook handler
└── .env                          # Environment variables (optional)
```

### 🧠 Dialogflow Integration

- In Dialogflow, go to Fulfillment and enable Webhook.
- Add your server URL (e.g., https://yourdomain.com/webhook).

- Create intents:

- schedule-appointment (trigger booking flow)
- user-number-entered (collect name and number)
- reschedule-appointment (handle slot changes)

### 🧪 Sample Event Insert

- If you want to manually insert an event:

```bash
const event = {
  summary: 'Appointment with John Doe',
  description: 'Customer contact: 1234567890',
  start: {
    dateTime: '2025-06-05T11:00:00.000+05:30',
    timeZone: 'Asia/Kolkata',
  },
  end: {
    dateTime: '2025-06-05T12:00:00.000+05:30',
    timeZone: 'Asia/Kolkata',
  },
};

await insertEvent(event);
```
