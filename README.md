# 💸 Созвонометр (Meeting Cost Timer)

Watch your company's money evaporate in real time. The interface is in Russian; amounts default to rubles and monthly salaries.

**Live:** https://shockwave3301.github.io/meeting-cost-timer/

Add the people in the meeting and what they earn, hit the big pink button, and watch a gas-pump-style counter tick up while money rains down the screen. When it's finally over, you get a **Чек позора** (Receipt of Shame).

## Features

- **Live cost counter.** Salaries are entered take-home («на руки», the way people in Russia quote them); the 13% НДФЛ is added back automatically. Each salary (per year, month or hour) is turned into an hourly rate, the rates are summed, and the total grows with elapsed time. It pauses, resumes, and keeps running if you reload the page.
- **Taxes, separately.** A second counter shows the employer's insurance contributions paid on top of gross salary (30.2% by default: 30% + 0.2% workplace-injury insurance; editable, e.g. 7.6% for IT-accredited companies). The receipt adds them up into the total cost to the company. НДФЛ is already in the salary counter, so it isn't added again.
- **Подозрительные лица** (The Usual Suspects). Anyone you add is saved, so pulling Дима из продаж into the next meeting takes one tap.
- **Отчёт об ущербе** (The Damage Report). Totals for today, this week, this month and all time, plus a bar chart (daily, weekly or monthly) of the money burned or the human-hours lost.
- **Доска позора** (Hall of Shame). Every past meeting, with a crown 👑 for the most expensive one.
- **Corporate comedy.** Rotating meeting quips, milestone stickers («Финдиректор почувствовал возмущение в Силе»), a random meeting-name generator, and cost equivalents in шаурма, рафы на кокосовом and подержанные «Солярисы». Joke thresholds are set in rubles and scaled roughly for other currencies; the meeting cost itself is never converted.

## How the math works

```
gross       = take-home / 0.87               (adds back 13% НДФЛ)
hourly rate = monthly gross / 164.3          (1972 / 12)
            = yearly gross / 1972            (RU production calendar 2026, 40-hour week)
cost        = Σ hourly rates × hours in the meeting
taxes       = cost × employer contribution rate   (separate counter)
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
