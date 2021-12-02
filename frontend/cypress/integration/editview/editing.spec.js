describe('In editor', () => {
  beforeEach(() => {
    cy.resetUsers()
    cy.resetTokens()
    cy.createUserAndLogin('testuser', 'testuser@testus.er', 'Testi123!')
    cy.resetRepoState()
    cy.openRepositoryToEditor()
    cy.openReadmeToEditor()
  })

  describe('When modifying a file', () => {
    it('I can add text to file', () => {
      cy.typeTextToEditor('{pagedown}{enter}lorem ipsum')
      cy.editorShouldContainLine('lorem ipsum')
    })

    it('I should see autosave icon and file should indicate it has been edited', () => {
      cy.typeTextToEditor('{pagedown}{enter}dolor sit amet')

      cy.get('[data-cy=autosaveIndicator]')
        .should('be.visible')
        .should('contain', 'Saving...')

      cy.get('.MuiTreeItem-content')
        .contains('README.md')
        .should('have.css', 'color', 'rgb(98, 0, 238)')
    })

    it('I can reset content of single file', () => {
      cy.typeTextToEditor('{pagedown}{enter}Vestibulum commodo')
      cy.editorShouldContainLine('Vestibulum commodo')
      cy.get('.MuiTreeItem-content')
        .contains('README.md')
        .should('have.css', 'color', 'rgb(98, 0, 238)')

      cy.clickResetFileButton()

      cy.editorShouldNotContainLine('Vestibulum commodo')
      cy.get('.MuiTreeItem-content')
        .contains('README.md')
        .should('not.have.css', 'color', 'rgb(98, 0, 238)')
    })

    it('I can reset contents of all modified files', () => {
      cy.typeTextToEditor('{pagedown}{enter}lorem ipsum')
      cy.clickFileDrawerOn('robots')
      cy.clickFileDrawerOn('resource.robot')
      cy.typeTextToEditor('{pagedown}{enter}Beep boop')

      cy.get('.MuiTreeItem-content')
        .contains('README.md')
        .should('have.css', 'color', 'rgb(98, 0, 238)')
      cy.get('.MuiTreeItem-content')
        .contains('resource.robot')
        .should('have.css', 'color', 'rgb(98, 0, 238)')

      cy.clickResetRepoButton()

      cy.editorShouldNotContainLine('Beep boop')
      cy.get('.MuiTreeItem-content')
        .contains('README.md')
        .should('not.have.css', 'color', 'rgb(98, 0, 238)')
      cy.get('.MuiTreeItem-content')
        .contains('resource.robot')
        .should('not.have.css', 'color', 'rgb(98, 0, 238)')
    })
  })

  describe('When saving a file', () => {
    it('Clicking `Save` opens a commit dialog', () => {
      cy.clickSaveButton()
    })

    it('I can enter new branch name', () => {
      cy.clickSaveButton()
      cy.get('[data-cy=newBranchSelector]').click()
      cy.get('[data-cy=branchNameInput]').type('My new branch')
    })

    it('Modified file should appear in file selection', () => {
      cy.typeTextToEditor('{pagedown}{enter}Morbi vel aliquet leo')
      cy.get('[data-cy=autosaveIndicator]').should('not.exist')
      cy.clickSaveButton()

      cy.get('[data-cy=fileSelector]').should('contain', 'README.md')
    })

    it('Multiple modified files should appear in file selection', () => {
      cy.typeTextToEditor('{pagedown}{enter}Mauris ut urna')
      cy.clickFileDrawerOn('robots')
      cy.clickFileDrawerOn('resource.robot')
      cy.typeTextToEditor('{pagedown}{enter}Beep boop')
      cy.get('[data-cy=autosaveIndicator]').should('not.exist')
      cy.clickSaveButton()

      cy.get('[data-cy=fileSelector]')
        .contains('README.md')
        .find('[data-cy=fileSelectionCheckbox]')
        .find('[type=checkbox]')
        .should('be.checked')

      cy.get('[data-cy=fileSelector]')
        .contains('resource.robot')
        .find('[data-cy=fileSelectionCheckbox]')
        .find('[type=checkbox]')
        .should('be.checked')

      cy.get('[data-cy=fileSelector]').should(
        'not.contain',
        'example-loop.robot'
      )
    })

    it('I can deselect file from commit', () => {
      cy.typeTextToEditor('{pagedown}{enter}Nulla lobortis massa lorem')
      cy.clickFileDrawerOn('robots')
      cy.clickFileDrawerOn('resource.robot')
      cy.typeTextToEditor('{pagedown}{enter}Boop beep')
      cy.get('[data-cy=autosaveIndicator]').should('not.exist')
      cy.clickSaveButton()

      cy.get('[data-cy=fileSelector]')
        .should('contain', 'README.md')
        .should('contain', 'resource.robot')

      cy.get('[data-cy=fileSelector]')
        .contains('resource.robot')
        .find('[data-cy=fileSelectionCheckbox]')
        .find('[type=checkbox]')
        .uncheck()
    })
  })
})
