# Vital Sync

**Catch it before it's urgent.** Vital Sync helps an astronaut with no medical training notice slow, silent changes in their own body and decide what to do when Earth is too far away to answer in time.

Built by **Team V-Sync** (Sharan, Vedanti) for the **NASA Space Apps Challenge 2026**, challenge *Create Health Monitoring Software for Astronauts on Space Missions*.

**Live app: https://vitalsync-vsync.vercel.app**

> Decision support for a prototype. Not a medical device and not a diagnosis.

## The problem

The health risks of long missions, such as rising blood pressure, sleep debt, low mood or a brewing infection, build slowly and often without symptoms. On the space station, ground doctors watch the data and answer within minutes. From the surface of Mars a one-way signal takes up to 20 minutes, and three message exchanges with flight surgeons take about 38 hours. The crew has to notice and act on its own.

## What Vital Sync does

1. **Pre-flight health clearance (daily check-in).** Heart rate, blood pressure, blood oxygen (SpO2), breathing rate, temperature, blood sugar when due, sleep, fatigue (Samn-Perelli scale), a short wellbeing check (stress, isolation, confinement) and symptoms. Readings that are drifting come first. Every test has an animated timer with audio cues: a 5-minute seated rest before blood pressure, a 60-second pulse count with tap counting, 20 s for the oximeter, a 60-second breathing count, a 30-second thermometer dwell and a 15-second glucose strip.
2. **Guided technique.** Annotated clinical line diagrams (in `public/assets/guides/`, drawn by `scripts/make-guides.py`) with step-by-step instructions for the blood pressure cuff (posture, heart level, lower edge 2–3 cm above the elbow crease, artery marker over the brachial artery), radial pulse, pulse oximeter, forehead and ear thermometer, glucose lancet and breathing count. An optional voice coach reads the steps, and hands-free voice logging understands phrases like "one eighteen over seventy six" and asks for confirmation.
3. **Personal baselines.** A reading is judged against the astronaut's own normal, entered before flight or learned during the mission: within 1.5 standard deviations is nominal, beyond 2.5 is caution. So 90/60 is normal for someone who always runs low, while a jump to 115/80 is flagged as drift. Textbook alert limits always apply.
4. **Lead-time margin.** For each reading, Vital Sync fits a trend, estimates how many days remain before it crosses a limit, and compares that with how long help from Earth takes at the current location.
5. **Today and mission readiness.** A clearance stamp when you save ("Flight cleared for mission day X") with the readiness breakdown and XP earned; a 0–100% readiness gauge; daily and weekly quests; ranks from Flight Cadet to Mission Commander; and four badges (Immune Fortress, Neuro-Ace under 250 ms, Deep Space Veteran, Zero-G Adapted) shown on Today and Body scan.
6. **Audio everywhere.** Every check-in step has 🔊 Listen to guide and 🎙️ voice entry ("one eighteen over seventy six", "pulse sixty-two", "mood seven") with a confirmation tone. The clearance header has a guided session (four paced breaths, then each technique); Today reads a flight surgeon debrief with the action plan; Ground link reads the report aloud. One floating player handles all of it with play, pause, previous, next, repeat and stop, and shows captions. Volume, voice, speaking rate (0.75× to 1.25×), theme and a sound check live in Crew.
7. **Cognitive battery.** A psychomotor vigilance test (reaction time), a sequence memory test and a 15-second tracking test, combined into a 0–100 score.
8. **Mission protocol.** Daily, weekly (cognitive battery, tumbling-E vision check, grip strength, single-leg balance) and periodic tasks (ECG, ultrasound notes, dosimeter, hydration colour chart), with due tasks highlighted.
9. **Body scan.** A 3D human with hotspots; selecting one zooms the camera in and opens a diagnostic card with readings, guidance and NASA risk links.
10. **Body systems and cabin.** Sleep debt, immune window, radiation passport, bone and muscle budget, plus cabin CO2, O2, radiation, temperature and humidity, with a CO2 alert above 5.0 mmHg.
11. **Ground link.** A report for flight surgeons that states the request first, now including symptoms and wellbeing.

The **left rail is a game HUD**: an avatar with an XP ring and rank level, a 7-item daily clearance quest ring (amber until complete, green when cleared), live status pips on every station (body region status, drifting trends, cognitive score, tasks due, cabin air and radiation) with hover flyouts, soft sound cues, and quick toggles for sound and theme. Check-in streaks earn awards at 3, 7, 14, 30, 60 and 100 days. A first-visit **mission briefing** (three steps) explains the clearance, the body hologram and the audio coach; reopen it from the speech-bubble button. The **theme** picker offers ☀️ Light (the NASA white and blue), 🛰️ Satellite dark, or Auto, which follows the device setting; the choice is saved on the device.

