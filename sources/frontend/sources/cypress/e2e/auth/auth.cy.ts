/// <reference types="cypress" />

const user = {
	login: Cypress.env("USER_TEST_LOGIN"),
	password: Cypress.env("USER_TEST_PASSWORD")
}

describe("Authentication (e2e)", () => {
	beforeEach(() => {
		cy.visit(Cypress.env("SITE_URL")+"/pong")
		console.log("env", Cypress.env())
	})

	it("should login User with credentials #2", () => {
		cy.get(`[type="email"]`)
			.type(user.login)
			//.should("have.text", user.login);

		cy.get(`[type="password"]`)
			.type(user.password)
			//.should("have.text", user.password);

		cy.get(`[type="submit"]`)
			.click();
	});

	it("should redirect on /pong", () => {
		cy.url().should('include', Cypress.env("SITE_URL")+"/pong")
	})
})
