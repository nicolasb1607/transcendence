import { BadRequestException, Injectable, InternalServerErrorException, Logger } from "@nestjs/common";
import { WsException } from "@nestjs/websockets";
import { UserStatus } from "@prisma/client";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { UsersService } from "./users.service";
import { RelationsService } from "../relations/relations.service";
import { GameService } from "../game/service/game.service";
import type { Socket } from "socket.io";
import type { Challenge, ChallengeRequest, ChallengeUserData, UserDetails, userChallenge } from "./users.interface";
import type { ChallengeDTO } from "./users.dto";
import { UserUnavailableException } from "../../common/exceptions/userUnavailable.exception";

const CHALLENGE_EXPIRY_TIME = 5 * 60 * 1000;

/**
 * Manage user challenge
 * @emits challenge
 * @emits challenge.accept
 * @emits challenge.decline
 * @emits challenge.cancel
 * @event user.challenge.accept
 * @event user.challenge.cancel
 */
@Injectable()
export class UserChallengeService {

	private challenges = new Map<number, ChallengeRequest>();

	constructor(
		private readonly logger: Logger,
		private readonly relationsService: RelationsService,
		private readonly gameService: GameService,
		private readonly userService: UsersService,
		private readonly eventEmitter: EventEmitter2
	) {}

	/* ------------------ Challenge manipulation (private) ------------------ */

	private removeChallenge(challengerId: number): void {
		this.challenges.delete(challengerId);
	}

	/**
	 * Return challenge where user is challenged
	 */
	private getWhereChallenged(userId: number):ChallengeRequest|null {
		for (const challenge of this.challenges.values()) {
			if (challenge.challenged === userId) {
				return (challenge);
			}
		}
		return (null);
	}

	/**
	* Return challenge requested from challenger ID
	*/
	private getChallenge(challengerId: number): ChallengeRequest {
		return (this.challenges.get(challengerId));
	}
	
	/* ------------------------- Challenge private  ------------------------- */

	private async assertChallenge(
		challengerId: number,
		challengedId: number,
		challengerSockets: Socket|null,
		challengedSockets: Socket|null
	): Promise<ChallengeUserData> {
		const challengedUser = await this.userService.getUserBy("ID", challengedId) as UserDetails;
		const challenger = await this.userService.getUserBy("ID", challengerId, true) as UserDetails;
		if (!challengedUser || !challenger) throw new WsException({
			status: 404, message: "User not found", error: "Not Found"
		});
		if (challengedId === challengerId) throw new WsException({
			status: 400, message: "You can't challenge yourself", error: "Bad Request"
		});
		const isChallengerBlocked = await this.relationsService.isUserBlocked(challengerId, challengedId);
		if (isChallengerBlocked) throw new WsException({
			status: 403, message: "You are blocked by this user", error: "Forbidden"
		})
		if (challengedUser.status !== "online" || !challengedSockets) throw new WsException({
			status: 403, message: "User is not available", error: "Forbidden"
		});
		if (challenger.status !== "online" || !challengerSockets) throw new WsException({
			status: 403, message: "You are not available", error: "Forbidden"
		});
		return ({
			challenger,
			challenged: challengedUser
		});
	}

	private assertWithRunningChallenge(challengerId: number, challengedId: number): void {
		const challengedChallenge = this.getWhereChallenged(challengedId)
		if (challengedChallenge && challengedChallenge.challenger !== challengerId) {
			throw new BadRequestException("User already challenged");
		}
		const requesterCurrentChallenge = this.getChallenge(challengerId);
		if (requesterCurrentChallenge) {
			if (requesterCurrentChallenge.challenged === challengedId && requesterCurrentChallenge.createdAt.getTime() + CHALLENGE_EXPIRY_TIME > Date.now()){
				const remainingTime = Math.floor((requesterCurrentChallenge.createdAt.getTime() + CHALLENGE_EXPIRY_TIME - Date.now()) / 1000);
				throw new BadRequestException(`You already challenged this user. Wait ${remainingTime} seconds before challenging again`);
			}
			this.logger.log(`Challenge already exists for ${challengerId}. Deleting it`);
			this.challenges.delete(challengerId);
		}
	}

	/**
	 * Return running challenge, remove it and throw if challenge is expired
	 */
	private getValidChallengeByChallenger(challengerId: number): ChallengeRequest {
		console.log(this.challenges)
		const challenge = this.challenges.get(challengerId);
		if (!challenge) throw new BadRequestException("No challenge found");
		if (challenge.createdAt.getTime() + CHALLENGE_EXPIRY_TIME <= Date.now()) {
			this.challenges.delete(challengerId);
			throw new BadRequestException("Challenge expired");
		}
		this.challenges.delete(challengerId);
		return (challenge);
	}

	/**
	 * Check if the challenge is valid
	 * - Check if the challenged user is online
	 * - Check if the challenge is still valid
	 * - Check if the challenge is for the right user
	 */
	private async assertAcceptChallenge(
		challengerId: number,
		challengedId: number
	):Promise<ChallengeRequest> {
		const userData = await this.userService.getUserBy("ID", challengedId);
		if (!userData) throw new InternalServerErrorException("error with user service");
		const challenge = this.getChallenge(challengedId);
		if (!challenge) throw new BadRequestException("No challenge found");
		if (userData.status !== UserStatus.online) {
			this.challenges.delete(challengedId);
			throw new UserUnavailableException(userData.login, userData.status);
		}
		if (challenge.challenged !== challengerId) {
			this.challenges.delete(challengedId);
			throw new BadRequestException("You can't challenge yourself");
		}
		return (challenge);
	}

