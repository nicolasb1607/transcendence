import {
	validateEmail,
	validatePassword,
	validatePasswordConfirm,
	validateName,
} from "../../../../../src/components/modules/auth/assertFields";

describe("Form Validation", () => {
	describe("Email validation", () => {
		it('returns valid when email is valid', () => {
			const result = validateEmail('test@example.com');
			expect(result.valid).toBe(true);
		});
		it('returns error when email is too long', () => {
			const result = validateEmail(
				'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa@gmail.com'
			);
			expect(result.valid).toBe(false);
			expect(result.error).toBe(
				'Your email address must be less than 255 characters long'
			);
		});
		it('returns error when email is invalid', () => {
			const result = validateEmail('test');
			expect(result.valid).toBe(false);
			expect(result.error).toBe('Your email address must contain an \'@\' symbol');
		});
	});

	describe('validatePassword', () => {
		it('returns valid when password is valid', () => {
			const result = validatePassword('Password123!');
			expect(result.valid).toBe(true);
		});
		it('returns error when password is too short', () => {
			const result = validatePassword('P1!a');
			expect(result.valid).toBe(false);
			expect(result.error).toBe(
				'Your password must be at least 12 characters long'
			);
		});
		it('returns error when password is too long', () => {
			const result = validatePassword(
				'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaP1!aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa'
			);
			expect(result.valid).toBe(false);
			expect(result.error).toBe(
				'Your password must be less than 70 characters long'
			);
		});
		it('returns error when password does not contain uppercase letter', () => {
			const result = validatePassword('password123!');
			expect(result.valid).toBe(false);
			expect(result.error).toBe(
				'Your password must contain at least one uppercase letter'
			);
		});
		it('returns error when password does not contain lowercase letter', () => {
			const result = validatePassword('PASSWORD123!');
			expect(result.valid).toBe(false);
			expect(result.error).toBe(
				'Your password must contain at least one lowercase letter'
			);
		});
	});

	describe('validatePasswordConfirm', () => {
		it('returns valid when password and passwordConfirm match', () => {
			const values = new FormData();
			values.append('password', 'Password123!');
			const result = validatePasswordConfirm('Password123!', values);
			expect(result.valid).toBe(true);
		});
		it('returns error when password and passwordConfirm do not match', () => {
			const values = new FormData();
			values.append('password', 'Password123!');
			const result = validatePasswordConfirm('Password1234!', values);
			expect(result.valid).toBe(false);
			expect(result.error).toBe('Your passwords do not match');
		});
	});

	describe('validateName', () => {
		it('returns valid when name is valid', () => {
			const result = validateName('John_Cash');
			expect(result.valid).toBe(true);
		});
		it('returns error when name is too short', () => {
			const result = validateName('J');
			expect(result.valid).toBe(false);
			expect(result.error).toBe(
				'Your name must be at least 3 characters long'
			);
		});
		it('returns error when name is not valid', () => {
			const result = validateName('Xx Gamer Boi xX');
			expect(result.valid).toBe(false);
			expect(result.error).toBe('Your name can only contain letters, numbers, \'-\', and \'_\'');
		});
	});
});