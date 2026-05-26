const { google } = require('googleapis');

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

exports.createCalendarEvent = async (user, booking) => {
  if (!user.googleRefreshToken) {
    console.log(`User ${user.email} has no Google Calendar connected.`);
    return;
  }

  oauth2Client.setCredentials({
    refresh_token: user.googleRefreshToken
  });

  const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

  const isService = !!booking.service;
  const item = isService ? booking.service : booking.equipment;

  const event = {
    summary: `AgriShare: ${item.name}`,
    description: `Booking confirmed for ${item.name}. Status: Accepted.`,
    start: {
      dateTime: booking.startDate,
      timeZone: 'UTC',
    },
    end: {
      dateTime: booking.endDate,
      timeZone: 'UTC',
    },
    attendees: [
      { email: booking.farmer?.email },
      { email: user.email }
    ],
    reminders: {
      useDefault: false,
      overrides: [
        { method: 'email', minutes: 24 * 60 },
        { method: 'popup', minutes: 30 },
      ],
    },
  };

  try {
    const response = await calendar.events.insert({
      calendarId: 'primary',
      resource: event,
      sendUpdates: 'all',
    });
    console.log('Event created: %s', response.data.htmlLink);
    return response.data;
  } catch (error) {
    console.error('Error creating calendar event:', error);
  }
};