	/* ------------------------- Challenge public  ------------------------- */

	/**
	 * Challenge a user.
	 * - If challenger already has a challenge, delete it
	 * @throws if the challenge is for the same user and the challenge is not expired
	 * @throws if the user is already challenged by another user
	 */
	public async challengeUser(
		challengerId: number,
		data: ChallengeDTO,
		challengerSocket: Socket|null,
		challengedSocket: Socket|null
	): Promise<void> {
		const challengedId = data.userId;
		const usersData = await this.assertChallenge(
			challengerId, challengedId, challengerSocket, challengedSocket
		);
		try {
			this.logger.log(`Challenge ${challengerId} to ${challengedId}`);
			this.assertWithRunningChallenge(challengerId, challengedId);
			const challenge = {
				challenger: challengerId,
				challenged: challengedId,
				gameType: data.gameType
			}
			this.challenges.set(challengerId, {
				...challenge,
				createdAt: new Date()
			});
			challengerSocket.emit('challenge', challenge, usersData.challenger);
			challengedSocket.emit('challenge', challenge, usersData.challenger);
		} catch (e) {
			//@todo check this doesnt crash server
			throw new WsException({
				status: 400, message: e.message, error: "Bad Request"
			});
		}
	}

	/**
	 * When challenged user accept the challenge, create a new game
	 * @emits challenge.accept Tell both users that the challenge is accepted
	 * & redirect them to the game. They will skip queue and join the game
	 */
	public async initChallengeGame(
		challengerSocket: Socket|undefined,
		challengedSocket: Socket|undefined,
		data: userChallenge
	): Promise<void> {
		if (!challengerSocket || !challengedSocket) return ;
		const newGame = await this.gameService.initChallengeGame(
			data.challenger,
			data.challenged,
			data.gameType === "spatial" ? "spatialPong" : "classicPong"
		);
		challengerSocket.emit('challenge.accept', data, newGame.ID);
		challengedSocket.emit('challenge.accept', data, newGame.ID);
	}

	/**
	 * Send challenge cancel event to both users
	 * @emits challenge.cancel Tell both users that the challenge is canceled
	 */
	public async cancelChallengeEvent(
		challengerSocket: Socket[],
		challengedSocket: Socket[],
		data: userChallenge
	): Promise<void> {
		if (challengedSocket.length === 0 || challengedSocket.length === 0) return ;
		const sockets = [...challengerSocket, ...challengedSocket];
		for (const socket of sockets) {
			socket.emit('challenge.cancel', data);
		}
	}

	/**
	 * Cancel running challenge and return it
	 */
	public cancelRunningChallenge(challengerId: number): ChallengeRequest {
		const challenge = this.getChallenge(challengerId);
		if (!challenge) throw new BadRequestException("No challenge found");
		this.removeChallenge(challengerId);
		return (challenge);
	}

	public async declineChallenge(
		challengerSocket: Socket[],
		data: userChallenge
	): Promise<void> {
		if (!challengerSocket) return ;
		for (const socket of challengerSocket) {
			socket.emit('challenge.decline', data);
		}
	}

	public async handleAcceptChallenge(
		userId: number,
		challengerId: number,
		response?: boolean
	): Promise<void> {
		const challenge = await this.assertAcceptChallenge(userId, challengerId);
		response = response === undefined ? true : response;
		if (response) {
			this.logger.log(`Challenge from ${challengerId} accepted by ${userId}`);
			this.getValidChallengeByChallenger(challengerId);
			this.eventEmitter.emit('user.challenge.accept', {
				challenger: challengerId,
				challenged: userId,
				gameType: challenge.gameType
			});
		}
		else {
			this.logger.log(`Challenge declined by ${userId}`);
			this.removeChallenge(challengerId);
			this.eventEmitter.emit('user.challenge.decline', {
				challenger: challengerId,
				challenged: userId,
			});
		}
	}

	/**
	 * Return all challenges where user is challenger or challenged
	 * also remove expired challenges and duplicate challenges
	 * @param userId 
	 */
	async getUserChallenges(userId: number): Promise<Challenge[]> {
		const challenges = [];
		for (const challenge of this.challenges.values()) {
			if (challenge.challenged === userId || challenge.challenger === userId) {
				if (challenge.createdAt.getTime() + CHALLENGE_EXPIRY_TIME <= Date.now()) {
					this.challenges.delete(challenge.challenger);
				}
				else challenges.push(challenge);
			}
		}
		challenges.sort((a, b) => {
			if (a.challenger === userId) return (-1);
			if (b.challenger === userId) return (1);
			return (a.createdAt.getTime() - b.createdAt.getTime());
		});
		const users = await this.userService.getUsersByIds(challenges.map(challenge => challenge.challenger), true) as UserDetails[];
		return (challenges.map(challenge => {
			const user = users.find(user => user.ID === challenge.challenger);
			if (!user) throw new Error("Invalid user");
			return ([challenge, user]);
		}));
	}
}