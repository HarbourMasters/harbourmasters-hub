<p align="center">
  <img src="assets/HarbourMasters64.apng" alt="Harbour Masters" width="100%" />
</p>

<h1 align="center">Harbour Masters — Web Hub</h1>

<p align="center">
  The official community hub for <strong>Harbour Masters</strong> — native PC ports of classic Nintendo 64 and GameCube games, rebuilt from decompilations projects with modern enhancements.
</p>

---

## About

This is the **Harbour Masters HUB** — a one-stop website where users can find everything they need:

- **Game releases & changelogs** — browse the latest releases for every port, with full changelogs pulled live from GitHub
- **Downloads** — direct download links for Windows, Linux, and macOS and other supported or older builds
- **Live stats** — real-time GitHub stars, forks, and download counts
- **ROM compatibility checker** — verify your ROM against the supported database
- **Mod library** — browse and discover community mods via GameBanana integration
- **FAQ** — frequently asked questions and guides
- **Tools & modding tools** — progressively added as they're completed (message editor, audio tool, and more coming soon)
- **Asset documentation** — per-game reference tables (display lists, skeletons, animations, audio samples…) synced from the team's Google Sheets and rendered in-site at `/tools/docs/<game>`

### Syncing asset documentation

The docs pages read committed JSON snapshots under `src/data/docs/` — the site never talks to Google at runtime. When a spreadsheet changes, re-run:

```bash
npm run sync:docs              # all games
npm run sync:docs -- --game=starship   # one game
```

Spreadsheet IDs and per-table config live in `src/data/docs/docs.config.json` (single source of truth shared by the sync script and the site).