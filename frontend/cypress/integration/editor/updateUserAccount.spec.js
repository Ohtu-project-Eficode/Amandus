import { v4 as uuid } from 'uuid'

describe('When deleting user', () => {
  beforeEach(() => {
    cy.resetUsers()
    cy.resetTokens()
    cy.createUserAndLogin('testuser', 'testuser@testus.er', 'Testi123!')
  })

  it('I can delete my user account', () => {
    cy.visit(Cypress.env('HOST'))

    cy.contains(`Manage Account`).click()

    cy.wait(1000)
    cy.get(`#delete-button`).click()    
    cy.wait(1000)
    cy.contains('Cancel')
    cy.get('#submit-button').click()

    cy.wait(1000)

    cy.contains(`Register`)
    cy.contains(`Login`)
  })

  it('I can update my username', () => {
    const newUsername = 'newTestUser'
    cy.visit(Cypress.env('HOST') + '/accountSettings')
    cy.contains('Update credentials for user: testuser')
    cy.get('#username').type(newUsername)

    cy.get('#update-button').contains('Update').click()
    cy.wait(1000)

    cy.contains(`Hello, ${newUsername}`)
    cy.contains(`Update credentials for user: ${newUsername}`)
  })
})
