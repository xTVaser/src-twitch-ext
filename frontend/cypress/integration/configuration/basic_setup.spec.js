var expectations = {
  panelTitle: "Test Title",
  srcName: "xTVaser",
  games: []
};

// TODO - add a polyfill for fetch to our client-side code
// and simplify this - https://github.com/cypress-io/cypress-example-recipes/tree/master/examples/stubbing-spying__window-fetch#readme
// Though, cypress should be coming out with fetch support soon as well
// - https://github.com/cypress-io/cypress/issues/95#issuecomment-637567912

describe('Basic Panel Setup', () => {
  describe('New User', () => {
    beforeEach('Setup Routes', () => {
      const polyfillUrl = 'https://unpkg.com/unfetch/dist/unfetch.umd.js'
      let polyfill

      cy.request(polyfillUrl)
        .then((response) => {
          polyfill = response.body
        })

      cy.server();
      Cypress.on('window:before:load', (win) => {
        delete win.fetch
        // since the application code does not ship with a polyfill
        // load a polyfilled "fetch" from the test
        win.eval(polyfill)
        win.fetch = win.unfetch
      })

      // TODO - current server doesnt return a 404 when it should
      cy.route({ method: 'POST', url: 'https://extension.xtvaser.xyz/fetch', status: 404, response: {} }).as('getNewUserData');
      cy.route('GET', `https://www.speedrun.com/api/v1/users?lookup=${expectations.srcName}`, 'fixture:speedruncom/users/xtvaser.json').as('getSrcUser');
      // TODO - I need to create a piece of fixture data that has all the types of runs / categories / etc
      cy.route('GET', `https://www.speedrun.com/api/v1/users/e8envo80/personal-bests?embed=game,category.variables,level.variables`, 'fixture:speedruncom/personal-bests/xtvaser.json').as('getSrcUserPersonalBests');
      cy.route('POST', 'https://extension.xtvaser.xyz/save', 'fixture:backend/save/success.json').as('saveUserData');
    })

    it('Configuration Page Loads', () => {
      cy.visit('/config');
      cy.wait('@getNewUserData')
      // cy.get('#backendMessage').contains('Config Message - Test');
    });

    it('Modify Panel Title', () => {
      cy.get('[data-test=panelTitle]').type(expectations.panelTitle).should('have.value', expectations.panelTitle);
    });

    it('Verify Speedrun.com name', () => {
      cy.get('[data-test=srcName]').type(expectations.srcName).should('have.value', expectations.srcName);
    })

    it('Search for Games', () => {
      cy.get('[data-test=saveBtn]').should('be.disabled');
      cy.get('[data-test=saveBtn]').should('have.class', 'btn-warning');
      cy.get('[data-test=searchBtn]').click();
      cy.wait('@getSrcUser');
      cy.wait('@getSrcUserPersonalBests');
      // TODO - check that populates games are what we expect from fixture data
    });

    it('Attempt to Save', () => {
      cy.get('.gameTitleBox');
      cy.get('[data-test=saveBtn]').should('be.enabled').click();
      cy.get('[data-test=errorDialog] > .config').contains("SUCCESS: Saved Successfully!");
    });
  });
  describe('New User - Reload After Save', () => {
    beforeEach('Setup Routes', () => {
      const polyfillUrl = 'https://unpkg.com/unfetch/dist/unfetch.umd.js'
      let polyfill

      cy.request(polyfillUrl)
        .then((response) => {
          polyfill = response.body
        })

      cy.server();
      Cypress.on('window:before:load', (win) => {
        delete win.fetch
        // since the application code does not ship with a polyfill
        // load a polyfilled "fetch" from the test
        win.eval(polyfill)
        win.fetch = win.unfetch
      })

      cy.route('POST', 'https://extension.xtvaser.xyz/fetch', 'fixture:backend/fetch/new_user.json').as('getNewUserData');
    })

    it('Reload Page', () => {
      cy.visit('/config');
      cy.wait('@getNewUserData')
      // cy.get('#backendMessage').contains('Config Message - Test');
    });

    it('Check Non-Game Configuration', () => {
      cy.get('[data-test=panelTitle]').should('have.value', expectations.panelTitle);
      cy.get('[data-test=srcName]').should('have.value', expectations.srcName);
      cy.get('#backendMessage').contains('Test - Config Message');
    });

    it('Check Populated Games', () => {
      // TODO
    });

    // TODO - check populated settings
  });
});
