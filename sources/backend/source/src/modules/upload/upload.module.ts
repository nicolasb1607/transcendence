import { Module } from '@nestjs/common';
import { UploadController } from './upload.controller';
import { UploadService } from './upload.services';
import { MulterModule } from '@nestjs/platform-express';
import { multerConfig } from './multer.config';
import { UsersModule } from '../users/users.module';
import { PrismaModule } from '../../common/providers/prisma/prisma.module';

@Module({
	imports: [
		PrismaModule,
		UsersModule,
		MulterModule.register(multerConfig)
	],
	controllers: [UploadController],
	providers: [
		UploadService
	]

})
export class UploadModule {}
