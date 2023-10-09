import { BadRequestException, Controller, Get, Param, ParseIntPipe, Query } from '@nestjs/common';
import { AuthUser } from '../../common/decorators/user.decorator';
import { MessageGateway } from './message.gateway';
import { ChatService } from '../chat/chat.service';
import { MessageService } from './message.service';
import { UserRole } from '@prisma/client';
import { JWTData } from '../auth/auth.interface';

@Controller('chat/action')
export class ChannelActionController {
	constructor(
		private readonly chatService: ChatService,
		private readonly messageService: MessageService,
		private readonly messageGateway: MessageGateway
	){}

	private assertIds(channelId?: number, targetUserId?: number) {
		if (channelId < 0) throw new BadRequestException("Invalid channel ID");
		if (targetUserId <= 0) throw new BadRequestException("Invalid user ID");
	}

	@Get('kick/:channelId')
	async kickUser(
		@Param('channelId', ParseIntPipe) channelId: number,
		@AuthUser() user: JWTData,
		@Query('targetUserId', ParseIntPipe) targetUserId: number,
	):Promise<{message:string}> {
		this.assertIds(channelId, targetUserId);
		await this.chatService.handleChannelAdminAction(channelId, user, targetUserId, "kick");
		const userSocket = await this.messageService.kickUserFromChannel(channelId, targetUserId);
		if (userSocket?.socketId.length > 0){
			await this.messageGateway.kickUserFromChannel(channelId, targetUserId, userSocket);
		}
		this.messageGateway.refreshChannel(channelId);
		return ({ message: "User kicked successfully." });
	}

	@Get('changeRole/:channelId')
	async changeUserRole(
		@Param('channelId', ParseIntPipe) channelId: number,
		@AuthUser() user: JWTData,
		@Query('targetUserId', ParseIntPipe) targetUserId: number,
		@Query('role') role: UserRole
	) {
		this.assertIds(channelId, targetUserId);
		if (Object.keys(UserRole).includes(role) === false) {
			throw new BadRequestException("Invalid role");
		}
		await this.chatService.changeUserRole(channelId, user, targetUserId, role)
		this.messageGateway.refreshChannel(channelId);
		return ({ message: "User role changed successfully." });
	}

	@Get('muteUser/:channelId')
	async muteUser(
		@Param('channelId', ParseIntPipe) channelId: number,
		@AuthUser() user: JWTData,
		@Query('targetUserId', ParseIntPipe) targetUserId: number
	) {
		this.assertIds(channelId, targetUserId);
		const isMute = await this.chatService.muteUser(channelId, user, targetUserId)
		this.messageGateway.refreshChannel(channelId);
		return ({
			message: isMute ? "User muted successfully." : "User unmuted successfully."
		});
	}

	@Get('banUser/:channelId')
	async banUser(
		@Param('channelId', ParseIntPipe) channelId: number,
		@AuthUser() user: JWTData,
		@Query('targetUserId', ParseIntPipe) targetUserId: number
	) {
		this.assertIds(channelId, targetUserId);
		const isBan = await this.chatService.banUser(channelId, user, targetUserId)
		const userSocket = await this.messageService.getConnectedUserByUserId(targetUserId);
		this.messageGateway.banUserFromChannel(channelId, targetUserId, userSocket, isBan);
		this.messageGateway.refreshChannel(channelId);
		return ({
			message: isBan ? "User banned successfully." : "User unbanned successfully."
		});
	}
}