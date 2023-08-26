import { gunzipSync, gzipSync } from "fflate";
import { ConfigData, DefaultDarkTheme } from "../../src/lib/config";

/**
 * Retrieves the configuration data.
 *
 * @return {ConfigData} The parsed configuration data.
 */
export function getConfiguration() {
  const compressedConfigData = JSON.parse(localStorage.getItem("src-twitch-ext")).broadcaster.content;
  const decompressedConfigMinified = Buffer.from(
    gunzipSync(Buffer.from(compressedConfigData, "base64")).buffer,
  ).toString();
  console.log(JSON.parse(decompressedConfigMinified));
  return ConfigData.parse(JSON.parse(decompressedConfigMinified));
}

export function generateConfiguration({userSrcName = "xtvaser", userSrcId = "e8envo80", disabledGames = [], currentThemeName = "_custom-test", showLeaderboardPlace = false, groupLevelsSeparately = true, gameSorting = "recent", entrySorting = "recent"}) {
  let data = new ConfigData();
  data.gameData.userSrcName = userSrcName;
  data.gameData.userSrcId = userSrcId;
  data.currentThemeName = currentThemeName;
  data.gameData.disabledGames = disabledGames;
  data.gameData.groupLevelsSeparately = groupLevelsSeparately;
  data.gameData.gameSorting = gameSorting;
  data.gameData.entrySorting = entrySorting;
  data.customThemes["_custom-panel"] = DefaultDarkTheme;
  data.customThemes["_custom-panel"].showPlace = showLeaderboardPlace;
  console.log(data.customThemes);
  data.customThemes["_custom-test"] = {
    defaultTheme: false,
    hideExpandIcon: false,
    showRainbowWorldRecord: false,
    showPlace: false,
    mainBackgroundColor: "#FFFFFF",
    gameHeaderBackgroundColor: "#FFFFFF",
    gameEntriesBackgroundColor: "#FFFFFF",
    gameEntriesAlternateRowColor: "#FFFFFF",
    gameNameLinkHoverColor: "#FFFFFF",
    gameEntryLinkHoverColor: "#FFFFFF",
    gameExpandIconColor: "#FFFFFF",
    gameEntryLeaderboardPlaceColor: "#FFFFFF",
    gameNameFontColor: "#FFFFFF",
    gameNameSubheaderFontColor: "#FFFFFF",
    gameEntryFontColor: "#FFFFFF",
    gameEntryTimeFontColor: "#FFFFFF",
  };
  const compressedData = gzipSync(Buffer.from(JSON.stringify(data.minify())));
  let config = {
    broadcaster: {
      version: "1.0",
      content: Buffer.from(compressedData.buffer).toString("base64"),
    },
  };
  localStorage.setItem("src-twitch-ext", JSON.stringify(config));
}
