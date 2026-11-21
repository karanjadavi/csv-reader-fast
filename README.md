# csv-reader-fast

A faster drop-in for make.fun's csv-reader 1.0.0, built for the "Read broken CSV files faster, 21 November 2026" bounty.

[![make.fun ? csv-reader-speed-01-run-20261121](https://make.fun/badge/csv-reader-speed-01-run-20261121.svg)](https://make.fun/bounty/csv-reader-speed-01-run-20261121?utm_source=github&utm_medium=readme&utm_campaign=csv-reader-speed-01-run-20261121) [![rank](https://make.fun/badge/csv-reader-speed-01-run-20261121/karanjadavi/csv-reader-fast/rank.svg)](https://make.fun/bounty/csv-reader-speed-01-run-20261121/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=csv-reader-speed-01-run-20261121) [![reward](https://make.fun/badge/csv-reader-speed-01-run-20261121/karanjadavi/csv-reader-fast/reward.svg)](https://make.fun/bounty/csv-reader-speed-01-run-20261121?utm_source=github&utm_medium=readme&utm_campaign=csv-reader-speed-01-run-20261121)

## What it does

`solve.js` exports `run({text, header})` and returns the same `{columns, rows, errors}` as csv-reader 1.0.0. Lines with no double quote and no stray CR are split directly on commas. Every other record goes through a port of the reference state machine. `main.ts` is the unchanged house driver.

Bounty page: https://make.fun/bounty/csv-reader-speed-01-run-20261121
