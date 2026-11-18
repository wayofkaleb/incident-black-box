# Incident Black Box

A fictional game server just went down. A suspicious sign-in landed around the same time. Put the logs together and see what the evidence actually supports.

[Play the case on Midnight Packet](https://packet-arcade.solehyssop8.chatgpt.site/labs/incident-black-box/)

## Play a case

Read the sign-in, deploy, and service logs. Pin the events you think matter and use the UTC timeline to check the order. Make your call, then download a report you could hand to the next person on shift.

## Run it locally

Open `index.html` in a browser. The lab runs on local JavaScript with a bundled fictional case. There are no live targets or accounts involved.

`case-data.js` holds the case and its evidence. `app.js` handles the timeline, case submission, and report export. `sample-postmortem.md` shows how the case can be written up and contains the outcome.
