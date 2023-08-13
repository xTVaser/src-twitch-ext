/// <reference types="cypress" />

describe("no existing config", () => {
  beforeEach(() => {});

  describe("initial state", () => {
    beforeEach(() => {
      cy.visit("https://localhost:5173/config/#/games");
    });

    it("has empty username input", () => {
      cy.get('[data-cy="config_games_src-username-input"]').should("have.value", "");
    });

    it("has disabled buttons", () => {
      cy.get('[data-cy="config_games_refresh-btn"]').should("have.attr", "disabled", "disabled");
      cy.get('[data-cy="config_games_revert-btn"]').should("have.attr", "disabled", "disabled");
      cy.get('[data-cy="config_games_save-btn"]').should("have.attr", "disabled", "disabled");
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
      cy.get('[data-cy="config_games_src-username-input"]').should("have.value", "");
    });

    it("has disabled buttons", () => {
      cy.get('[data-cy="config_games_refresh-btn"]').should("have.attr", "disabled", "disabled");
      cy.get('[data-cy="config_games_revert-btn"]').should("have.attr", "disabled", "disabled");
      cy.get('[data-cy="config_games_save-btn"]').should("have.attr", "disabled", "disabled");
    });

    it("attempt to search for games", () => {
      cy.get('[data-cy="config_games_src-username-input"]').shadow()
      .find("input").type("this-user-doesnt-exist");
      cy.get('[data-cy="config_games_refresh-btn"]').should("not.have.attr", "disabled", "disabled");
      cy.get('[data-cy="config_games_revert-btn"]').should("have.attr", "disabled", "disabled");
      cy.get('[data-cy="config_games_save-btn"]').should("have.attr", "disabled", "disabled");
      cy.get('[data-cy="config_games_refresh-btn"]').click();
      cy.contains("sl-alert", "Unexpected error occurred when looking up the Speedrun.com User");
    });
  });

  describe("problem when searching for personal bests", () => {
    beforeEach(() => {
      cy.intercept("GET", "https://www.speedrun.com/api/v1/users*", {
        fixture: "config/games/valid-user-lookup.json",
      });
      cy.intercept("GET", "https://www.speedrun.com/api/v1/users/*/personal-bests*", {
        statusCode: 500,
        body: {},
      });
      cy.visit("https://localhost:5173/config/#/games");
    });

    it("has empty username input", () => {
      cy.get('[data-cy="config_games_src-username-input"]').should("have.value", "");
    });

    it("has disabled buttons", () => {
      cy.get('[data-cy="config_games_refresh-btn"]').should("have.attr", "disabled", "disabled");
      cy.get('[data-cy="config_games_revert-btn"]').should("have.attr", "disabled", "disabled");
      cy.get('[data-cy="config_games_save-btn"]').should("have.attr", "disabled", "disabled");
    });

    it("attempt to search for games", () => {
      cy.get('[data-cy="config_games_src-username-input"]').shadow()
      .find("input").type("this-user-doesnt-exist");
      cy.get('[data-cy="config_games_refresh-btn"]').should("not.have.attr", "disabled", "disabled");
      cy.get('[data-cy="config_games_revert-btn"]').should("have.attr", "disabled", "disabled");
      cy.get('[data-cy="config_games_save-btn"]').should("have.attr", "disabled", "disabled");
      cy.get('[data-cy="config_games_refresh-btn"]').click();
      cy.root().get("sl-alert").contains("Unable to retrieve data from Speedrun.com");
    });
  });

  describe("successfully search", () => {
    beforeEach(() => {
      cy.intercept("GET", "https://www.speedrun.com/api/v1/users*", {
        fixture: "config/games/valid-user-lookup.json",
      });
      cy.intercept("GET", "https://www.speedrun.com/api/v1/users/*/personal-bests*", {
        fixture: "config/games/src-basic-personal-bests.json"
      });
      cy.visit("https://localhost:5173/config/#/games");
    });

    it("has empty username input", () => {
      cy.get('[data-cy="config_games_src-username-input"]').should("have.value", "");
    });

    it("has disabled buttons", () => {
      cy.get('[data-cy="config_games_refresh-btn"]').should("have.attr", "disabled", "disabled");
      cy.get('[data-cy="config_games_revert-btn"]').should("have.attr", "disabled", "disabled");
      cy.get('[data-cy="config_games_save-btn"]').should("have.attr", "disabled", "disabled");
    });

    it("attempt to search for games", () => {
      cy.get('[data-cy="config_games_src-username-input"]').shadow()
      .find("input").type("this-user-doesnt-exist");
      cy.get('[data-cy="config_games_refresh-btn"]').should("not.have.attr", "disabled", "disabled");
      cy.get('[data-cy="config_games_revert-btn"]').should("have.attr", "disabled", "disabled");
      cy.get('[data-cy="config_games_save-btn"]').should("have.attr", "disabled", "disabled");
      cy.get('[data-cy="config_games_refresh-btn"]').click();
      cy.get('[data-cy="config_games-game-list-entry"]').should("have.length", 3);
      cy.get('[data-cy="config_games-game-options"]').should("have.length", 3);
      cy.get('[data-cy="config_games_revert-btn"]').should("have.attr", "disabled", "disabled");
      cy.get('[data-cy="config_games_save-btn"]').click().then(() => {
        const config = JSON.parse(
          JSON.parse(localStorage.getItem("src-twitch-ext")).broadcaster
            .content,
        );
        expect(config.gameData.games).to.have.length(3);
        expect(config.gameData.games[0].title).to.equal("Jak and Daxter: Misc Category Extensions");
        expect(config.gameData.userSrcId).to.eq("e8envo80");
        expect(config.gameData.userSrcName).to.eq("this-user-doesnt-exist");
      });
      cy.root().get("sl-alert").contains("Settings Saved Successfully!");
      cy.get('[data-cy="config_games_revert-btn"]').should("have.attr", "disabled", "disabled");
      cy.get('[data-cy="config_games_save-btn"]').should("have.attr", "disabled", "disabled");
    });
  });
});

