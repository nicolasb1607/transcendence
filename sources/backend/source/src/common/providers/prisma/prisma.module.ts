import { Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

/**
 * Provides the Prisma module.
 * Handle the connection to the database through
 * the Prisma client.
 */
@Module({
	providers: [PrismaService],
	exports: [PrismaService],
})
export class PrismaModule {}
