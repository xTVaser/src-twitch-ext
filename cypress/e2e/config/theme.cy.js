/// <reference types="cypress" />

import { getConfiguration, generateConfiguration } from "../../lib/util";

describe("no existing config", () => {
  beforeEach(() => {
    cy.intercept("GET", "https://www.speedrun.com/api/**", {
      fixture: "config/theme/src-basic-personal-bests",
    });
  });

  describe("initial state", () => {
    beforeEach(() => {
      cy.visit("https://localhost:5173/config/#/themes");
    });
    it("has the default themes", () => {
      cy.get('[data-cy="theme-selector"]');
      cy.get('[data-cy="theme-selector"]').click();
      cy.get('[data-cy="theme-selector"]')
        .find("sl-option")
        .should("have.length", 1);
      cy.get('[data-cy="theme-selector"]')
        .find("sl-option")
        .contains("Default Dark")
        .click();
    });

    it("new theme entry is blank", () => {
      cy.get('[data-cy="new-theme-input"]').should("have.value", "");
      cy.get('[data-cy="create-theme-btn"]').should(
        "have.attr",
        "disabled",
        "disabled",
      );
    });

    it("buttons are not visible", () => {
      cy.get('[data-cy="delete-theme-btn"]').should("not.exist");
      cy.get('[data-cy="revert-changes-btn"]').should("not.exist");
      cy.get('[data-cy="save-changes-btn"]').should("not.exist");
    });
  });

  describe("create new theme", () => {
    beforeEach(() => {
      cy.visit("https://localhost:5173/config/#/themes");
      // Create a theme
      cy.get('[data-cy="new-theme-input"]')
        .shadow()
        .find("input")
        .type("Test Theme");
      cy.get('[data-cy="create-theme-btn"]')
        .should("not.have.attr", "disabled", "disabled")
        .click();
      cy.get('[data-cy="theme-selector"]').contains("Test Theme");
      cy.get('[data-cy="new-theme-input"]').should("have.value", "");
      cy.get('[data-cy="create-theme-btn"]').should(
        "have.attr",
        "disabled",
        "disabled",
      );
      // Save it
      cy.get('[data-cy="save-changes-btn"]')
        .should("exist")
        .should("not.have.attr", "disabled", "disabled")
        .click();
      cy.contains("sl-alert", "New Theme Created!");
      // can only make 1 custom theme
      cy.get('[data-cy="new-theme-input"]')
        .shadow()
        .find("input")
        .type("another one");
      cy.get('[data-cy="create-theme-btn"]')
        .should("not.have.attr", "disabled", "disabled")
        .click();
      cy.contains("sl-alert", "You can only have 1 custom theme");
    });

    it("theme management buttons exist and are enabled", () => {
      cy.get('[data-cy="delete-theme-btn"]')
        .should("exist")
        .should("not.have.attr", "disabled", "disabled");
      cy.get('[data-cy="revert-changes-btn"]').should("not.exist");
      cy.get('[data-cy="save-changes-btn"]').should("not.exist");
    });
  });

  describe("create new theme - too long", () => {
    beforeEach(() => {
      cy.visit("https://localhost:5173/config/#/themes");
      // Create a theme
      cy.get('[data-cy="new-theme-input"]')
        .shadow()
        .find("input")
        .type("thisisaverylongthemenametruncated");
      cy.get('[data-cy="create-theme-btn"]')
        .should("not.have.attr", "disabled", "disabled")
        .click();
      cy.get('[data-cy="theme-selector"]').contains(
        "thisisaverylongthemenametruncate",
      );
      cy.get('[data-cy="new-theme-input"]').should("have.value", "");
      cy.get('[data-cy="create-theme-btn"]').should(
        "have.attr",
        "disabled",
        "disabled",
      );
      // Save it
      cy.get('[data-cy="save-changes-btn"]')
        .should("exist")
        .should("not.have.attr", "disabled", "disabled")
        .click();
      cy.contains("sl-alert", "New Theme Created!");
    });

    it("theme management buttons exist and are enabled", () => {
      cy.get('[data-cy="delete-theme-btn"]')
        .should("exist")
        .should("not.have.attr", "disabled", "disabled");
      cy.get('[data-cy="revert-changes-btn"]').should("not.exist");
      cy.get('[data-cy="save-changes-btn"]').should("not.exist");
    });
  });
});

