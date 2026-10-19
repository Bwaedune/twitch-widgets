# FlowSignal NQ (TradingView indicator)

An original Pine Script v6 indicator for NQ / MNQ futures on the 5-minute chart. It provides the same kinds of features that QuantFlow advertises. QuantFlow's code is invite-only and closed, so none of it is copied here. The logic is my own, built from the public feature list.

## What it does

The default setup copies the behaviour shown in QuantFlow's website demo. A trend ribbon colours the chart green or red. A BUY or SELL fires when the ribbon flips. Each trade is held until the opposite flip, and results are shown in points after 1.12 points of costs.

| Feature | How it works here |
|---|---|
| Trend ribbon | Glowing main line (EMA 10) with shaded bands to EMA 21 / 34. It turns green or red with the trend, and candles are coloured to match. |
| Non-repainting BUY ✓ / SELL ✕ | Signals are only evaluated on closed bars. The trend flips when the close clears the main line by a small ATR buffer while the line has turned. |
| Signal modes | **Trend flip** (default, like the demo), **Confluence** (the five sources below) or **Either**. |
| 5 switchable confluence sources | Trend pullback (EMA 9/21/50) · VWAP reclaim/rejection with volume · Opening range breakout · Liquidity sweep reversal · Momentum shift (RSI 50 cross + ADX/DMI). |
| Exit modes | **Opposite signal** (default): hold until the trend flips, with an optional wide protective stop at 3× ATR. **Targets**: scale out a third at TP1/TP2/TP3, stop to breakeven after TP1, stop to TP1 after TP2. Either way the position is flattened at 15:55 ET. |
| Results in points after costs | Each signal label updates to show its result (`+87.99 pts`), live while the trade is open. Costs default to 1.12 points round trip. |
| Latest signals strip | Bottom-left: the open trade and the last 4 closed trades, e.g. `BUY at 14:33, +31.53 pts`. |
| News filter | Pauses around the jobs report automatically (first Friday, 08:30 ET) and around any CPI / FOMC / other times you paste in. |
| VIX filter | Pauses when VIX rises more than X% over N bars or sits above a set level. |
| 10Y yield filter | Blocks BUYs when US10Y jumps more than N basis points. |
| Volatility filter | Pauses when ATR is more than 2.5× its 100-bar average. |
| Live panel | Shows the status (ACTIVE / PAUSED / SELLS ONLY / OUT OF SESSION) and why: trend, news, VIX, yield, volatility, HTF bias, open position and P&L. Signals blocked by a filter show as grey dots. |
| Stats box | Trades, win rate, net points, net $ (1 contract), profit factor, avg points per trade, all after costs. |
| Alerts | `alertcondition`s for BUY / SELL / exit, plus `alert()` calls that send JSON for webhooks and TP / exit messages. |

## Install

1. In TradingView, open **Pine Editor**, create a new indicator, delete the template code and paste in `flowsignal_nq.pine`.
2. Click **Save**, then **Add to chart**. Use `NQ1!` or `MNQ1!` on the **5m** chart.
3. Open the settings and paste upcoming CPI / FOMC times into **News filter → Event times**, one per line, for example `2026-11-12 08:30`.
4. Alerts: **Create alert → Condition: FlowSignal → "Any alert() function call"** gets the JSON and TP/exit messages. You can also pick a specific BUY/SELL condition.

## Notes

- The jobs-report rule assumes the first Friday of the month, which is usually but not always the release date. When it moves, add the actual date to the event list.
- The ribbon lengths and flip buffer are my estimates from the demo animation. If signals come too often (whipsaw), raise **Flip buffer** or the **Main line EMA**.
- The stats box simulates fills at the signal bar's close and at the exact stop/target prices. The only costs it includes are the flat round-trip points you set (default 1.12). When the stop and a target fall on the same bar, it counts the stop first. Treat the numbers as a rough guide, not a guarantee.
- This is a technical tool, not financial advice. Forward-test it on a paper account before you risk money.
