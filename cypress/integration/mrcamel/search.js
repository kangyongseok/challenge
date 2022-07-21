context('Actions', () => {
  beforeEach(() => {
    cy.visit('/search')
    cy.intercept('GET', `${Cypress.env().api}/products/keywords/*`, {fixture : 'keywordsSearch.json'}).as('getItems')
  })
  it('.change()', () => {
    cy.get('input').eq(0)
      .should('have.attr', 'placeholder', '샤넬 클미, 나이키 범고래, 스톤 맨투맨').type('아디다스')
      .should('have.value', '아디다스')
    
    cy.get('li').eq(1).should('have.attr', 'data-keyword', '아디다스 스니커즈')
    cy.get('svg').eq(1).click({force: true})
    cy.get('input').eq(0).should('have.value', '')
  })
})