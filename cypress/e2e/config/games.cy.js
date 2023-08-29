/// <reference types="cypress" />

import { getConfiguration, generateConfiguration } from "../../lib/util";

describe("no existing config", () => {
  beforeEach(() => {});

  describe("initial state", () => {
    beforeEach(() => {
      cy.visit("https://localhost:5173/config/#/games");
    });

    it("has empty username input", () => {
      cy.get('[data-cy="config_games_src-username-input"]').should(
        "have.value",
        "",
      );
    });

    it("has disabled buttons", () => {
      cy.get('[data-cy="config_games_refresh-btn"]').should(
        "have.attr",
        "disabled",
        "disabled",
      );
      cy.get('[data-cy="config_games_revert-btn"]').should(
        "have.attr",
        "disabled",
        "disabled",
      );
      cy.get('[data-cy="config_games_save-btn"]').should(
        "have.attr",
        "disabled",
        "disabled",
      );
    });
  });

  describe("problem when searching for user", () => {
    beforeEach(() => {
      cy.intercept("GET", "https://www.speedrun.com/api/v1/users*", {
        statusCode: 500,
        body: {},
      });
      cy.visit("https://localhost:5173/config/#/games");
    });

    it("has empty username input", () => {
      cy.get('[data-cy="config_games_src-username-input"]').should(
        "have.value",
        "",
      );
    });

    it("has disabled buttons", () => {
      cy.get('[data-cy="config_games_refresh-btn"]').should(
        "have.attr",
        "disabled",
        "disabled",
      );
      cy.get('[data-cy="config_games_revert-btn"]').should(
        "have.attr",
        "disabled",
        "disabled",
      );
      cy.get('[data-cy="config_games_save-btn"]').should(
        "have.attr",
        "disabled",
        "disabled",
      );
    });

    it("attempt to search for games", () => {
      cy.get('[data-cy="config_games_src-username-input"]')
        .shadow()
        .find("input")
        .type("this-user-doesnt-exist");
      cy.get('[data-cy="config_games_refresh-btn"]').should(
        "not.have.attr",
        "disabled",
        "disabled",
      );
      cy.get('[data-cy="config_games_revert-btn"]').should(
        "have.attr",
        "disabled",
        "disabled",
      );
      cy.get('[data-cy="config_games_save-btn"]').should(
        "have.attr",
        "disabled",
        "disabled",
      );
      cy.get('[data-cy="config_games_refresh-btn"]').click();
      cy.contains(
        "sl-alert",
        "Unexpected error occurred when looking up the Speedrun.com user",
      );
    });
  });

  describe("problem when searching for personal bests", () => {
    beforeEach(() => {
      cy.intercept("GET", "https://www.speedrun.com/api/v1/users*", {
        fixture: "config/games/valid-user-lookup.json",
      });
      cy.intercept(
        "GET",
        "https://www.speedrun.com/api/v1/users/*/personal-bests*",
        {
          statusCode: 500,
          body: {},
        },
      );
      cy.visit("https://localhost:5173/config/#/games");
    });

    it("has empty username input", () => {
      cy.get('[data-cy="config_games_src-username-input"]').should(
        "have.value",
        "",
      );
    });

    it("has disabled buttons", () => {
      cy.get('[data-cy="config_games_refresh-btn"]').should(
        "have.attr",
        "disabled",
        "disabled",
      );
      cy.get('[data-cy="config_games_revert-btn"]').should(
        "have.attr",
        "disabled",
        "disabled",
      );
      cy.get('[data-cy="config_games_save-btn"]').should(
        "have.attr",
        "disabled",
        "disabled",
      );
    });

    it("attempt to search for games", () => {
      cy.get('[data-cy="config_games_src-username-input"]')
        .shadow()
        .find("input")
        .type("this-user-doesnt-exist");
      cy.get('[data-cy="config_games_refresh-btn"]').should(
        "not.have.attr",
        "disabled",
        "disabled",
      );
      cy.get('[data-cy="config_games_revert-btn"]').should(
        "have.attr",
        "disabled",
        "disabled",
      );
      cy.get('[data-cy="config_games_save-btn"]').should(
        "have.attr",
        "disabled",
        "disabled",
      );
      cy.get('[data-cy="config_games_refresh-btn"]').click();
      cy.root()
        .get("sl-alert")
        .contains("Unable to retrieve data from Speedrun.com");
      cy.get('[data-cy="config_games_speedruncom-error"]');
    });
  });

  describe("successfully search", () => {
    beforeEach(() => {
      cy.intercept("GET", "https://www.speedrun.com/api/v1/users*", {
        fixture: "config/games/valid-user-lookup.json",
      });
      cy.intercept(
        "GET",
        "https://www.speedrun.com/api/v1/users/*/personal-bests*",
        {
          fixture: "config/games/src-basic-personal-bests.json",
        },
      );
      cy.visit("https://localhost:5173/config/#/games");
    });

    it("has empty username input", () => {
      cy.get('[data-cy="config_games_src-username-input"]').should(
        "have.value",
        "",
      );
    });

    it("has disabled buttons", () => {
      cy.get('[data-cy="config_games_refresh-btn"]').should(
        "have.attr",
        "disabled",
        "disabled",
      );
      cy.get('[data-cy="config_games_revert-btn"]').should(
        "have.attr",
        "disabled",
        "disabled",
      );
      cy.get('[data-cy="config_games_save-btn"]').should(
        "have.attr",
        "disabled",
        "disabled",
      );
    });

    it("attempt to search for games", () => {
      cy.get('[data-cy="config_games_src-username-input"]')
        .shadow()
        .find("input")
        .type("this-user-doesnt-exist");
      cy.get('[data-cy="config_games_refresh-btn"]').should(
        "not.have.attr",
        "disabled",
        "disabled",
      );
      cy.get('[data-cy="config_games_revert-btn"]').should(
        "have.attr",
        "disabled",
        "disabled",
      );
      cy.get('[data-cy="config_games_save-btn"]').should(
        "have.attr",
        "disabled",
        "disabled",
      );
      cy.get('[data-cy="config_games_refresh-btn"]').click();
      cy.get('[data-cy="config_games_game-checkbox"]').should("have.length", 3);
      cy.get('[data-cy="config_games_revert-btn"]').should(
        "have.attr",
        "disabled",
        "disabled",
      );
      cy.get('[data-cy="config_games_save-btn"]')
        .click()
        .then(() => {
          const config = getConfiguration();
          expect(config.gameData.disabledGames).to.have.length(0);
          expect(config.gameData.gameSorting).to.eq("recent");
          expect(config.gameData.entrySorting).to.eq("recent");
          expect(config.gameData.groupLevelsSeparately).to.eq(true);
          expect(config.gameData.userSrcId).to.eq("e8envo80");
          expect(config.gameData.userSrcName).to.eq("this-user-doesnt-exist");
        });
      cy.root().get("sl-alert").contains("Settings Saved Successfully!");
      cy.get('[data-cy="config_games_revert-btn"]').should(
        "have.attr",
        "disabled",
        "disabled",
      );
      cy.get('[data-cy="config_games_save-btn"]').should(
        "have.attr",
        "disabled",
        "disabled",
      );
    });

    it("change sorting", () => {
      cy.get('[data-cy="config_games_src-username-input"]')
        .shadow()
        .find("input")
        .type("this-user-doesnt-exist");
      cy.get('[data-cy="config_games_refresh-btn"]').click();
      cy.get('[data-cy="config_games_game-sorting-alpha"]')
        .shadow()
        .find("[part=label]")
        .click();
      cy.get('[data-cy="config_games_entry-sorting-place"]')
        .shadow()
        .find("[part=label]")
        .click();
      cy.get('[data-cy="config_games_save-btn"]')
        .click()
        .then(() => {
          const config = getConfiguration();
          expect(config.gameData.disabledGames).to.have.length(0);
          expect(config.gameData.gameSorting).to.eq("alpha");
          expect(config.gameData.entrySorting).to.eq("place");
          expect(config.gameData.groupLevelsSeparately).to.eq(true);
          expect(config.gameData.userSrcId).to.eq("e8envo80");
          expect(config.gameData.userSrcName).to.eq("this-user-doesnt-exist");
        });
      cy.root().get("sl-alert").contains("Settings Saved Successfully!");
      cy.get('[data-cy="config_games_revert-btn"]').should(
        "have.attr",
        "disabled",
        "disabled",
      );
      cy.get('[data-cy="config_games_save-btn"]').should(
        "have.attr",
        "disabled",
        "disabled",
      );
    });
    // TODO - can't click a checkbox - https://github.com/cypress-io/cypress-documentation/pull/4256
  });
});

