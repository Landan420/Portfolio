# landan.pages.dev

Personal portfolio site built with React + Vite, deployed on Cloudflare Pages.

## Stack

- **Framework** — React 19 + Vite 8
- **Deployment** — Cloudflare Pages
- **Presence** — [Lanyard](https://github.com/phineas/lanyard) WebSocket API (live Discord status)
- **Icons** — Lucide React + [Skill Icons](https://skillicons.dev)
- **Fonts** — Inter (Google Fonts)

## Features

- Live Discord presence — avatar, status, and custom status pulled in real-time via Lanyard WebSocket
- Dark / light theme toggle with persistent preference
- Infinite tech stack marquee
- Discord contact popover — copy username, open profile, or join server
- Floating `made by @landan` tag
- Clean Discord embed with OG meta tags

## Dev

```bash
npm install
npm run dev
```

## Deploy

```bash
npm run deploy
```

Requires [Wrangler](https://developers.cloudflare.com/workers/wrangler/) and an authenticated Cloudflare account.

## Avatar hash

The `og:image` in `index.html` uses a hardcoded Discord avatar hash. Update it if the avatar changes:

```
https://cdn.discordapp.com/avatars/419739869229875211/<hash>.webp?size=512
```

Grab the current hash from `https://api.lanyard.rest/v1/users/419739869229875211` → `discord_user.avatar`.
