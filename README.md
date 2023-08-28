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

```

## Development

### Testing the CSP Locally

Add the following `<meta>` tag to one of the index.html files:

```html
<meta http-equiv="Content-Security-Policy" content="default-src 'self' https://u2nvainvlx73h5a7cnxpiodpfcbmo1.ext-twitch.tv; block-all-mixed-content; img-src 'self' https://u2nvainvlx73h5a7cnxpiodpfcbmo1.ext-twitch.tv https://static-cdn.jtvnw.net https://www.speedrun.com https://*.google-analytics.com https://www.googletagmanager.com data: blob:; media-src 'self' https://u2nvainvlx73h5a7cnxpiodpfcbmo1.ext-twitch.tv  data: blob:; frame-ancestors https://supervisor.ext-twitch.tv https://extension-files.twitch.tv https://*.twitch.tv https://*.twitch.tech https://localhost.twitch.tv:* https://localhost.twitch.tech:* http://localhost.rig.twitch.tv:*; font-src 'self' https://u2nvainvlx73h5a7cnxpiodpfcbmo1.ext-twitch.tv https://fonts.googleapis.com https://fonts.gstatic.com; style-src 'self' 'unsafe-inline' https://u2nvainvlx73h5a7cnxpiodpfcbmo1.ext-twitch.tv https://fonts.googleapis.com; connect-src 'self' https://u2nvainvlx73h5a7cnxpiodpfcbmo1.ext-twitch.tv https://api.twitch.tv wss://pubsub-edge.twitch.tv https://www.speedrun.com/api/ https://*.google-analytics.com https://stats.g.doubleclick.net https://www.googletagmanager.com; script-src 'self' https://u2nvainvlx73h5a7cnxpiodpfcbmo1.ext-twitch.tv https://extension-files.twitch.tv https://*.google-analytics.com https://www.googletagmanager.com;">
```

This is useful because Twitch's does not cache-invalidate consistently when testing, which leads to having to wait a long time between iterations! Likely also useful for CI testing
