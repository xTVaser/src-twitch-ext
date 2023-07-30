/// <reference types="cypress" />

describe('no existing config', () => {
  beforeEach(() => {
    cy.intercept('GET', 'https://www.speedrun.com/api/**', { fixture: 'src-basic-personal-bests' });
  });

  describe('initial state', () => {
    beforeEach(() => {
      cy.visit('https://localhost:5173/config/#/themes')
    });
    it('has the default themes', () => {
      cy.get('[data-cy="theme-selector"]');
      cy.get('[data-cy="theme-selector"]').click();
      cy.get('[data-cy="theme-selector"]').find('sl-menu-item').should('have.length', 1);
      cy.get('[data-cy="theme-selector"]').find('sl-menu-item').contains("Default Dark").click();
    });

    it('new theme entry is blank', () => {
      cy.get('[data-cy="new-theme-input"]').should('have.value', '');
      cy.get('[data-cy="create-theme-btn"]').should('have.attr', 'disabled', 'disabled');
    });

    it('buttons are not visible', () => {
      cy.get('[data-cy="delete-theme-btn"]').should('not.exist');
      cy.get('[data-cy="revert-changes-btn"]').should('not.exist');
      cy.get('[data-cy="save-changes-btn"]').should('not.exist');
    });
  });

  describe('create new theme', () => {
    beforeEach(() => {
      cy.visit('https://localhost:5173/config/#/themes')
      // Create a theme
      cy.get('[data-cy="new-theme-input"]').shadow().find("input").type("Test Theme");
      cy.get('[data-cy="create-theme-btn"]').should('not.have.attr', 'disabled', 'disabled').click();
      cy.get('[data-cy="theme-selector"]').contains("Test Theme");
      cy.get('[data-cy="new-theme-input"]').should('have.value', '');
      cy.get('[data-cy="create-theme-btn"]').should('have.attr', 'disabled', 'disabled');
      // Save it
      cy.get('[data-cy="save-changes-btn"]').should('exist').should('not.have.attr', 'disabled', 'disabled').click();
      cy.contains("sl-alert", "New Theme Created!");
    });

    it('theme management buttons exist and are enabled', () => {
      cy.get('[data-cy="delete-theme-btn"]').should('exist').should('not.have.attr', 'disabled', 'disabled');
      cy.get('[data-cy="revert-changes-btn"]').should('not.exist');
      cy.get('[data-cy="save-changes-btn"]').should('not.exist');
    });
  });

  describe('modify theme settings', () => {
    beforeEach(() => {
      cy.fixture('config-with-games.json').then((value) => {
        localStorage.setItem('src-twitch-ext', JSON.stringify(value));
      });
      cy.visit('https://localhost:5173/config/#/themes');
    });

    it('validate button states', () => {
      cy.get('[data-cy="create-theme-btn"]').should('exist').should('have.attr', 'disabled', 'disabled');
      cy.get('[data-cy="delete-theme-btn"]').should('exist').should('not.have.attr', 'disabled', 'disabled');
      cy.get('[data-cy="revert-changes-btn"]').should('not.exist');
      cy.get('[data-cy="save-changes-btn"]').should('not.exist');
    });

    it('hide expand icon', () => {
      cy.get('[data-cy="extension-panel"]').find('sl-details').shadow().find('[name="chevron-right"]');
      // make the change
      cy.get('[data-cy="hide-expand-icon-switch"]').click();
      cy.get('[data-cy="revert-changes-btn"]').should('exist').should('not.have.attr', 'disabled', 'disabled');
      cy.get('[data-cy="save-changes-btn"]').should('exist').should('not.have.attr', 'disabled', 'disabled');
      cy.get('[data-cy="extension-panel"]').find('sl-details').shadow().find('[name="chevron-right"]').should('not.be.visible');
      // revert the change
      cy.get('[data-cy="hide-expand-icon-switch"]').click();
      cy.get('[data-cy="revert-changes-btn"]').should('not.exist');
      cy.get('[data-cy="save-changes-btn"]').should('not.exist');
      // test saving the change
      cy.get('[data-cy="hide-expand-icon-switch"]').click();
      cy.get('[data-cy="save-changes-btn"]').click().then(() => {
        const config = JSON.parse(JSON.parse(localStorage.getItem('src-twitch-ext')).broadcaster.content);
        expect(config.customThemes["_custom-test"].hideExpandIcon).to.equal(true);
      });
    });

    it('rainbow world record', () => {
      cy.get('[data-cy="extension-panel"]').find('.rainbow-cycle').should('have.length', 0);
      // make the change
      cy.get('[data-cy="rainbow-world-record-switch"]').click();
      cy.get('[data-cy="revert-changes-btn"]').should('exist').should('not.have.attr', 'disabled', 'disabled');
      cy.get('[data-cy="save-changes-btn"]').should('exist').should('not.have.attr', 'disabled', 'disabled');
      cy.get('[data-cy="extension-panel"]').find('.rainbow-cycle').should('have.length.at.least', 1);
      // revert the change
      cy.get('[data-cy="rainbow-world-record-switch"]').click();
      cy.get('[data-cy="revert-changes-btn"]').should('not.exist');
      cy.get('[data-cy="save-changes-btn"]').should('not.exist');
      // test saving the change
      cy.get('[data-cy="rainbow-world-record-switch"]').click();
      cy.get('[data-cy="save-changes-btn"]').click().then(() => {
        const config = JSON.parse(JSON.parse(localStorage.getItem('src-twitch-ext')).broadcaster.content);
        expect(config.customThemes["_custom-test"].showRainbowWorldRecord).to.equal(true);
      });
    });
  });
});
