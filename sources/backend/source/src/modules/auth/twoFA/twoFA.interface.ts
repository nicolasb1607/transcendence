import type { User } from "@prisma/client";

export type TwoFAData = Pick<User, 'TwoFASecret'|'isTwoFAEnabled'>

export interface TwoFAResponse {
	success: boolean;
	message: string;
}