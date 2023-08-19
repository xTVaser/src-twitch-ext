/// <reference types="cypress" />

// describe("no stored configuration", () => {
//   beforeEach(() => {
//     cy.intercept("GET", "https://www.speedrun.com/api/**", {
//       fixture: "src-basic-personal-bests",
//     });
//   });

//   describe("loads empty panel", () => {
//     beforeEach(() => {
//       cy.visit("https://localhost:5173/viewer/");
//     });

//     it("displays no configuration found", () => {
//       cy.get('[data-cy="panel-nothing-to-load"]');
//     });
//   });
// });

// describe("invalid configuration", () => {
//   beforeEach(() => {
//     cy.intercept("GET", "https://www.speedrun.com/api/**", {
//       fixture: "src-basic-personal-bests",
//     });
//     cy.fixture("viewer/invalid-config.json").then((value) => {
//       localStorage.setItem("src-twitch-ext", JSON.stringify(value));
//     });
//   });

//   describe("loads empty panel", () => {
//     beforeEach(() => {
//       cy.visit("https://localhost:5173/viewer/");
//     });

//     it("explains sr.com outage", () => {
//       cy.get('[data-cy="panel-bad-config"]');
//     });
//   });
// });

// describe("speedrun.com outage", () => {
//   beforeEach(() => {
//     cy.intercept("GET", "https://www.speedrun.com/api/**", {
//       statusCode: 500,
//       body: {},
//     });
//     cy.fixture("viewer/basic-config.json").then((value) => {
//       localStorage.setItem("src-twitch-ext", JSON.stringify(value));
//     });
//   });

//   describe("loads empty panel", () => {
//     beforeEach(() => {
//       cy.visit("https://localhost:5173/viewer/");
//     });

//     it("explains sr.com outage", () => {
//       cy.get('[data-cy="panel-speedruncom-outage"]');
//     });
//   });
// });

// describe("stored configuration - basic panel", () => {
//   beforeEach(() => {
//     cy.intercept("GET", "https://www.speedrun.com/api/**", {
//       fixture: "src-basic-personal-bests",
//     });
//     cy.fixture("viewer/basic-config.json").then((value) => {
//       localStorage.setItem("src-twitch-ext", JSON.stringify(value));
//     });
//     cy.visit("https://localhost:5173/viewer/");
//   });

//   describe("panel has 3 games", () => {
//     it("game covers are rendered", () => {
//       cy.root().find('[data-cy="panel-game-cover"]').should("have.length", 3);
//     });

//     it("game names are rendered", () => {
//       cy.root().find('[data-cy="panel-game-name"]').should("have.length", 3);
//     });

//     it("game entry counts are rendered", () => {
//       cy.root().find('[data-cy="panel-game-count"]').should("have.length", 3);
//     });

//     it("games can be expanded", () => {
//       cy.root().find('[data-cy="panel-game-entry"]').should("not.be.visible");
//       cy.get('[data-cy="panel-game-count"]').click({ multiple: true });
//       cy.root().find('[data-cy="panel-game-entry"]').should("be.visible");
//       cy.get('[data-cy="panel-game-count"]').click({ multiple: true });
//       cy.root().find('[data-cy="panel-game-entry"]').should("not.be.visible");
//     });
//   });
// });

// describe("stored configuration - game with no runs", () => {
//   beforeEach(() => {
//     cy.intercept("GET", "https://www.speedrun.com/api/**", {
//       fixture: "src-game-with-no-runs",
//     });
//     cy.fixture("viewer/basic-config.json").then((value) => {
//       localStorage.setItem("src-twitch-ext", JSON.stringify(value));
//     });
//     cy.visit("https://localhost:5173/viewer/");
//   });

//   describe("panel has 2 games", () => {
//     it("game covers are rendered", () => {
//       cy.root().find('[data-cy="panel-game-cover"]').should("have.length", 2);
//     });

//     it("game names are rendered", () => {
//       cy.root().find('[data-cy="panel-game-name"]').should("have.length", 2);
//     });

//     it("game entry counts are rendered", () => {
//       cy.root().find('[data-cy="panel-game-count"]').should("have.length", 2);
//     });

//     it("games can be expanded", () => {
//       cy.root().find('[data-cy="panel-game-entry"]').should("not.be.visible");
//       cy.get('[data-cy="panel-game-count"]').click({ multiple: true });
//       cy.root().find('[data-cy="panel-game-entry"]').should("be.visible");
//       cy.get('[data-cy="panel-game-count"]').click({ multiple: true });
//       cy.root().find('[data-cy="panel-game-entry"]').should("not.be.visible");
//     });
//   });
// });

