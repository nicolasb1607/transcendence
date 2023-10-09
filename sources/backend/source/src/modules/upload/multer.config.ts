import { diskStorage } from 'multer';
import { BadRequestException } from '@nestjs/common';

export const multerConfig = {
	storage: diskStorage({
		destination: './client/avatars/private',
		filename: (req, file, callback) => {
			callback(null, `${file.originalname}`);
		}
	}),
	fileFilter: (req, file, callback) => {
		if (!file.mimetype.match(/image\/(png|jpeg)/)) {
			return callback(new BadRequestException('Invalid file type'), false);
		}
		callback(null, true);
	},
	limits: {
		fileSize: 1000000
	}
};
