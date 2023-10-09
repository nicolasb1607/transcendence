import { Module, Logger } from "@nestjs/common";
import { PrismaModule } from '../../common/providers/prisma/prisma.module';
import { RelationsController } from './relations.controller';
import { RelationsService } from './relations.service';
import { UsersModule } from "../users/users.module";

@Module({
	imports: [PrismaModule, UsersModule],
	controllers: [RelationsController],
	providers: [ 
		RelationsService, 
		Logger
	],
	exports: [ RelationsService ]
})
export class RelationsModule {}