// describe("stored configuration - check ordering", () => {
//   beforeEach(() => {
//     cy.intercept("GET", "https://www.speedrun.com/api/**", {
//       fixture: "src-basic-personal-bests.json",
//     });
//     cy.fixture("viewer/changed-order.json").then((value) => {
//       localStorage.setItem("src-twitch-ext", JSON.stringify(value));
//     });
//     cy.visit("https://localhost:5173/viewer/");
//   });

//   describe("panel has 3 games", () => {
//     it("game covers are rendered", () => {
//       cy.root().find('[data-cy="panel-game-cover"]').should("have.length", 3);
//     });

//     it("games are in the expected order", () => {
//       cy.root()
//         .find('[data-cy="panel-game-name"]')
//         .eq(0)
//         .should("contain", "Jak II");
//       cy.root()
//         .find('[data-cy="panel-game-name"]')
//         .eq(1)
//         .should("contain", "Jak and Daxter: Misc Category Extensions");
//       cy.root()
//         .find('[data-cy="panel-game-name"]')
//         .eq(2)
//         .should("contain", "Jak II Category Extension");
//     });
//   });
// });

// describe("stored configuration - custom titles", () => {
//   beforeEach(() => {
//     cy.intercept("GET", "https://www.speedrun.com/api/**", {
//       fixture: "src-basic-personal-bests.json",
//     });
//     cy.fixture("viewer/custom-titles.json").then((value) => {
//       localStorage.setItem("src-twitch-ext", JSON.stringify(value));
//     });
//     cy.visit("https://localhost:5173/viewer/");
//   });

//   describe("panel has 3 games", () => {
//     it("game covers are rendered", () => {
//       cy.root().find('[data-cy="panel-game-cover"]').should("have.length", 3);
//     });

//     it("entry titles can be customized", () => {
//       cy.root()
//         .find('[data-cy="panel-game-name"]')
//         .eq(0)
//         .should("contain", "Custom Game Title");
//       cy.root().find('[data-cy="panel-game-count"]').eq(0).click();
//       cy.root()
//         .find('[data-cy="panel-game-entry"]')
//         .eq(0)
//         .should("contain", "Custom Entry Title");
//     });
//   });
// });

// describe("stored configuration - disabled games and entries", () => {
//   beforeEach(() => {
//     cy.intercept("GET", "https://www.speedrun.com/api/**", {
//       fixture: "src-basic-personal-bests.json",
//     });
//     cy.fixture("viewer/disabled-games-and-entries.json").then((value) => {
//       localStorage.setItem("src-twitch-ext", JSON.stringify(value));
//     });
//     cy.visit("https://localhost:5173/viewer/");
//   });

//   describe("panel has 2 games", () => {
//     it("game covers are rendered", () => {
//       cy.root().find('[data-cy="panel-game-cover"]').should("have.length", 2);
//     });

//     it("entries can be disabled", () => {
//       cy.root()
//         .find('[data-cy="panel-game-count"]')
//         .eq(0)
//         .should("contain", "2 Runs")
//         .click();
//       cy.root()
//         .find('[data-cy="panel-game"]')
//         .eq(0)
//         .find('[data-cy="panel-game-entry"]')
//         .should("have.length", 2);
//     });
//   });
// });

// describe("stored configuration - extra game and categories", () => {
//   beforeEach(() => {
//     cy.intercept("GET", "https://www.speedrun.com/api/**", {
//       fixture: "src-extra-runs-personal-bests.json",
//     });
//     cy.fixture("viewer/basic-config.json").then((value) => {
//       localStorage.setItem("src-twitch-ext", JSON.stringify(value));
//     });
//     cy.visit("https://localhost:5173/viewer/");
//   });

//   describe("panel has 4 games", () => {
//     it("game covers are rendered", () => {
//       cy.root().find('[data-cy="panel-game-cover"]').should("have.length", 4);
//       cy.root().find('[data-cy="panel-game-count"]').eq(2).click();
//       cy.root()
//         .find('[data-cy="panel-game"]')
//         .eq(2)
//         .find('[data-cy="panel-game-entry"]')
//         .should("have.length", 4);
//       cy.root()
//         .find('[data-cy="panel-game"]')
//         .eq(2)
//         .find('[data-cy="panel-game-entry"]')
//         .eq(3)
//         .should("contain", "Fake New Category");
//     });
//   });
// });