describe("existing configuration", () => {
  beforeEach(() => {
    cy.intercept("GET", "https://www.speedrun.com/api/**", {
      fixture: "config/theme/src-basic-personal-bests",
    });
    generateConfiguration({});
    cy.visit("https://localhost:5173/config/#/themes");
  });

  describe("modify theme settings", () => {
    it("validate button states", () => {
      cy.get('[data-cy="create-theme-btn"]')
        .should("exist")
        .should("have.attr", "disabled", "disabled");
      cy.get('[data-cy="delete-theme-btn"]')
        .should("exist")
        .should("not.have.attr", "disabled", "disabled");
      cy.get('[data-cy="revert-changes-btn"]').should("not.exist");
      cy.get('[data-cy="save-changes-btn"]').should("not.exist");
    });

    it("hide expand icon", () => {
      cy.get('[data-cy="extension-panel"]')
        .find("sl-details")
        .shadow()
        .find('[name="chevron-right"]');
      // make the change
      cy.get('[data-cy="hide-expand-icon-switch"]').click();
      cy.get('[data-cy="revert-changes-btn"]')
        .should("exist")
        .should("not.have.attr", "disabled", "disabled");
      cy.get('[data-cy="save-changes-btn"]')
        .should("exist")
        .should("not.have.attr", "disabled", "disabled");
      cy.get('[data-cy="extension-panel"]')
        .find("sl-details")
        .shadow()
        .find('[name="chevron-right"]')
        .should("not.be.visible");
      // revert the change
      cy.get('[data-cy="hide-expand-icon-switch"]').click();
      cy.get('[data-cy="revert-changes-btn"]').should("not.exist");
      cy.get('[data-cy="save-changes-btn"]').should("not.exist");
      // test saving the change
      cy.get('[data-cy="hide-expand-icon-switch"]').click();
      cy.get('[data-cy="save-changes-btn"]')
        .click()
        .then(() => {
          const config = getConfiguration();
          console.log(config);
          expect(config.customThemes["_custom-test"].hideExpandIcon).to.equal(
            true,
          );
        });
    });

    it("rainbow world record", () => {
      cy.get('[data-cy="extension-panel"]')
        .find(".rainbow-cycle")
        .should("have.length", 0);
      // make the change
      cy.get('[data-cy="rainbow-world-record-switch"]').click();
      cy.get('[data-cy="revert-changes-btn"]')
        .should("exist")
        .should("not.have.attr", "disabled", "disabled");
      cy.get('[data-cy="save-changes-btn"]')
        .should("exist")
        .should("not.have.attr", "disabled", "disabled");
      cy.get('[data-cy="extension-panel"]')
        .find(".rainbow-cycle")
        .should("have.length.at.least", 1);
      // revert the change
      cy.get('[data-cy="rainbow-world-record-switch"]').click();
      cy.get('[data-cy="revert-changes-btn"]').should("not.exist");
      cy.get('[data-cy="save-changes-btn"]').should("not.exist");
      // test saving the change
      cy.get('[data-cy="rainbow-world-record-switch"]').click();
      cy.get('[data-cy="save-changes-btn"]')
        .click()
        .then(() => {
          const config = getConfiguration();
          expect(
            config.customThemes["_custom-test"].showRainbowWorldRecord,
          ).to.equal(true);
        });
    });

    it("show leaderboard position", () => {
      // make the change
      cy.get('[data-cy="show-lb-place-switch"]').click();
      cy.get('[data-cy="revert-changes-btn"]')
        .should("exist")
        .should("not.have.attr", "disabled", "disabled");
      cy.get('[data-cy="save-changes-btn"]')
        .should("exist")
        .should("not.have.attr", "disabled", "disabled");
      // revert the change
      cy.get('[data-cy="show-lb-place-switch"]').click();
      cy.get('[data-cy="revert-changes-btn"]').should("not.exist");
      cy.get('[data-cy="save-changes-btn"]').should("not.exist");
      // test saving the change
      cy.get('[data-cy="show-lb-place-switch"]').click();
      cy.get('[data-cy="save-changes-btn"]')
        .click()
        .then(() => {
          const config = getConfiguration();
          expect(config.customThemes["_custom-test"].showPlace).to.equal(true);
        });
    });

    it("expand icon color", () => {
      // make the change
      cy.get('[data-cy="expand-icon-color"]')
        .invoke("val", "#F0F0F0")
        .click()
        .parent()
        .click();
      cy.get('[data-cy="revert-changes-btn"]')
        .should("exist")
        .should("not.have.attr", "disabled", "disabled");
      cy.get('[data-cy="save-changes-btn"]')
        .should("exist")
        .should("not.have.attr", "disabled", "disabled");
      // revert the change
      cy.get('[data-cy="expand-icon-color"]')
        .invoke("val", "#FFFFFF")
        .click()
        .parent()
        .click();
      cy.get('[data-cy="revert-changes-btn"]').should("not.exist");
      cy.get('[data-cy="save-changes-btn"]').should("not.exist");
      // test saving the change
      cy.get('[data-cy="expand-icon-color"]')
        .invoke("val", "#F0F0F0")
        .click()
        .parent()
        .click();
      cy.get('[data-cy="save-changes-btn"]')
        .click()
        .then(() => {
          const config = getConfiguration();
          expect(
            config.customThemes["_custom-test"].gameExpandIconColor,
          ).to.equal("#F0F0F0");
        });
    });

    it("leaderboard position color", () => {
      // make the change
      cy.get('[data-cy="leaderboard-place-color"]')
        .invoke("val", "#F0F0F0")
        .click()
        .parent()
        .click();
      cy.get('[data-cy="revert-changes-btn"]')
        .should("exist")
        .should("not.have.attr", "disabled", "disabled");
      cy.get('[data-cy="save-changes-btn"]')
        .should("exist")
        .should("not.have.attr", "disabled", "disabled");
      // revert the change
      cy.get('[data-cy="leaderboard-place-color"]')
        .invoke("val", "#FFFFFF")
        .click()
        .parent()
        .click();
      cy.get('[data-cy="revert-changes-btn"]').should("not.exist");
      cy.get('[data-cy="save-changes-btn"]').should("not.exist");
      // test saving the change
      cy.get('[data-cy="leaderboard-place-color"]')
        .invoke("val", "#F0F0F0")
        .click()
        .parent()
        .click();
      cy.get('[data-cy="save-changes-btn"]')
        .click()
        .then(() => {
          const config = getConfiguration();
          expect(
            config.customThemes["_custom-test"].gameEntryLeaderboardPlaceColor,
          ).to.equal("#F0F0F0");
        });
    });

    it("main background color", () => {
      // make the change
      cy.get('[data-cy="main-bg-color"]')
        .invoke("val", "#F0F0F0")
        .click()
        .parent()
        .click();
      cy.get('[data-cy="revert-changes-btn"]')
        .should("exist")
        .should("not.have.attr", "disabled", "disabled");
      cy.get('[data-cy="save-changes-btn"]')
        .should("exist")
        .should("not.have.attr", "disabled", "disabled");
      // revert the change
      cy.get('[data-cy="main-bg-color"]')
        .invoke("val", "#FFFFFF")
        .click()
        .parent()
        .click();
      cy.get('[data-cy="revert-changes-btn"]').should("not.exist");
      cy.get('[data-cy="save-changes-btn"]').should("not.exist");
      // test saving the change
      cy.get('[data-cy="main-bg-color"]')
        .invoke("val", "#F0F0F0")
        .click()
        .parent()
        .click();
      cy.get('[data-cy="save-changes-btn"]')
        .click()
        .then(() => {
          const config = getConfiguration();
          expect(
            config.customThemes["_custom-test"].mainBackgroundColor,
          ).to.equal("#F0F0F0");
        });
    });

    it("game header background color", () => {
      // make the change
      cy.get('[data-cy="game-header-bg-color"]')
        .invoke("val", "#F0F0F0")
        .click()
        .parent()
        .click();
      cy.get('[data-cy="revert-changes-btn"]')
        .should("exist")
        .should("not.have.attr", "disabled", "disabled");
      cy.get('[data-cy="save-changes-btn"]')
        .should("exist")
        .should("not.have.attr", "disabled", "disabled");
      // revert the change
      cy.get('[data-cy="game-header-bg-color"]')
        .invoke("val", "#FFFFFF")
        .click()
        .parent()
        .click();
      cy.get('[data-cy="revert-changes-btn"]').should("not.exist");
      cy.get('[data-cy="save-changes-btn"]').should("not.exist");
      // test saving the change
      cy.get('[data-cy="game-header-bg-color"]')
        .invoke("val", "#F0F0F0")
        .click()
        .parent()
        .click();
      cy.get('[data-cy="save-changes-btn"]')
        .click()
        .then(() => {
          const config = getConfiguration();
          expect(
            config.customThemes["_custom-test"].gameHeaderBackgroundColor,
          ).to.equal("#F0F0F0");
        });
    });

    it("game entry background color", () => {
      // make the change
      cy.get('[data-cy="game-entry-bg-color"]')
        .invoke("val", "#F0F0F0")
        .click()
        .parent()
        .click();
      cy.get('[data-cy="revert-changes-btn"]')
        .should("exist")
        .should("not.have.attr", "disabled", "disabled");
      cy.get('[data-cy="save-changes-btn"]')
        .should("exist")
        .should("not.have.attr", "disabled", "disabled");
      // revert the change
      cy.get('[data-cy="game-entry-bg-color"]')
        .invoke("val", "#FFFFFF")
        .click()
        .parent()
        .click();
      cy.get('[data-cy="revert-changes-btn"]').should("not.exist");
      cy.get('[data-cy="save-changes-btn"]').should("not.exist");
      // test saving the change
      cy.get('[data-cy="game-entry-bg-color"]')
        .invoke("val", "#F0F0F0")
        .click()
        .parent()
        .click();
      cy.get('[data-cy="save-changes-btn"]')
        .click()
        .then(() => {
          const config = getConfiguration();
          expect(
            config.customThemes["_custom-test"].gameEntriesBackgroundColor,
          ).to.equal("#F0F0F0");
        });
    });

    it("game entry odd background color", () => {
      // make the change
      cy.get('[data-cy="game-entry-odd-bg-color"]')
        .invoke("val", "#F0F0F0")
        .click()
        .parent()
        .click();
      cy.get('[data-cy="revert-changes-btn"]')
        .should("exist")
        .should("not.have.attr", "disabled", "disabled");
      cy.get('[data-cy="save-changes-btn"]')
        .should("exist")
        .should("not.have.attr", "disabled", "disabled");
      // revert the change
      cy.get('[data-cy="game-entry-odd-bg-color"]')
        .invoke("val", "#FFFFFF")
        .click()
        .parent()
        .click();
      cy.get('[data-cy="revert-changes-btn"]').should("not.exist");
      cy.get('[data-cy="save-changes-btn"]').should("not.exist");
      // test saving the change
      cy.get('[data-cy="game-entry-odd-bg-color"]')
        .invoke("val", "#F0F0F0")
        .click()
        .parent()
        .click();
      cy.get('[data-cy="save-changes-btn"]')
        .click()
        .then(() => {
          const config = getConfiguration();
          expect(
            config.customThemes["_custom-test"].gameEntriesAlternateRowColor,
          ).to.equal("#F0F0F0");
        });
    });

    it("game name link hover color", () => {
      // make the change
      cy.get('[data-cy="game-name-link-hover-color"]')
        .invoke("val", "#F0F0F0")
        .click()
        .parent()
        .click();
      cy.get('[data-cy="revert-changes-btn"]')
        .should("exist")
        .should("not.have.attr", "disabled", "disabled");
      cy.get('[data-cy="save-changes-btn"]')
        .should("exist")
        .should("not.have.attr", "disabled", "disabled");
      // revert the change
      cy.get('[data-cy="game-name-link-hover-color"]')
        .invoke("val", "#FFFFFF")
        .click()
        .parent()
        .click();
      cy.get('[data-cy="revert-changes-btn"]').should("not.exist");
      cy.get('[data-cy="save-changes-btn"]').should("not.exist");
      // test saving the change
      cy.get('[data-cy="game-name-link-hover-color"]')
        .invoke("val", "#F0F0F0")
        .click()
        .parent()
        .click();
      cy.get('[data-cy="save-changes-btn"]')
        .click()
        .then(() => {
          const config = getConfiguration();
          expect(
            config.customThemes["_custom-test"].gameNameLinkHoverColor,
          ).to.equal("#F0F0F0");
        });
    });

    it("game name link hover color", () => {
      // make the change
      cy.get('[data-cy="game-entry-link-hover-color"]')
        .invoke("val", "#F0F0F0")
        .click()
        .parent()
        .click();
      cy.get('[data-cy="revert-changes-btn"]')
        .should("exist")
        .should("not.have.attr", "disabled", "disabled");
      cy.get('[data-cy="save-changes-btn"]')
        .should("exist")
        .should("not.have.attr", "disabled", "disabled");
      // revert the change
      cy.get('[data-cy="game-entry-link-hover-color"]')
        .invoke("val", "#FFFFFF")
        .click()
        .parent()
        .click();
      cy.get('[data-cy="revert-changes-btn"]').should("not.exist");
      cy.get('[data-cy="save-changes-btn"]').should("not.exist");
      // test saving the change
      cy.get('[data-cy="game-entry-link-hover-color"]')
        .invoke("val", "#F0F0F0")
        .click()
        .parent()
        .click();
      cy.get('[data-cy="save-changes-btn"]')
        .click()
        .then(() => {
          const config = getConfiguration();
          expect(
            config.customThemes["_custom-test"].gameEntryLinkHoverColor,
          ).to.equal("#F0F0F0");
        });
    });

    it("game name font color", () => {
      // make the change
      cy.get('[data-cy="game-name-font-color"]')
        .invoke("val", "#F0F0F0")
        .click()
        .parent()
        .click();
      cy.get('[data-cy="revert-changes-btn"]')
        .should("exist")
        .should("not.have.attr", "disabled", "disabled");
      cy.get('[data-cy="save-changes-btn"]')
        .should("exist")
        .should("not.have.attr", "disabled", "disabled");
      // revert the change
      cy.get('[data-cy="game-name-font-color"]')
        .invoke("val", "#FFFFFF")
        .click()
        .parent()
        .click();
      cy.get('[data-cy="revert-changes-btn"]').should("not.exist");
      cy.get('[data-cy="save-changes-btn"]').should("not.exist");
      // test saving the change
      cy.get('[data-cy="game-name-font-color"]')
        .invoke("val", "#F0F0F0")
        .click()
        .parent()
        .click();
      cy.get('[data-cy="save-changes-btn"]')
        .click()
        .then(() => {
          const config = getConfiguration();
          expect(
            config.customThemes["_custom-test"].gameNameFontColor,
          ).to.equal("#F0F0F0");
        });
    });

    it("game name subheader font color", () => {
      // make the change
      cy.get('[data-cy="game-name-subheader-font-color"]')
        .invoke("val", "#F0F0F0")
        .click()
        .parent()
        .click();
      cy.get('[data-cy="revert-changes-btn"]')
        .should("exist")
        .should("not.have.attr", "disabled", "disabled");
      cy.get('[data-cy="save-changes-btn"]')
        .should("exist")
        .should("not.have.attr", "disabled", "disabled");
      // revert the change
      cy.get('[data-cy="game-name-subheader-font-color"]')
        .invoke("val", "#FFFFFF")
        .click()
        .parent()
        .click();
      cy.get('[data-cy="revert-changes-btn"]').should("not.exist");
      cy.get('[data-cy="save-changes-btn"]').should("not.exist");
      // test saving the change
      cy.get('[data-cy="game-name-subheader-font-color"]')
        .invoke("val", "#F0F0F0")
        .click()
        .parent()
        .click();
      cy.get('[data-cy="save-changes-btn"]')
        .click()
        .then(() => {
          const config = getConfiguration();
          expect(
            config.customThemes["_custom-test"].gameNameSubheaderFontColor,
          ).to.equal("#F0F0F0");
        });
    });

    it("game entry font color", () => {
      // make the change
      cy.get('[data-cy="game-entry-font-color"]')
        .invoke("val", "#F0F0F0")
        .click()
        .parent()
        .click();
      cy.get('[data-cy="revert-changes-btn"]')
        .should("exist")
        .should("not.have.attr", "disabled", "disabled");
      cy.get('[data-cy="save-changes-btn"]')
        .should("exist")
        .should("not.have.attr", "disabled", "disabled");
      // revert the change
      cy.get('[data-cy="game-entry-font-color"]')
        .invoke("val", "#FFFFFF")
        .click()
        .parent()
        .click();
      cy.get('[data-cy="revert-changes-btn"]').should("not.exist");
      cy.get('[data-cy="save-changes-btn"]').should("not.exist");
      // test saving the change
      cy.get('[data-cy="game-entry-font-color"]')
        .invoke("val", "#F0F0F0")
        .click()
        .parent()
        .click();
      cy.get('[data-cy="save-changes-btn"]')
        .click()
        .then(() => {
          const config = getConfiguration();
          expect(
            config.customThemes["_custom-test"].gameEntryFontColor,
          ).to.equal("#F0F0F0");
        });
    });

    it("game entry time font color", () => {
      // make the change
      cy.get('[data-cy="game-entry-time-font-color"]')
        .invoke("val", "#F0F0F0")
        .click()
        .parent()
        .click();
      cy.get('[data-cy="revert-changes-btn"]')
        .should("exist")
        .should("not.have.attr", "disabled", "disabled");
      cy.get('[data-cy="save-changes-btn"]')
        .should("exist")
        .should("not.have.attr", "disabled", "disabled");
      // revert the change
      cy.get('[data-cy="game-entry-time-font-color"]')
        .invoke("val", "#FFFFFF")
        .click()
        .parent()
        .click();
      cy.get('[data-cy="revert-changes-btn"]').should("not.exist");
      cy.get('[data-cy="save-changes-btn"]').should("not.exist");
      // test saving the change
      cy.get('[data-cy="game-entry-time-font-color"]')
        .invoke("val", "#F0F0F0")
        .click()
        .parent()
        .click();
      cy.get('[data-cy="save-changes-btn"]')
        .click()
        .then(() => {
          const config = getConfiguration();
          expect(
            config.customThemes["_custom-test"].gameEntryTimeFontColor,
          ).to.equal("#F0F0F0");
        });
    });
  });
});
