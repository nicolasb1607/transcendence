import { type ArgumentsHost, type WsExceptionFilter, Catch } from '@nestjs/common';
import {
	WsException,
} from '@nestjs/websockets';
import type { HttpError, ThrowObject } from '../../../test/utils/utils.interfaces';

/**
 * Catch sockets exceptions and send them back to the client
 * through the 'exception' event
 */
@Catch(WsException)
export class WsExceptionInterceptor implements WsExceptionFilter {
	catch(exception: WsException, host: ArgumentsHost) {
		const client = host.switchToWs().getClient();
		const exceptionError = exception.getError() as ThrowObject;
		const errorResponse:HttpError = {
			statusCode: exceptionError.status,
			message: exceptionError.message,
			error: exceptionError.response?.error || exceptionError.name,
		}
		client.emit('exception', errorResponse);
	}
}
