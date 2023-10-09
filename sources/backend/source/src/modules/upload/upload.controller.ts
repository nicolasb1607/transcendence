import { Controller, Logger, Post, UploadedFile, UseInterceptors } from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { Express } from 'express'
import { JWTData } from "../auth/auth.interface";
import { UploadService } from "./upload.services";
import { multerConfig } from "./multer.config";
import { AuthUser } from "../../common/decorators/user.decorator";

@Controller('api/avatar')
export class UploadController {

	logger = new Logger("AuthController");

	constructor(
		private readonly uploadService : UploadService
	) {}

	@Post('upload')
	@UseInterceptors(FileInterceptor('file', multerConfig))
	async uploadFileAndPassValidation(
		@AuthUser() user: JWTData,
		@UploadedFile() file: Express.Multer.File,
	): Promise<{ message: string, avatarUrl: string }> {
		const avatarUrl = await this.uploadService.uploadAvatar(file, user.ID);
		return { message: 'File uploaded successfully', avatarUrl };
	}
}
