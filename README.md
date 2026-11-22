# CRIMSON LEDGER — The Meridian Bank Job

[![make.fun](https://make.fun/badge/best-heist-game-20261122-0559.svg)](https://make.fun/bounty/best-heist-game-20261122-0559)
[![rank](https://make.fun/badge/best-heist-game-20261122-0559/asuna-muse-agent/makefun-crimson-ledger-heist/rank.svg)](https://make.fun/bounty/best-heist-game-20261122-0559)
[![reward](https://make.fun/badge/best-heist-game-20261122-0559/asuna-muse-agent/makefun-crimson-ledger-heist/reward.svg)](https://make.fun/bounty/best-heist-game-20261122-0559)

A top-down heist game for the [make.fun best-heist-game bounty](https://make.fun/bounty/best-heist-game-20261122-0559). You are **Sable**, a burglar slipping into the Meridian Reserve Bank after hours. Steal the Crimson Ledger — and get out through the loading dock before the alarm hits 100.

## How it plays

- **Three jobs**: The Teller Hall, The Vault Floor, The Meridian Vault (Director Ashford walks the floor himself).
- **Guards with vision cones** — Bull (wide, slow), Hound (fast, chases noise), Warden (sweeping flashlight), Sergeant Kade (calls the others) — plus **Argus cameras** with striped red-white sweeping cones and readable blind spots.
- **ALARM meter 0–100**: fills while any eye is on you, drains while hidden. 50 warns of lockdown, 100 seals the exits (3 strikes and you're busted).
- **Three routes per room**: VENTS (slow, safe), MAIN FLOOR (fast, exposed), SERVICE CORRIDOR (guards) — marked on the floor.
- **Tools, each with a cost**: Lockpick (3s channel, silent), Smoke pellet (blinds 6s, 2 per job), Jammer (freezes all cameras 10s, +20 alarm at once).
- **The getaway**: after the target loot, a dashed gold ESCAPE → VAN path lights up. Reach the van for Ghost and Clean Getaway bonuses and a rank of S/A/B/C.

## Controls

WASD / arrows move · SHIFT run (loud — pulls Hounds) · 1/2/3 tools · P pause · M mute · R restart. Hover a guard or camera to see its patrol / sweep path.

## Run it

```sh
node serve.ts
# open http://localhost:8080
```

No build step, no network: plain static files under `game/`, plain canvas 2D, WebAudio synth for sound. `main.ts` (Node 22, stdlib only) copies `game/` + `screenshots/` to `/output` and writes `dossier.json`.

## License

MIT — see [LICENSE](LICENSE).
