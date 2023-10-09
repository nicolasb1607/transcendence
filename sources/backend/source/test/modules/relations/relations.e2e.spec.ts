import type { INestApplication } from "@nestjs/common";
import { getTestingNestApp, login } from "../../utils/utils.functions";
import * as request from 'supertest';



const userTest = {
	login: 'user2',
	email: 'user2@example.fr',
	password: 'Password123!',
	role: 'user',
}

if (process.env.USE_DATABASE) {
	describe("Relations (e2e)", () => {
		let app: INestApplication;
		let token: string;


		beforeAll(async () => {
			app = await getTestingNestApp({}, false);
			await app.init();
			token = await login(app, userTest, false);
		});

		afterAll(async () => {
			await app.close();
		});

		it("/relations (POST). Should return a newly created relation", async () => {
			const res = await request(app.getHttpServer())
				.post('/api/relations')
				.set('Authorization', `Bearer ${token}`)
				.send({ relationId: 8, status: "friend" })
				.expect(201);


			const relation = res.body;
			expect(relation).toHaveProperty("ID");
			expect(relation).toHaveProperty("status", "friend");
			expect(relation).toHaveProperty("userId", 2);
			expect(relation).toHaveProperty("relationId", 8);

		});

		it("/relations (PUT). Should return an updated relation", async () => {
			const res = await request(app.getHttpServer())
				.put('/api/relations')
				.set('Authorization', `Bearer ${token}`)
				.send({ relationId: 8, status: "blocked" })
				.expect(200);

			const relation = res.body;
			expect(relation).toHaveProperty("ID");
			expect(relation).toHaveProperty("status", "blocked");
			expect(relation).toHaveProperty("userId", 2);
			expect(relation).toHaveProperty("relationId", 8);
		});


		it("/relations (DELETE). Should delete a relation", async () => {
			const res = await request(app.getHttpServer())
				.delete('/api/relations')
				.set('Authorization', `Bearer ${token}`)
				.send({ relationId: 8 })
				.expect(200);

			const message = res.body;
			expect(message).toHaveProperty("message", "Relation successfully deleted");

		});

		it("/relations (PUT). Should return block a user", async () => {
			const res = await request(app.getHttpServer())
				.put('/api/relations/block')
				.set('Authorization', `Bearer ${token}`)
				.send({ relationId: 8, status: "blocked" })
				.expect(200);

			const relation = res.body;
			expect(relation).toHaveProperty("ID");
			expect(relation).toHaveProperty("status", "blocked");
			expect(relation).toHaveProperty("userId", 2);
			expect(relation).toHaveProperty("relationId", 8);
		});

		it("/relations (DELETE). Should delete the blocked relation", async () => {
			const res = await request(app.getHttpServer())
				.delete('/api/relations')
				.set('Authorization', `Bearer ${token}`)
				.send({ relationId: 8 })
				.expect(200);

			const message = res.body;
			expect(message).toHaveProperty("message", "Relation successfully deleted");

		});
	});

} else {
	describe("Relations (e2e)", () => {
		it("No database", () => {
			expect(true).toBe(true);
		});
	});
}