Status always uses shape and colour together: circle (nominal), diamond (watch), triangle (tell the crew medical officer), square (contact flight surgeons).

## NASA and partner resources used

| Resource | How Vital Sync uses it |
| --- | --- |
| [NASA: 5 Hazards of Human Spaceflight](https://www.nasa.gov/hrp/hazards/) | Hazard links on every reading; distance and gravity for each location |
| [NASA: Risks of Human Spaceflight](https://www.nasa.gov/hrp/risks/) | The NASA risk each reading informs, linked on every detail card |
| [NASA: Ongoing HRP Research](https://www.nasa.gov/hrp/ongoing-hrp-research/) | Daily standard-measures check-in, sleep debt, immune window, exercise log |
| [CSA: Monitoring Radiation for Astronaut Health](https://www.asc-csa.gc.ca/eng/news/articles/2026/2026-02-26-monitoring-radiation-astronaut-health.asp) | Radiation passport |
| [CSA: Why Do We Conduct Science Experiments in Space?](https://www.asc-csa.gc.ca/eng/iss/science/why-do-we-conduct-science-experiments-in-space.asp) | Communication delay reasoning and the benefit on Earth |

All research sources and reference ranges are listed on the app's **About** page.

## Validation on simulated missions

`npm test` and the in-app **Demo and validation** page run the detection test. Results below are for the Mars surface setting over four random seeds, re-measured after the personal-baseline update. They come from simulated data: they show the method works as designed, not that it works for real crews.

| Scenario | Vital Sync first flag vs fixed threshold |
| --- | --- |
| Silent blood pressure climb (starts day 60) | 43 to 66 days earlier |
| Brewing infection (starts day 100) | Temperature 1 to 6 days earlier; heart-rate rise flagged, never crossed a fixed threshold |
| Sleep and mood slide (starts day 70) | Sleep from 3 days later to 11 days earlier; mood 5 to 34 days earlier |
| Healthy mission | 0.33% of reading-days falsely flagged |

## Run it locally

Requires Node.js 18 or later.

```bash
npm install
npm run dev      # development server
npm test         # engine tests
npm run build    # production build in dist/
```

The app opens with a demo crew member whose history up to yesterday is simulated, so the first check-in is mission day 90. Add your own crew member from the crew selector.

## Deploy

**Vercel:** import this repository at vercel.com/new. `vercel.json` sets the Vite build and the `dist` output; no other settings are needed.

**Firebase Hosting:**

```bash
npm install -g firebase-tools
firebase login
firebase use --add          # choose your Firebase project
npm run build
firebase deploy --only hosting
```

## Project structure

```
src/
  engine/        pure functions: indicators, analysis, modules, cognitive scoring,
                 gamification, simulator (tested)
  ui/            app shell, charts, 3D body, timers, tutorials, sound, voice,
                 and one file per screen in views/
  styles/        main.css
  store.js       crew profiles and logs in local storage
tests/           engine tests (node:test)
```

All data stays in the browser's local storage on the device. Logs can be downloaded or copied from the Demo and validation page.

## Limitations

- Reference ranges are draft values from general clinical sources for healthy adults on Earth and must be reviewed by a clinician.
- The response-loop review times and safety factors are our assumptions; the signal delays follow published figures.
- The bone and radiation modules are illustrative models, labelled as such in the app.
- Validation so far uses simulated data only.
- A reading that is outside the textbook caution range but normal for the person is shown as normal; personal-only flags go no higher than "tell the crew medical officer".
- Wellbeing uses two validated scales weekly: the Perceived Stress Scale 4-item (Cohen et al., 1983; asked about the last week instead of the last month) and the Three-Item Loneliness Scale (Hughes et al., 2004). The daily confinement item is ours and not validated. None of these is a diagnosis. The vision test is not a calibrated eye chart. The reaction-time test is shortened to 60 seconds (the NASA version runs 3 minutes).
- Cabin telemetry is simulated. Voice logging needs Chrome or Edge and a network connection.
- Breathing rate: a 32-second 4-in/4-out pacer settles breathing first, but the 60-second count itself is unpaced, because pacing during the count would set the result.
- The "Flight cleared for EVA" stamp appears only when every reading is nominal, and is a self-check, not a medical EVA clearance.

## Use of AI tools

The code in this repository was generated with Claude (Anthropic) under the direction of Team V-Sync and reviewed by the team. Research summaries were prepared with the same tool and checked against the linked sources. Sound effects are synthesised in the browser with the Web Audio API. No AI-generated images, audio or video are used, and no NASA logos or mission identifiers appear.

## Licence

MIT. See [LICENSE](LICENSE).
