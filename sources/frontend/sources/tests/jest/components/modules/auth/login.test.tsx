import React from 'react';
import Login from "../../../../../src/components/modules/auth/Login";
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom'

describe("Login component", () => {
	
	it("renders the login form", () => {
		render(<Login />); 
		const loginInput = screen.getByLabelText("Email");
		const passwordInput = screen.getByLabelText("Password");
		const submitButton = screen.getByRole("button", {name: "Login"});

		expect(loginInput).toBeInTheDocument();
		expect(passwordInput).toBeInTheDocument();
		expect(submitButton).toBeInTheDocument();
	});

	// Test on form submit
	// Display alert on error
	// Redirect on success
});