import { genSalt, hash } from 'bcryptjs';

export async function genSaltedHash(data: string): Promise<string> {
	const salt = await genSalt(10);
	const hashedString = await hash(data, salt);
	return (hashedString)
}