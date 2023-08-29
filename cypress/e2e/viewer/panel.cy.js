/// <reference types="cypress" />

import { generateConfiguration } from "../../lib/util";

describe("no stored configuration", () => {
  beforeEach(() => {
    cy.intercept("GET", "https://www.speedrun.com/api/**", {
      fixture: "viewer/src-basic-personal-bests",
    });
  });

  describe("loads empty panel", () => {
    beforeEach(() => {
      cy.visit("https://localhost:5173/viewer/");
    });

    it("displays no configuration found", () => {
      cy.get('[data-cy="panel-nothing-to-load"]');
    });
  });
});

describe("invalid configuration", () => {
  beforeEach(() => {
    cy.intercept("GET", "https://www.speedrun.com/api/**", {
      fixture: "viewer/src-basic-personal-bests",
    });
    localStorage.setItem(
      "src-twitch-ext",
      JSON.stringify({ broadcaster: "wow this config is malformed" }),
    );
  });

  describe("loads empty panel", () => {
    beforeEach(() => {
      cy.visit("https://localhost:5173/viewer/");
    });

    it("explains sr.com outage", () => {
      cy.get('[data-cy="panel-bad-config"]');
    });
  });
});

describe("valid config but lacking srcId", () => {
  beforeEach(() => {
    cy.intercept("GET", "https://www.speedrun.com/api/**", {
      fixture: "viewer/src-basic-personal-bests",
    });
    generateConfiguration({ userSrcId: null });
  });

  describe("loads empty panel", () => {
    beforeEach(() => {
      cy.visit("https://localhost:5173/viewer/");
    });

    it("explains sr.com outage", () => {
      cy.get('[data-cy="panel-nothing-to-load"]');
    });
  });
});

describe("speedrun.com outage", () => {
  beforeEach(() => {
    cy.intercept("GET", "https://www.speedrun.com/api/**", {
      statusCode: 500,
      body: {},
    });
    generateConfiguration({ currentThemeName: "_default-dark" });
  });

  describe("loads empty panel", () => {
    beforeEach(() => {
      cy.visit("https://localhost:5173/viewer/");
    });

    it("explains sr.com outage", () => {
      cy.get('[data-cy="panel-speedruncom-outage"]');
    });
  });
});

describe("stored configuration - basic panel", () => {
  beforeEach(() => {
    cy.intercept("GET", "https://www.speedrun.com/api/**", {
      fixture: "viewer/src-basic-personal-bests",
    });
    generateConfiguration({ currentThemeName: "_default-dark" });
    cy.visit("https://localhost:5173/viewer/");
  });

  describe("panel has 3 games", () => {
    it("game covers are rendered", () => {
      cy.root().find('[data-cy="panel-game-cover"]').should("have.length", 3);
    });

    it("game names are rendered", () => {
      cy.root().find('[data-cy="panel-game-name"]').should("have.length", 3);
    });

    it("game entry counts are rendered", () => {
      cy.root().find('[data-cy="panel-game-count"]').should("have.length", 3);
    });

    it("games can be expanded", () => {
      cy.root().find('[data-cy="panel-game-entry"]').should("not.be.visible");
      cy.get('[data-cy="panel-game-count"]').click({ multiple: true });
      cy.root().find('[data-cy="panel-game-entry"]').should("be.visible");
      cy.get('[data-cy="panel-game-count"]').click({ multiple: true });
      cy.root().find('[data-cy="panel-game-entry"]').should("not.be.visible");
    });
  });
});

describe("stored configuration - game with no runs", () => {
  beforeEach(() => {
    cy.intercept("GET", "https://www.speedrun.com/api/**", {
      fixture: "viewer/src-game-with-no-runs",
    });
    generateConfiguration({ currentThemeName: "_default-dark" });
    cy.visit("https://localhost:5173/viewer/");
  });

  describe("panel has 2 games", () => {
    it("game covers are rendered", () => {
      cy.root().find('[data-cy="panel-game-cover"]').should("have.length", 2);
    });

    it("game names are rendered", () => {
      cy.root().find('[data-cy="panel-game-name"]').should("have.length", 2);
    });

    it("game entry counts are rendered", () => {
      cy.root().find('[data-cy="panel-game-count"]').should("have.length", 2);
    });

    it("games can be expanded", () => {
      cy.root().find('[data-cy="panel-game-entry"]').should("not.be.visible");
      cy.get('[data-cy="panel-game-count"]').click({ multiple: true });
      cy.root().find('[data-cy="panel-game-entry"]').should("be.visible");
      cy.get('[data-cy="panel-game-count"]').click({ multiple: true });
      cy.root().find('[data-cy="panel-game-entry"]').should("not.be.visible");
    });
  });
});

describe("stored configuration - disabled games", () => {
  beforeEach(() => {
    cy.intercept("GET", "https://www.speedrun.com/api/**", {
      fixture: "viewer/src-basic-personal-bests.json",
    });
    generateConfiguration({
      disabledGames: ["v1pxqgm6"],
      currentThemeName: "_default-dark",
    });
    cy.visit("https://localhost:5173/viewer/");
  });

  describe("panel has 2 games", () => {
    it("game covers are rendered", () => {
      cy.root().find('[data-cy="panel-game-cover"]').should("have.length", 2);
      cy.root()
        .find('[data-cy="panel-game-entry-divider"]')
        .should("have.length.above", 0);
    });
  });
});