describe("malformed config", () => {
  before(() => {
    cy.intercept("GET", "https://www.speedrun.com/api/v1/users*", {
      fixture: "config/games/valid-user-lookup.json",
    });
    cy.intercept(
      "GET",
      "https://www.speedrun.com/api/v1/users/*/personal-bests*",
      {
        fixture: "config/games/src-basic-personal-bests.json",
      },
    );
    localStorage.setItem(
      "src-twitch-ext",
      JSON.stringify({ broadcaster: "wow this config is malformed" }),
    );
    cy.visit("https://localhost:5173/config/#/games");
    console.log(localStorage.getItem("src-twitch-ext"));
  });

  it("reset and successfully setup", () => {
    cy.get('[data-cy="panel-bad-config-prompt"]');
    cy.get('[data-cy="config_games_config-reset-btn"]').click();

    cy.get('[data-cy="config_games_src-username-input"]').should(
      "have.value",
      "",
    );

    cy.get('[data-cy="config_games_refresh-btn"]').should(
      "have.attr",
      "disabled",
      "disabled",
    );
    cy.get('[data-cy="config_games_revert-btn"]').should(
      "have.attr",
      "disabled",
      "disabled",
    );
    cy.get('[data-cy="config_games_save-btn"]').should(
      "have.attr",
      "disabled",
      "disabled",
    );

    cy.get('[data-cy="config_games_src-username-input"]')
      .shadow()
      .find("input")
      .type("this-user-doesnt-exist");
    cy.get('[data-cy="config_games_refresh-btn"]').should(
      "not.have.attr",
      "disabled",
      "disabled",
    );
    cy.get('[data-cy="config_games_revert-btn"]').should(
      "have.attr",
      "disabled",
      "disabled",
    );
    cy.get('[data-cy="config_games_save-btn"]').should(
      "have.attr",
      "disabled",
      "disabled",
    );
    cy.get('[data-cy="config_games_refresh-btn"]').click();
    cy.get('[data-cy="config_games_game-checkbox"]').should("have.length", 3);
    cy.get('[data-cy="config_games_revert-btn"]').should(
      "have.attr",
      "disabled",
      "disabled",
    );
    cy.get('[data-cy="config_games_save-btn"]')
      .click()
      .then(() => {
        const config = getConfiguration();
        expect(config.gameData.disabledGames).to.have.length(0);
        expect(config.gameData.gameSorting).to.eq("recent");
        expect(config.gameData.entrySorting).to.eq("recent");
        expect(config.gameData.groupLevelsSeparately).to.eq(true);
        expect(config.gameData.userSrcId).to.eq("e8envo80");
        expect(config.gameData.userSrcName).to.eq("this-user-doesnt-exist");
      });
    cy.root().get("sl-alert").contains("Settings Saved Successfully!");
    cy.get('[data-cy="config_games_revert-btn"]').should(
      "have.attr",
      "disabled",
      "disabled",
    );
    cy.get('[data-cy="config_games_save-btn"]').should(
      "have.attr",
      "disabled",
      "disabled",
    );
    cy.get('[data-cy="config_games_refresh-btn"]').click();
    cy.get('[data-cy="config_games_game-sorting-alpha"]')
      .shadow()
      .find("[part=label]")
      .click();
    cy.get('[data-cy="config_games_entry-sorting-place"]')
      .shadow()
      .find("[part=label]")
      .click();
    cy.get('[data-cy="config_games_save-btn"]')
      .click()
      .then(() => {
        const config = getConfiguration();
        expect(config.gameData.disabledGames).to.have.length(0);
        expect(config.gameData.gameSorting).to.eq("alpha");
        expect(config.gameData.entrySorting).to.eq("place");
        expect(config.gameData.groupLevelsSeparately).to.eq(true);
        expect(config.gameData.userSrcId).to.eq("e8envo80");
        expect(config.gameData.userSrcName).to.eq("this-user-doesnt-exist");
      });
    cy.root().get("sl-alert").contains("Settings Saved Successfully!");
    cy.get('[data-cy="config_games_revert-btn"]').should(
      "have.attr",
      "disabled",
      "disabled",
    );
    cy.get('[data-cy="config_games_save-btn"]').should(
      "have.attr",
      "disabled",
      "disabled",
    );
  });
});

