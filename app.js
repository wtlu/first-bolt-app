let moment = require('moment');

const { App } = require('@slack/bolt');

// Initializes your app with your bot token and signing secret
const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET
});
const userToken = process.env.SLACK_USER_TOKEN;

// Listens to incoming messages that contain "hello"
app.message('hello', ({ message, say }) => {
  // say() sends a message to the channel where the event was triggered
  say({
    blocks: [
      {
        "type": "section",
        "text": {
          "type": "mrkdwn",
          "text": `Hey there <@${message.user}>!`
        },
        "accessory": {
          "type": "button",
          "text": {
            "type": "plain_text",
            "text": "Click Me"
          },
          "action_id": "button_click"
        }
      }
    ]
  });
});

// Unix Epoch time for September 30, 2019 11:59:59 PM
const whenSeptemberEnds = 1569887999;

app.message('wake me up', async ({ message, context }) => {
  try {
    // Call the chat.scheduleMessage method with a token
    const result = await app.client.chat.scheduleMessage({
      // The token you used to initialize your app is stored in the `context` object
      token: context.botToken,
      channel: message.channel.id,
      post_at: whenSeptemberEnds,
      text: 'Summer has come and passed'
    });
  }
  catch (error) {
    console.error(error);
  }
});

app.action('button_click', ({ body, ack, say }) => {
  // Acknowledge the action
  ack();
  say(`<@${body.user.id}> clicked the button`);
});

// The echo command simply echoes on command
app.command('/echo', async ({ command, ack, say }) => {
  // Acknowledge command request
  ack();

  say(`${command.text}`);
});

// The echo command simply echoes on command
app.command('/schedule', async ({ command, message, ack, say, context}) => {
  // Acknowledge command request
  ack();

  say(`I will say this in one min: ${command.text}`);
  console.log(command);
  const newTime = moment().utc().add(1, 'minutes').unix();

  try {
    // Call the chat.scheduleMessage method with a token
    const result = await app.client.chat.scheduleMessage({
      // The token you used to initialize your app is stored in the `context` object
      token: userToken, //context.botToken,
      channel: command.channel_id,
      as_user: true,
      post_at: newTime,
      text: `${command.text}`
    });
  }
  catch (error) {
    console.error(error);
  }
});

(async () => {
  // Start your app
  await app.start(process.env.PORT || 4390);

  console.log('⚡️ Bolt app is running!');
})();