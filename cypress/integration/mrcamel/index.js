describe('test demo', () => {
  context('context', () => {
    it('it', () => {
      cy.visit('localhost:3000')
      .get('input')
      .type('아디다스')
      .type('{enter}')
    })
  })
})