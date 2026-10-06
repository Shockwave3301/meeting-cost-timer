# 💸 Созвонометр (Meeting Cost Timer)

Watch your company's money evaporate in real time. The interface is in Russian; amounts default to rubles and monthly salaries.

**Live:** https://shockwave3301.github.io/meeting-cost-timer/

Add the people in the meeting and what they earn, hit the big pink button, and watch a gas-pump-style counter tick up while money rains down the screen. When it's finally over, you get a **Чек позора** (Receipt of Shame).

## Features

- **Live cost counter.** Each salary (per year, month or hour) is turned into an hourly rate, the rates are summed, and the total grows with elapsed time. It pauses, resumes, and keeps running if you reload the page.
- **Подозрительные лица** (The Usual Suspects). Anyone you add is saved, so pulling Дима из продаж into the next meeting takes one tap.
- **Отчёт об ущербе** (The Damage Report). Totals for today, this week, this month and all time, plus a bar chart (daily, weekly or monthly) of the money burned or the human-hours lost.
- **Доска позора** (Hall of Shame). Every past meeting, with a crown 👑 for the most expensive one.
- **Corporate comedy.** Rotating meeting quips, milestone stickers («Финдиректор почувствовал возмущение в Силе»), a random meeting-name generator, and cost equivalents in шаурма, рафы на кокосовом and подержанные «Солярисы». Joke thresholds are set in rubles and scaled roughly for other currencies; the meeting cost itself is never converted.

## How the math works

```
hourly rate = monthly salary / 173.3      (2080 / 12)
            = yearly salary / 2080        (40 h × 52 weeks)
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
