# How to open and run FitQuest

This guide walks you through running FitQuest on your own computer, step by step. No coding experience needed.
It takes about 10 minutes the first time and about 30 seconds after that.

---

## What you need

- A computer (Windows, Mac or Linux) with an internet connection for the first setup
- **Node.js**, a free program that runs the app (installed in Step 1)
- A web browser (Chrome, Edge, Safari or Firefox)

---

## Step 1: Install Node.js (one time only)

1. Go to **https://nodejs.org**
2. Download the version marked **LTS** (the recommended one).
3. Open the downloaded file and click through the installer with the default options.
4. Check it worked: open a terminal (see below) and type:

   ```bash
   node -v
   ```

   You should see a version number such as `v22.11.0`. Any version 18 or higher is fine.

> **How to open a terminal**
> - **Windows:** press the Start button, type `PowerShell`, and open **Windows PowerShell**.
> - **Mac:** press `Cmd + Space`, type `Terminal`, and press Enter.
> - **Linux:** press `Ctrl + Alt + T`.

---

## Step 2: Download the app (one time only)

Choose **one** of these options.

### Option A: Download a ZIP (easiest)

1. Open **https://github.com/andersonor124/WorkoutRoutine/tree/claude/vigilant-lovelace-z1ihzs**
2. Click the green **Code** button, then **Download ZIP**.
3. Unzip the downloaded file (double-click it on Mac; on Windows right-click it and choose **Extract All**).
4. In the terminal, go into the unzipped folder. The easiest way: type `cd ` (with a space after it), drag the folder into the terminal window, and press Enter.

### Option B: Use Git (if you already have Git)

```bash
git clone https://github.com/andersonor124/WorkoutRoutine.git
```

```bash
cd WorkoutRoutine
```

```bash
git checkout claude/vigilant-lovelace-z1ihzs
```

---

## Step 3: Install the app's building blocks (one time only)

In the terminal, inside the app folder, run:

```bash
npm install
```

This downloads everything the app needs. It can take a minute or two. Warnings in yellow are normal.

---

## Step 4: Start the app (every time)

```bash
npm run dev
```

After a few seconds you will see something like:

```
  VITE v5.4.11  ready in 900 ms

  ➜  Local:   http://localhost:5173/
```

**Open http://localhost:5173 in your web browser.** That's it, FitQuest is running! 🎉

- The first time, you'll create your hero: name, body stats, schedule, equipment, goal build and look.
- After that, the app opens straight to your home screen with your progress.

> Keep the terminal window open while you use the app. Closing it stops the app.

---

## Use it on your phone

Your phone and computer must be on the **same Wi-Fi network**.

1. Stop the app if it is running (press `Ctrl + C` in the terminal).
2. Start it like this instead:

   ```bash
   npm run dev -- --host
   ```

3. Look for the **Network** line, for example `http://192.168.1.23:5173/`.
4. Type that address into your phone's browser.
5. Optional: use your browser's **Add to Home Screen** to get an app-like icon.

> If your computer asks whether to allow network access for Node.js, choose **Allow**.

---

## Stop the app

Click the terminal window and press **`Ctrl + C`**. To use it again later, open a terminal, go to the app folder (`cd ...`), and run `npm run dev` again. You don't need Steps 1–3 again.

---

## Your progress

- Your hero, XP, streaks and badges are saved **in the browser you use**, on that device only.
- Using a different browser or device starts a fresh hero.
- Clearing your browser's history/site data will erase your progress.
- To start over on purpose: open the **Hero** tab → **Reset all progress**.

---

## Troubleshooting

| Problem | Fix |
|---|---|
| `node` or `npm` is "not recognized" / "command not found" | Node.js isn't installed or the terminal was open during install. Install it (Step 1), then **close and reopen** the terminal. |
| `npm install` fails with network errors | Check your internet connection and try again. |
| "Could not read package.json" | You're not in the app folder. Use `cd` to go into the folder that contains `package.json`. |
| "Port 5173 is in use" | The app is probably already running in another terminal. Use that one, or Vite will offer another port, like `5174`. Open the address it prints. |
| The page is blank or looks broken | Refresh the page. If that doesn't help, stop the app (`Ctrl + C`) and run `npm run dev` again. |
| Phone can't open the Network address | Make sure both devices are on the same Wi-Fi and you started with `npm run dev -- --host`. Some work or school networks block this. |

---

## For developers

| Command | What it does |
|---|---|
| `npm run dev` | Start the app with live reload |
| `npm test` | Run the automated tests |
| `npm run build` | Build an optimized version into the `dist/` folder |
| `npm run preview` | Preview the built version locally |

The `dist/` folder can be uploaded to any static hosting service (Netlify, Vercel, GitHub Pages) to put FitQuest online.

---

*FitQuest provides general fitness guidance, not medical advice. Check with a doctor before starting a new exercise program.*
