# Vital Sync

**Catch it before it's urgent.** Vital Sync helps an astronaut with no medical training notice slow, silent changes in their own body and decide what to do when Earth is too far away to answer in time.

Built by **Team V-Sync** (Sharan, Vedanti) for the **NASA Space Apps Challenge 2026**, challenge *Create Health Monitoring Software for Astronauts on Space Missions*.

**Live app: https://vitalsync-vsync.vercel.app**

> Decision support for a prototype. Not a medical device and not a diagnosis.

## The problem

The health risks of long missions, such as rising blood pressure, sleep debt, low mood or a brewing infection, build slowly and often without symptoms. On the space station, ground doctors watch the data and answer within minutes. From the surface of Mars a one-way signal takes up to 20 minutes, and three message exchanges with flight surgeons take about 38 hours. The crew has to notice and act on its own.

## What Vital Sync does

1. **Daily check-in.** A guided, three-minute check-in records heart rate, blood pressure, temperature, blood sugar, sleep, mood and exercise. Readings that are drifting are asked first. Each value is shown live against your normal, caution and alert zones and against your own usual value.
2. **Today's assessment.** Saving the check-in updates the crew member's log, compares every reading with their personal baseline and recalculates the forecasts. The result screen says what changed since yesterday and what to do now.
3. **Lead-time margin.** For each reading, Vital Sync fits a trend, estimates how many days remain before it crosses a limit (with an uncertainty range), and compares that with how long help from Earth takes at the current location. When the margin runs out, it asks the astronaut to act on board.
4. **Body scan.** A rotating 3D human shows each body region in its status colour; selecting a region opens its readings, guidance and NASA risk links.
5. **Body systems.** Sleep debt, an immune risk window, a radiation passport and a bone and muscle budget combine readings that build up over a mission.
6. **Ground link.** A report for flight surgeons that states the request first and answers their likely questions, to save round trips.

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

`npm test` and the in-app **Demo and validation** page run the detection test. Results below are for the Mars surface setting over four random seeds. They come from simulated data: they show the method works as designed, not that it works for real crews.

| Scenario | Vital Sync first flag vs fixed threshold |
| --- | --- |
| Silent blood pressure climb (starts day 60) | 35 to 66 days earlier |
| Brewing infection (starts day 100) | Temperature 0 to 2 days earlier; heart-rate rise flagged, never crossed a fixed threshold |
| Sleep and mood slide (starts day 70) | Mixed: from 1 day later to 40 days earlier |
| Healthy mission | 0.32% of reading-days falsely flagged |

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
  engine/        pure functions: indicators, analysis, modules, simulator (tested)
  ui/            app shell, charts, 3D body, and one file per screen in views/
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

## Use of AI tools

The code in this repository was generated with Claude (Anthropic) under the direction of Team V-Sync and reviewed by the team. Research summaries were prepared with the same tool and checked against the linked sources. No AI-generated images, audio or video are used, and no NASA logos or mission identifiers appear.

## Licence

MIT. See [LICENSE](LICENSE).
