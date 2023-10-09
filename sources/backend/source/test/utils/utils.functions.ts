import * as request from 'supertest';
import { Test } from '@nestjs/testing';
import { AppModule } from '../../src/app.module';
import { PrismaService } from '../../src/common/providers/prisma/prisma.service';
import type { TestingModule, TestingModuleBuilder } from '@nestjs/testing';
import { ValidationPipe, type INestApplication, type ModuleMetadata, type ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '../../src/modules/auth/auth.guard';
import type { CreateUserDTO } from '../../src/modules/users/users.dto';
import { ThrottlerGuard } from '@nestjs/throttler';
import { WsThrottlerGuard } from '../../src/common/guards/WsThrottlerGuard';

//Mock AuthGuard
const canActivate = (context: ExecutionContext) => {
	const contextType = context.getType();
	if (contextType === 'http') {
		const request =  context.switchToHttp().getRequest();
		request['user'] = { ID: 1 };
	}
	else if (contextType === 'ws') {
		const client = context.switchToWs().getClient();
		client.data.user = { ID: 1 };
	}
	return (true);
}

export async function getTestingModule(mockPrisma: unknown, mockAuth = false, moduleMetaData: ModuleMetadata): Promise<TestingModule> {
	const testingModule: TestingModuleBuilder = await Test.createTestingModule(moduleMetaData);

	if (!process.env?.USE_DATABASE) {
		await testingModule
			.overrideProvider(PrismaService).useValue(mockPrisma)
	}
	if (mockAuth) {
		await testingModule
			.overrideProvider(AuthGuard).useValue({canActivate});
	}
	await testingModule.overrideProvider(ThrottlerGuard).useValue({ handleRequest: () => true });
	await testingModule.overrideGuard(WsThrottlerGuard).useValue({ handleRequest: () => true });
	return (await testingModule.compile());
}

export async function getTestingNestApp(mockPrisma: unknown, mockAuth = false): Promise<INestApplication> {
	const moduleFixture: TestingModule = await getTestingModule(mockPrisma, mockAuth, {
		imports: [AppModule],
		providers: [PrismaService],
	})
	const app: INestApplication = moduleFixture.createNestApplication();
	app.useGlobalPipes(new ValidationPipe());
	return (app);
}


/**
 * Dedicated (e2e) function to login a user
 * @note If Db is mock, the mock should include `findFirst`, `upsert`
 * @returns {string} The newly generated access token
 */
export async function login(app: INestApplication, userTest:CreateUserDTO, createUser = true): Promise<string> {
	if (createUser){
		console.log(`Creating user ${userTest.login}`)
		try {
			await request(app.getHttpServer())
				.post('/api/users')
				.send(userTest)
		} catch (e) {
			//console.log({e})
		}
	}

	const loginResponse = await request(app.getHttpServer())
		.post('/api/auth/login')
		.send({ login: userTest.login, password: userTest.password })
		.expect(200);
	console.log("login successful")
	return (loginResponse.body.accessToken);
}

export const expectStatusCode = (expectedStatusCode: number, response: request.Response) => {
	if (response.status !== expectedStatusCode) {
		console.log(`Expected status code ${expectedStatusCode}, got ${response.status}`);
		console.log(response.body);
	}
	expect(response.status).toBe(expectedStatusCode);
}