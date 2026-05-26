const { google } = require('googleapis');
const User = require('../models/User');

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

exports.getAuthUrl = (req, res) => {
  const url = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: ['https://www.googleapis.com/auth/calendar.events'],
    prompt: 'consent',
    state: req.user.id // Pass user ID in state to identify them on callback
  });
  res.json({ url });
};

exports.handleCallback = async (req, res) => {
  const { code, state } = req.query;
  try {
    const { tokens } = await oauth2Client.getToken(code);
    if (tokens.refresh_token) {
      await User.findByIdAndUpdate(state, { googleRefreshToken: tokens.refresh_token });
      res.send('Successfully connected Google Calendar! You can close this tab.');
    } else {
      res.send('Successfully connected! (Note: Already had access). You can close this tab.');
    }
  } catch (error) {
    console.error('Error in Google Callback:', error);
    res.status(500).send('Failed to connect Google Calendar.');
  }
};
