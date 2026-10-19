# FlowSignal NQ (TradingView indicator)

An original Pine Script v6 indicator for NQ / MNQ futures on the 5-minute chart. It provides the same kinds of features that QuantFlow advertises. QuantFlow's code is invite-only and closed, so none of it is copied here. The logic is my own, built from the public feature list.

## What it does

| Feature | How it works here |
|---|---|
| Non-repainting BUY / SELL | Signals are only evaluated on closed bars. The HTF bias reads the previous closed HTF bar. |
| 5 switchable signal sources | Trend pullback (EMA 9/21/50) · VWAP reclaim/rejection with volume · Opening range breakout (first 15 min) · Liquidity sweep reversal · Momentum shift (RSI 50 cross + ADX/DMI). Each one can be turned off, and you set how many must agree. |
| Built-in targets and stops | ATR- or swing-based stop. TP1/TP2/TP3 at R multiples (1R/2R/3R by default). Trades are skipped if the risk is too wide. |
| Trade management | One third of the position closes at each TP. The stop moves to breakeven after TP1 and to TP1 after TP2. The position is flattened at 15:55 ET and can reverse on an opposite signal. |
| News filter | Pauses around the jobs report automatically (first Friday, 08:30 ET) and around any CPI / FOMC / other times you paste in. |
| VIX filter | Pauses when VIX rises more than X% over N bars or sits above a set level. |
| 10Y yield filter | Blocks BUYs when US10Y jumps more than N basis points. |
| Volatility filter | Pauses when ATR is more than 2.5× its 100-bar average. |
| Live panel | Shows the status (ACTIVE / PAUSED / SELLS ONLY / OUT OF SESSION) and why: news, VIX, yield, volatility, HTF bias, position and last result. Blocked signals show as grey ✕. |
| Stats box | Trades, win rate, net points, net $ (1 contract), profit factor, avg R, TP1/2/3 hit counts. |
| Alerts | `alertcondition`s for BUY / SELL / exit, plus `alert()` calls that send JSON (entry, stop, TPs, sources) for webhooks and TP / exit messages. |

## Install

1. In TradingView, open **Pine Editor**, create a new indicator, delete the template code and paste in `flowsignal_nq.pine`.
2. Click **Save**, then **Add to chart**. Use `NQ1!` or `MNQ1!` on the **5m** chart.
3. Open the settings and paste upcoming CPI / FOMC times into **News filter → Event times**, one per line, for example `2026-11-12 08:30`.
4. Alerts: **Create alert → Condition: FlowSignal → "Any alert() function call"** gets the JSON and TP/exit messages. You can also pick a specific BUY/SELL condition.

## Notes

- The jobs-report rule assumes the first Friday of the month, which is usually but not always the release date. When it moves, add the actual date to the event list.
- The stats box simulates fills at the signal bar's close and at the exact stop/target prices, with no slippage or commissions. When the stop and a target fall on the same bar, it counts the stop first. Treat the numbers as a rough guide, not a guarantee.
- This is a technical tool, not financial advice. Forward-test it on a paper account before you risk money.
