describe('When visiting the settings page, as an admin', () => {
    beforeEach(() => {
      cy.deleteUser('testuser')
      cy.login('testuser', 'testuser@testus.er', 'Testi123!')
      cy.visit(Cypress.env('HOST'))
    })
  
    it('I can move to settings page', () => {
      cy.contains('Settings').click()
      cy.url().should('include', '/settings')
      cy.contains('Admins only.')
    })


})