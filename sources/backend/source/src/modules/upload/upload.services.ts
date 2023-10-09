import { Injectable, InternalServerErrorException } from "@nestjs/common";
import { extname } from 'path';
import * as sharp from 'sharp';
import { randomBytes } from 'crypto';
import { unlinkSync } from 'fs';
import { UsersService } from "../users/users.service";
import { PrismaService } from '../../common/providers/prisma/prisma.service';

@Injectable()
export class UploadService {
	constructor(
		private usersService: UsersService,
		private readonly prisma: PrismaService,
	) { }

	/**
	 * Upload avatar to the server. Erase the previous avatar if exist.
	 * only one private avatar is allowed per user.
	 */
	async uploadAvatar(file: Express.Multer.File, userID: number): Promise<string> {
		try{
			await this.usersService.erasePrivateAvatarIfExist(userID);
			const originalPath = file.path;
			const outputPath = `./client/avatars/private/${Date.now()}-${randomBytes(4).toString('hex')}${extname(file.originalname)}`;
			const outputPathBig = outputPath.replace('/private/' ,'/private/big/');
			await this.resizeImage(originalPath, outputPath, 100);
			await this.resizeImage(originalPath, outputPathBig, 500);
			unlinkSync(originalPath);
			await this.usersService.upsertUserAvatar(userID, outputPath.replace("./client/", ""));
			return outputPath.replace("./client/", process.env.API_URL);
		} catch (error) {
			throw new InternalServerErrorException('Failed to upload avatar.');
		}
	}

	async resizeImage(inputPath: string, outputPath: string, pixelSize: number) {
		await sharp(inputPath)
			.resize(pixelSize, pixelSize, {
				fit: 'cover'
			})
			.toFile(outputPath);
	}
}