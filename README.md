# 💸 Meeting Cost Timer

Watch your company's money evaporate in real time.

**Live:** https://shockwave3301.github.io/meeting-cost-timer/

Add the people in the meeting and what they earn, hit the big pink button, and watch a gas-pump-style counter tick up while money rains down the screen. When it's finally over, you get a **Receipt of Shame**.

## Features

- **Live cost counter.** Each salary (per year, month or hour) is turned into an hourly rate, the rates are summed, and the total grows with elapsed time. It pauses, resumes, and keeps running if you reload the page.
- **The Usual Suspects.** Anyone you add is saved, so pulling Dave from Sales into the next meeting takes one tap.
- **The Damage Report.** Totals for today, this week, this month and all time, plus a bar chart (daily, weekly or monthly) of the money burned or the human-hours lost.
- **Hall of Shame.** Every past meeting, with a crown 👑 for the most expensive one.
- **Corporate comedy.** Rotating meeting quips, milestone stickers ("FOUR DIGITS. The CFO felt a disturbance in the force."), a random meeting-name generator, and cost equivalents in pizzas, lattes and used Honda Civics.

## How the math works

```
hourly rate = yearly salary / 2080        (40 h × 52 weeks)
            = monthly salary / 173.3
cost        = Σ hourly rates × hours in the meeting
```

## Running it

It's plain HTML, CSS and JS: no build step, no dependencies. Open `index.html` in a browser, or serve the folder:

```sh
npx serve .
```

## Deployment

`.github/workflows/pages.yml` publishes `index.html`, `styles.css` and `app.js` to GitHub Pages on every push to the default branch (it can also be run by hand from the Actions tab). One-time setup: **Settings → Pages → Build and deployment → Source: GitHub Actions**.

## Privacy

Everything is stored in your browser's `localStorage` (`mct.*` keys). Nothing leaves your device.
