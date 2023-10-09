import { SetMetadata } from "@nestjs/common"

//Create a complex secret and keep it safe outside of the source code
//Put it into some .env file and DO NOT PUSH IT INTO SOURCE CODE !!! 
export const jwtConstants = {
	secret: process.env.JWT_SECRET
}

//Constants to define if a route isPublic
//Use the decorator @Public() over class_controller or route_handler
export const IS_PUBLIC_KEY = "isPublic";
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);