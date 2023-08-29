# 2.0.0

## High Level

- Full re-write of extension, uses Svelte. Asset bundle should be un-minified to help with reviewing.
- Uses Twitch's configuration service instead of a custom EBS
  - This should greatly improve reliability of the extension, as downtime of the custom backend was the primary reason for the extension being down
  - However, removes a lot of per-game customization in order to stay under the 5kb per segment twitch configuration limit
- Displays game cover images (reason for extending `img-src` directive addition)
- Games and runs are automatically pulled, no need to update configuration if you start running a new game or category.
- Source code is greatly cleaned up, fixing bugs or adding features should be more feasible going forward.

## Features

- Hits a single speedrun.com API endpoint on load now, this is substantially less than before.
  - Therefore load-times and rate-limiting should be improved, but there are known issues:
    - https://github.com/speedruncomorg/api/issues/170
- All games are enabled by default
- Games can be disabled and saved to configuration
- You can customize how games are ordered, and how the runs for each game are ordered.
  - These settings are global and not per-game for config size reasons
- You can also choose to separate level runs from the rest
- You can create a custom theme to override the default one that aligns with Twitch's dark mode color palette
  - You can only create a single custom them at this time, once again for config-size reasons.
