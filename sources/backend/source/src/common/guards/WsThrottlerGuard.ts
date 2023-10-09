import { type ExecutionContext, Injectable } from "@nestjs/common";
import { ThrottlerGuard } from "@nestjs/throttler";
import { WsException } from "@nestjs/websockets";

/**
 * Guard for throttling websocket requests.
 */
@Injectable()
export class WsThrottlerGuard extends ThrottlerGuard {
	async handleRequest(context: ExecutionContext, limit: number, ttl: number): Promise<boolean> {
		const client = context.switchToWs().getClient();
		const ip = client.conn.remoteAddress
		const key = this.generateKey(context, ip);
		const { totalHits } = await this.storageService.increment(key, ttl);

		console.log(`Throttling ${ip} (${totalHits}/${limit})`)
		if (totalHits > limit) {
			throw new WsException({
				status: 429,
				message: "Too Many Requests",
				error: "Too Many Requests"
			})
		}

		return true;
	}
}