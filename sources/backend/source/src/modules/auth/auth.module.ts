import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from '../users/users.module';
import { JwtModule } from '@nestjs/jwt';
import { jwtConstants } from './constants';
import { GoogleStrategy } from './google.strategy'
import { PrismaModule } from '../../common/providers/prisma/prisma.module';
import { FortyTwoStrategy } from './forty_two.strategy';

/**
 * Provides the authentication module
 * triggers the jwt module
 */
@Module({
	imports: [
		UsersModule,
		JwtModule.register({
			global:true, 
			secret: jwtConstants.secret,
			signOptions: { expiresIn: '7d' }
		}),
		PrismaModule
	],
	providers: [
		AuthService,
		GoogleStrategy,
		FortyTwoStrategy
	],
	controllers: [AuthController],
})
export class AuthModule {}