describe("stored configuration - dont group levels separately", () => {
  beforeEach(() => {
    cy.intercept("GET", "https://www.speedrun.com/api/**", {
      fixture: "viewer/src-basic-personal-bests.json",
    });
    generateConfiguration({
      currentThemeName: "_default-dark",
      groupLevelsSeparately: false,
    });
    cy.visit("https://localhost:5173/viewer/");
  });

  describe("levels are not separated", () => {
    it("game covers are rendered", () => {
      cy.root()
        .find('[data-cy="panel-game-entry-divider"]')
        .should("have.length", 0);
    });
  });
});

describe("stored configuration - game sorting - recent", () => {
  beforeEach(() => {
    cy.intercept("GET", "https://www.speedrun.com/api/**", {
      fixture: "viewer/src-basic-personal-bests.json",
    });
    generateConfiguration({
      gameSorting: "recent",
      currentThemeName: "_default-dark",
    });
    cy.visit("https://localhost:5173/viewer/");
  });

  it("games are in order", () => {
    cy.root()
      .find('[data-cy="panel-game-name"]')
      .eq(0)
      .should("have.text", "Jak II Category Extension");
    cy.root()
      .find('[data-cy="panel-game-name"]')
      .eq(1)
      .should("have.text", "Jak II");
    cy.root()
      .find('[data-cy="panel-game-name"]')
      .eq(2)
      .should("have.text", "Jak and Daxter: Misc Category Extensions");
  });
});

describe("stored configuration - game sorting - alpha", () => {
  beforeEach(() => {
    cy.intercept("GET", "https://www.speedrun.com/api/**", {
      fixture: "viewer/src-basic-personal-bests.json",
    });
    generateConfiguration({
      gameSorting: "alpha",
      currentThemeName: "_default-dark",
    });
    cy.visit("https://localhost:5173/viewer/");
  });

  it("games are in alphabetical order", () => {
    cy.root()
      .find('[data-cy="panel-game-name"]')
      .eq(0)
      .should("have.text", "Jak and Daxter: Misc Category Extensions");
    cy.root()
      .find('[data-cy="panel-game-name"]')
      .eq(1)
      .should("have.text", "Jak II");
    cy.root()
      .find('[data-cy="panel-game-name"]')
      .eq(2)
      .should("have.text", "Jak II Category Extension");
  });
});

describe("stored configuration - game sorting - num runs", () => {
  beforeEach(() => {
    cy.intercept("GET", "https://www.speedrun.com/api/**", {
      fixture: "viewer/src-basic-personal-bests.json",
    });
    generateConfiguration({
      gameSorting: "num",
      currentThemeName: "_default-dark",
    });
    cy.visit("https://localhost:5173/viewer/");
  });

  it("games are in order", () => {
    cy.root()
      .find('[data-cy="panel-game-name"]')
      .eq(0)
      .should("have.text", "Jak II");
    cy.root()
      .find('[data-cy="panel-game-name"]')
      .eq(1)
      .should("have.text", "Jak II Category Extension");
    cy.root()
      .find('[data-cy="panel-game-name"]')
      .eq(2)
      .should("have.text", "Jak and Daxter: Misc Category Extensions");
  });
});

describe("stored configuration - entry sorting - recent", () => {
  beforeEach(() => {
    cy.intercept("GET", "https://www.speedrun.com/api/**", {
      fixture: "viewer/src-basic-personal-bests.json",
    });
    generateConfiguration({
      entrySorting: "recent",
      disabledGames: ["v1pxqgm6", "kdkz25qd"],
      currentThemeName: "_default-dark",
    });
    cy.visit("https://localhost:5173/viewer/");
  });

  it("games are in order", () => {
    cy.root()
      .find('[data-cy="panel-game-entry"]')
      .eq(0)
      .should("contain.text", "100% - Original");
  });
});

describe("stored configuration - entry sorting - alpha", () => {
  beforeEach(() => {
    cy.intercept("GET", "https://www.speedrun.com/api/**", {
      fixture: "viewer/src-basic-personal-bests.json",
    });
    generateConfiguration({
      entrySorting: "alpha",
      disabledGames: ["v1pxqgm6", "kdkz25qd"],
      currentThemeName: "_default-dark",
    });
    cy.visit("https://localhost:5173/viewer/");
  });

  it("games are in order", () => {
    cy.root()
      .find('[data-cy="panel-game-entry"]')
      .eq(0)
      .should("contain.text", "100% - Original");
    cy.root()
      .find('[data-cy="panel-game-entry"]')
      .eq(1)
      .should("contain.text", "All Missions");
  });
});

describe("stored configuration - entry sorting - place", () => {
  beforeEach(() => {
    cy.intercept("GET", "https://www.speedrun.com/api/**", {
      fixture: "viewer/src-basic-personal-bests.json",
    });
    generateConfiguration({
      entrySorting: "place",
      disabledGames: ["v1pxqgm6", "kdkz25qd"],
      currentThemeName: "_custom-panel",
      showLeaderboardPlace: true,
    });
    cy.visit("https://localhost:5173/viewer/");
  });

  it("games are in order", () => {
    cy.root()
      .find('[data-cy="panel-game-entry"]')
      .eq(0)
      .should("contain.text", "Any% All Orbs - Original");
    cy.root()
      .find('[data-cy="panel-game-place"]')
      .should("have.length.above", 0);
  });
});