describe("existing config", () => {
  beforeEach(() => {
    cy.intercept(
      "GET",
      "https://www.speedrun.com/api/v1/users/*/personal-bests*",
      {
        fixture: "config/games/src-basic-personal-bests.json",
      },
    );
    generateConfiguration({});
  });

  describe("loads as expected", () => {
    beforeEach(() => {
      cy.visit("https://localhost:5173/config/#/games");
    });

    it("username is populated", () => {
      cy.get('[data-cy="config_games_src-username-input"]').should(
        "have.value",
        "xtvaser",
      );
    });

    it("initial button state", () => {
      cy.get('[data-cy="config_games_refresh-btn"]').should(
        "not.have.attr",
        "disabled",
        "disabled",
      );
      cy.get('[data-cy="config_games_revert-btn"]').should(
        "have.attr",
        "disabled",
        "disabled",
      );
      cy.get('[data-cy="config_games_save-btn"]').should(
        "have.attr",
        "disabled",
        "disabled",
      );
    });

    it("games load", () => {
      cy.get('[data-cy="config_games_game-checkbox"]').should("have.length", 3);
    });
  });

  describe("can change username", () => {
    beforeEach(() => {
      cy.intercept("GET", "https://www.speedrun.com/api/v1/users*", {
        fixture: "config/games/another-user-lookup.json",
      });
      cy.intercept(
        "GET",
        "https://www.speedrun.com/api/v1/users/f8envo80/personal-bests*",
        {
          fixture: "config/games/src-basic-personal-bests-different.json",
        },
      );
      cy.visit("https://localhost:5173/config/#/games");
    });

    it("change username successfully", () => {
      cy.get('[data-cy="config_games_src-username-input"]').should(
        "have.value",
        "xtvaser",
      );
      cy.get('[data-cy="config_games_refresh-btn"]').should(
        "not.have.attr",
        "disabled",
        "disabled",
      );
      cy.get('[data-cy="config_games_revert-btn"]').should(
        "have.attr",
        "disabled",
        "disabled",
      );
      cy.get('[data-cy="config_games_save-btn"]').should(
        "have.attr",
        "disabled",
        "disabled",
      );
      cy.get('[data-cy="config_games_game-checkbox"]').should("have.length", 3);
      cy.get('[data-cy="config_games_src-username-input"]')
        .shadow()
        .find("input")
        .clear()
        .type("different-user");
      cy.get('[data-cy="config_games_refresh-btn"]').click();
      cy.get('[data-cy="config_games_game-checkbox"]').should("have.length", 2);
      cy.get('[data-cy="config_games_save-btn"]')
        .click()
        .then(() => {
          const config = getConfiguration();
          expect(config.gameData.disabledGames).to.have.length(0);
          expect(config.gameData.gameSorting).to.eq("recent");
          expect(config.gameData.entrySorting).to.eq("recent");
          expect(config.gameData.groupLevelsSeparately).to.eq(true);
          expect(config.gameData.userSrcId).to.eq("f8envo80");
          expect(config.gameData.userSrcName).to.eq("different-user");
        });
      cy.root().get("sl-alert").contains("Settings Saved Successfully!");
      cy.get('[data-cy="config_games_revert-btn"]').should(
        "have.attr",
        "disabled",
        "disabled",
      );
      cy.get('[data-cy="config_games_save-btn"]').should(
        "have.attr",
        "disabled",
        "disabled",
      );
    });
  });
});
