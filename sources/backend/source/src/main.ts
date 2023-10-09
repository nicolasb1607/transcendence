import { HttpAdapterHost, NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, Logger } from '@nestjs/common';
import { readFileSync } from 'fs'
import { resolve } from 'path'
import { PrismaClientExceptionFilter } from './common/filters/PrismaExceptionInterceptor';

const httpsOptions = {
	key: readFileSync(resolve(__dirname, '../../secrets/key.pem')),
	cert: readFileSync(resolve(__dirname, '../../secrets/cert.pem'))
}

async function bootstrap() {
	const app = await NestFactory.create(AppModule, {
		httpsOptions: process.env.API_PORT === '443' ? httpsOptions : null
	});
	const { httpAdapter } = app.get(HttpAdapterHost);
	app.useGlobalPipes(new ValidationPipe({
		whitelist: true,
		transform: true,
	}));
	app.useGlobalFilters(new PrismaClientExceptionFilter(httpAdapter));
	app.enableCors({
		origin: process.env.SITE_URL,
		allowedHeaders:
			'Content-Type, Access-Control-Allow-Headers, Authorization',
		credentials: true
	});
	await app.listen(process.env.API_PORT);
	const logger = new Logger('bootstrap');
	logger.log(`Application is running on port: ${process.env.API_PORT}`);
}
bootstrap();