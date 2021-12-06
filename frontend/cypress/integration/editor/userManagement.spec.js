import { v4 as uuid } from 'uuid'
describe('When visiting the user management page, as an admin user', () => {
  beforeEach(() => {
    cy.resetUsers()
    cy.createUserAndLogin('normalusertestman', 'just@regular.mf', 'Testi123!', false)
    cy.createAdmin('admintestman', 'admin@dilledong.com', 'Testi123!')
    cy.login('admintestman', 'Testi123!')
    cy.visit(Cypress.env('HOST') + '/users')
  })

  it('I can delete other user', () => {
    cy.get('[value="normalusertestman"]').parent()
      .within(() => {
        cy.get('[title="Delete"]').click()
      })

    cy.get('[title="Save"]').click()

    cy.reload()
    cy.contains('normalusertestman').should('not.exist')
  })

  it('I can change email address of other user', () => {
    cy.get('[value="normalusertestman"]').parent()
      .within(() => {
        cy.get('[title="Edit"]').click()
      })

    cy.get('[value="normalusertestman"]').parent()
      .within(() => {
        cy.get('[class="MuiInputBase-input MuiInput-input"]')
          .clear()
          .type('newaddress@joujou.jou')
      })

    cy.get('[title="Save"]').click()

    cy.reload()
    cy.contains('newaddress@joujou.jou')
    cy.contains('just@regular.mf').should('not.exist')
  })

  it('I can change admin status of other user', () => {
    cy.get('[value="normalusertestman"]').parent()
      .within(() => {
        cy.get('[title="Edit"]').click()
      })

    cy.get('[value="normalusertestman"]').parent()
      .within(() => {
        cy.get('[type="checkbox"]').click()
      })

    cy.get('[title="Save"]').click()

    cy.login('normalusertestman', 'Testi123!')
    cy.visit(Cypress.env('HOST'))
    cy.contains('Hello, normalusertestman')
    cy.contains('(ADMIN)')
  })
})
