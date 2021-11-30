// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add("login", (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add("drag", { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add("dismiss", { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite("visit", (originalFn, url, options) => { ... })

Cypress.Commands.add('createUserAndLogin', (username, email, password) => {
  const query = `mutation {
    register(
      username:"${username}",
      email:"${email}",
      password:"${password}"
    ) {
      accessToken,
      refreshToken
    }
  }`

  cy.request({
    method: 'post',
    url: Cypress.env('GRAPHQL_URI'),
    body: { query },
    failOnStatusCode: false
  }).then((res) => {
    cy.log(res);
    localStorage.setItem('amandus-user-access-token', res.body.data.register.accessToken)
    localStorage.setItem('amandus-user-refresh-token', res.body.data.register.accessToken)
  })
})

Cypress.Commands.add('resetUsers', () => {
  cy.request('POST', `${Cypress.env('BACKEND_URI')}/reset`)
})

Cypress.Commands.add('resetTokens', () => {
  cy.request('POST', `${Cypress.env('TOKENSERVICE_URI')}/reset`)
})

Cypress.Commands.add('resetRepoState', () => {
  const query = `mutation {
    resetLocalChanges(url: "https://github.com/testuser/e2etest.git") 
  }`

  cy.request({
    method: 'post',
    url: Cypress.env('GRAPHQL_URI'),
    body: { query },
    headers: {
      'Access-Control-Expose-Headers': 'x-access-token,x-refresh-token',
      'x-access-token': localStorage.getItem('amandus-user-access-token'),
      'x-refresh-token': localStorage.getItem('amandus-user-refresh-token'),
    },
    failOnStatusCode: false,
  }).then((res) => {
    cy.log(res)
  })

  cy.wait(1000)
})

Cypress.Commands.add('connectWith', (service) => {
  let callbackUrl
  switch (service) {
    case 'github':
      callbackUrl = '/auth/github/callback?code=asdasdasd'
      break
    case 'gitlab':
      callbackUrl = '/auth/gitlab/callback?code=asdasdasd'
      break
    case 'bitbucket':
      callbackUrl = '/auth/bitbucket/callback?code=asdasdasd'
      break;
    default:
      throw new Error(`no such service: ${service}`)
  }

  cy.visit(Cypress.env('HOST') + callbackUrl)
  cy.url().should('contain', '/connections')
})

Cypress.Commands.add('clickFileDrawerOn', (itemName) => {
  cy.get('.MuiTreeItem-content').contains(itemName).click().wait(200)
})

Cypress.Commands.add('typeTextToEditor', (text) => {
  cy.get('.monaco-editor textarea').focus().type(text)
  cy.wait(1000)
})

Cypress.Commands.add('editorShouldContainLine', (text) => {
  // we have to replace spaces because monaco editor
  const temp = text.replaceAll(' ', '\u00a0')
  cy.get('.view-line').should('contain', temp)
})
Cypress.Commands.add('editorShouldNotContainLine', (text) => {
  const temp = text.replaceAll(' ', '\u00a0')
  cy.get('.view-line').should('not.contain', temp)
})

Cypress.Commands.add('clickSaveButton', () => {
  cy.get('[data-cy=saveButton]').click()
  cy.get('.MuiDialog-paper')
    .should('be.visible')
    .should('contain', 'Save changes')
})

Cypress.Commands.add('clickResetFileButton', () => {
  cy.get('[data-cy=resetFileButton').click()
  cy.wait(1000)
})

Cypress.Commands.add('clickResetRepoButton', () => {
  cy.get('[data-cy=resetRepoButton').click()
  cy.wait(1000)
})

Cypress.Commands.add('interceptGetRepoListFromService', () => {
  cy.intercept('POST', Cypress.env('GRAPHQL_URI'), (req) => {
    if (req.body.operationName === 'getRepoListFromService') {
      req.reply({
        body: {
          data: {
            getRepoListFromService: [
              {
                id: 1,
                name: 'e2etestrepo',
                full_name: 'testuser/e2etestrepo',
                clone_url: 'https://github.com/testuser/e2etest.git',
                html_url: 'https://github.com/testuser/e2etest',
                service: 'github',
              },
            ],
          },
        },
      })
    }
  })
})

Cypress.Commands.add('interceptCloneRepo', () => {
  cy.intercept('POST', Cypress.env('GRAPHQL_URI'), (req) => {
    if (req.body.operationName === 'cloneRepo') {
      req.reply({
        body: {
          data: {
            cloneRepository: 'Cloned',
          },
        },
      })
    }
  })
})

Cypress.Commands.add('openRepositoryToEditor', () => {
  cy.interceptGetRepoListFromService()
  cy.interceptCloneRepo()

  cy.visit(Cypress.env('HOST') + '/repositories')
  cy.get('.MuiListItem-root').contains('edit').click()
  cy.wait(1000)
})

Cypress.Commands.add('openReadmeToEditor', () => {
  cy.get('.MuiTreeItem-content').should('contain', 'testuser')
  cy.clickFileDrawerOn('testuser')
  cy.clickFileDrawerOn('e2e')
  cy.clickFileDrawerOn('README.md')
  cy.url().should('contain', 'testuser/github/testuser/e2etest/README.md')
  cy.get('.monaco-editor')
})