// TODO - test revert above ^^

describe("existing config", () => {
  beforeEach(() => {
    cy.intercept("GET", "https://www.speedrun.com/api/v1/users/*/personal-bests*", {
      fixture: "config/games/src-basic-personal-bests.json"
    });
    cy.fixture("config-with-games.json").then((value) => {
      localStorage.setItem("src-twitch-ext", JSON.stringify(value));
    });
  });

  describe("disable a game", () => {
    beforeEach(() => {
      cy.visit("https://localhost:5173/config/#/games");
    });

    it("username is populated", () => {
      cy.get('[data-cy="config_games_src-username-input"]').should("have.value", "xtvaser");
    });

    it("initial button state", () => {
      cy.get('[data-cy="config_games_refresh-btn"]').should("not.have.attr", "disabled", "disabled");
      cy.get('[data-cy="config_games_revert-btn"]').should("have.attr", "disabled", "disabled");
      cy.get('[data-cy="config_games_save-btn"]').should("have.attr", "disabled", "disabled");
    });

    // it("disable first game", () => {
    //   cy.get('[data-cy="config_games-game-options"]').eq(0).click();
    //   cy.wait(2000);
    //   cy.get('[data-cy="config_games-game-options"]').eq(0).find('[data-cy="config_games-game-status-switch"]').dblclick();
    //   cy.get('[data-cy="config_games_revert-btn"]').should("not.have.attr", "disabled", "disabled");
    //   cy.get('[data-cy="config_games_save-btn"]').should("not.have.attr", "disabled", "disabled");
    // });

    // TODO - can't get a click to fire properly on the switches, is it because they are inside the details?
  });
});

// TODO - would be nice to eventually get drag/drop working but its tedious - https://github.com/cypress-io/cypress/issues/845
