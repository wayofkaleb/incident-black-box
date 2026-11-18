"use strict";

const byId = id => document.getElementById(id);
const caseFile = blackBoxCase;
const records = new Map(caseFile.sources.flatMap(source => source.events.map(event => [
  event.id, { ...event, source: source.label }
])));
const requiredEvidence = new Set(caseFile.requiredEvidence);
const pinLimit = requiredEvidence.size + 1;
const pinned = new Set();
let currentSource = caseFile.sources[0];
let activeFinding = null;

const sourceButtons = new Map();
const pinButtons = new Map();
const form = byId("finding-form");
const timeline = byId("timeline");
const feedback = byId("finding-feedback");
const checkFinding = byId("check-finding");

byId("case-id").textContent = caseFile.id;
byId("case-title").textContent = caseFile.title;
byId("case-brief").textContent = caseFile.brief;
byId("timeline-description").textContent = `Keep up to ${pinLimit} records. They appear here in UTC order.`;

function makeButton(label) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = "lab-button";
  button.textContent = label;
  return button;
}

function selectedRecords() {
  return [...pinned].map(id => records.get(id)).sort((left, right) => left.time.localeCompare(right.time));
}

function timeLabel(time) {
  return time.slice(11, 19);
}

function announce(message) {
  byId("status").textContent = message;
}

function chosenCause() {
  return form.querySelector('input[name="cause"]:checked')?.value;
}

function clearFinding() {
  activeFinding = null;
  feedback.hidden = true;
  byId("completed-report").hidden = true;
  checkFinding.disabled = !chosenCause() || pinned.size === 0;
}

function renderRecord(event, location) {
  const inTimeline = location === "timeline";
  const entry = document.createElement("li");
  entry.className = inTimeline ? "evidence-entry" : "log-entry";

  const text = document.createElement("div");
  const time = document.createElement("time");
  time.dateTime = event.time;
  time.textContent = `${timeLabel(event.time)} UTC`;
  if (inTimeline) {
    const label = document.createElement("span");
    label.className = "source-name";
    label.textContent = `[${event.source}]`;
    time.append(" ", label);
  }

  const message = document.createElement("p");
  message.textContent = event.text;
  text.append(time, message);

  const button = makeButton(inTimeline ? "Remove" : "Pin");
  if (inTimeline) {
    button.setAttribute("aria-label", `Remove ${event.source} record at ${timeLabel(event.time)} UTC`);
  } else {
    button.setAttribute("aria-label", `Pin ${event.source} record at ${timeLabel(event.time)} UTC`);
    pinButtons.set(event.id, button);
  }

  button.addEventListener("click", () => {
    if (pinned.has(event.id)) {
      pinned.delete(event.id);
      announce(`Removed the ${event.source} record at ${timeLabel(event.time)} UTC. ${pinned.size} pinned.`);
    } else if (pinned.size === pinLimit) {
      announce(`Timeline is full. Remove a record before adding another.`);
      byId("evidence-count").textContent = `${pinned.size} / ${pinLimit} pinned · full`;
      return;
    } else {
      pinned.add(event.id);
      announce(`Pinned the ${event.source} record at ${timeLabel(event.time)} UTC. ${pinned.size} pinned.`);
    }
    syncPins();
    renderTimeline();
    clearFinding();
    if (inTimeline) (timeline.querySelector("button") ?? byId("timeline-heading")).focus();
  });

  entry.append(text, button);
  return entry;
}

function syncPins() {
  for (const [id, button] of pinButtons) {
    const selected = pinned.has(id);
    button.setAttribute("aria-pressed", String(selected));
  }
}

function renderSource(source) {
  currentSource = source;
  for (const [id, button] of sourceButtons) button.setAttribute("aria-pressed", String(id === source.id));
  byId("source-description").textContent = source.description;
  byId("source-entries").setAttribute("aria-label", `${source.label} records`);
  pinButtons.clear();
  byId("source-entries").replaceChildren(...source.events.map(event => renderRecord(records.get(event.id), "source")));
  syncPins();
}

function renderTimeline() {
  timeline.replaceChildren(...selectedRecords().map(event => renderRecord(event, "timeline")));
  byId("timeline-empty").hidden = pinned.size > 0;
  byId("evidence-count").textContent = `${pinned.size} / ${pinLimit} pinned`;
}

function showFeedback(title, message, complete) {
  byId("feedback-heading").textContent = title;
  byId("feedback-copy").textContent = message;
  byId("completed-report").hidden = !complete;
  feedback.hidden = false;
  byId("feedback-heading").focus();
}

for (const source of caseFile.sources) {
  const button = makeButton(source.label);
  button.setAttribute("aria-controls", "source-panel");
  button.addEventListener("click", () => {
    renderSource(source);
    announce(`Opened ${source.label}. ${source.events.length} records.`);
  });
  sourceButtons.set(source.id, button);
  byId("log-switcher").append(button);
}

for (const cause of caseFile.causes) {
  const option = document.createElement("label");
  option.className = "cause-option";
  const input = document.createElement("input");
  input.type = "radio";
  input.name = "cause";
  input.value = cause.id;
  option.append(input, cause.label);
  byId("cause-options").append(option);
}

for (const question of caseFile.takeaways) {
  const item = document.createElement("li");
  item.textContent = question;
  byId("open-questions").append(item);
}

form.addEventListener("change", clearFinding);
form.addEventListener("submit", event => {
  event.preventDefault();
  const cause = caseFile.causes.find(option => option.id === chosenCause());
  if (!cause || pinned.size === 0) return;
  if (cause.id !== caseFile.correctCause) {
    showFeedback("Check the sequence", cause.feedback, false);
    return;
  }
  if (![...requiredEvidence].every(id => pinned.has(id))) {
    showFeedback("Your timeline needs one more pass", "Pin the records that show what changed, how the server reacted, and what the sign-in could access.", false);
    return;
  }

  activeFinding = cause;
  showFeedback("Finding supported", caseFile.summary, true);
});

function incidentReport() {
  const timelineLines = selectedRecords().map(event => `- ${event.time} [${event.source}] ${event.text}`);
  const questions = caseFile.takeaways.map(text => `- ${text}`);
  return [
    "# Incident Black Box", "",
    `Case ${caseFile.id} / ${caseFile.title}`,
    `Service ${caseFile.service}`,
    "Fictional incident", "",
    "## Finding", "", activeFinding.label, "", caseFile.summary, "",
    "## Pinned records (UTC)", "", ...timelineLines, "",
    "## Still open", "", ...questions, ""
  ].join("\n");
}

byId("download-report").addEventListener("click", () => {
  if (!activeFinding) return;
  const url = URL.createObjectURL(new Blob([incidentReport()], { type: "text/markdown;charset=utf-8" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = "incident-black-box-report.md";
  document.body.append(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
});

byId("reset-case").addEventListener("click", () => {
  pinned.clear();
  form.reset();
  renderSource(caseFile.sources[0]);
  renderTimeline();
  clearFinding();
  sourceButtons.get(currentSource.id).focus();
  announce("Case reset.");
});

renderSource(currentSource);
renderTimeline();
clearFinding();
byId("investigation").hidden = false;
