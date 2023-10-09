import { Logger, Module } from "@nestjs/common";
import { twoFAController } from "./twoFA.controller";
import { TwoFAService } from "./twoFA.services";
import { PrismaModule } from "../../../common/providers/prisma/prisma.module";
import { UsersService } from "../../users/users.service";

@Module({
	imports: [PrismaModule],
	controllers: [twoFAController],
	providers: [
		UsersService,
		TwoFAService,
		Logger
	],
	exports: [TwoFAService]
})
export class TwoFAModule{}
