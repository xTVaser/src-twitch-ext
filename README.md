# Speedrun.com Twitch Extension (unofficial)

Not affiliated with Speedrun.com, a simple Twitch extension to display your personal bests without having to manually manage them.

## Run Locally

```
yarn dev
```

## Build for Twitch

```
yarn twitch
```

### Typical Review Instructions

```md
# Walkthrough

This extension only provides static information (text and some images) fetched from Speedrun.com's API. It also uses Twitch's configuration service, there is no custom EBS involved.

The review channel is pre-configured with a few games, notable features are:

- You can click on the game name's to be taken to their respective page on speedrun.com
- You can expand/collapse each game's details by clicking on the summary section
- You can click on each entry's name to be taken to the respective page on speedrun.com

## Capability Changes

<ANYTHING TO HIGHLIGHT>

## Change Log

<COPY FROM CHANGELOG.md>
```

## Development

### Testing the CSP Locally

Add the following `<meta>` tag to one of the index.html files:

```html
<meta
  http-equiv="Content-Security-Policy"
  content="default-src 'self' https://u2nvainvlx73h5a7cnxpiodpfcbmo1.ext-twitch.tv; block-all-mixed-content; img-src 'self' https://u2nvainvlx73h5a7cnxpiodpfcbmo1.ext-twitch.tv https://static-cdn.jtvnw.net https://www.speedrun.com https://*.google-analytics.com https://www.googletagmanager.com data: blob:; media-src 'self' https://u2nvainvlx73h5a7cnxpiodpfcbmo1.ext-twitch.tv  data: blob:; frame-ancestors https://supervisor.ext-twitch.tv https://extension-files.twitch.tv https://*.twitch.tv https://*.twitch.tech https://localhost.twitch.tv:* https://localhost.twitch.tech:* http://localhost.rig.twitch.tv:*; font-src 'self' https://u2nvainvlx73h5a7cnxpiodpfcbmo1.ext-twitch.tv https://fonts.googleapis.com https://fonts.gstatic.com; style-src 'self' 'unsafe-inline' https://u2nvainvlx73h5a7cnxpiodpfcbmo1.ext-twitch.tv https://fonts.googleapis.com; connect-src 'self' https://u2nvainvlx73h5a7cnxpiodpfcbmo1.ext-twitch.tv https://api.twitch.tv wss://pubsub-edge.twitch.tv https://www.speedrun.com/api/ https://*.google-analytics.com https://stats.g.doubleclick.net https://www.googletagmanager.com; script-src 'self' https://u2nvainvlx73h5a7cnxpiodpfcbmo1.ext-twitch.tv https://extension-files.twitch.tv https://*.google-analytics.com https://www.googletagmanager.com;"
/>
```

This is useful because Twitch's does not cache-invalidate consistently when testing, which leads to having to wait a long time between iterations! Likely also useful for CI testing
