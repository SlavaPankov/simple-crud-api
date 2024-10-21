import supertest, { Response } from "supertest";
import TestAgent from "supertest/lib/agent";
import Test from "supertest/lib/test";
import { IUser } from "../types/interfaces/users";
import { routes } from "../routes";
import { EStatusCode } from "../types/enums/statusCode";
import { EErrorMessage } from "../types/enums/errors";
import { v4 } from 'uuid';

let request: TestAgent<Test>;
let createUser: () => Promise<Response>;

const user: Omit<IUser, 'id'> = {
    username: 'Test user',
    age: 20,
    hobbies: ['some', 'hobbie'],
};

beforeAll(() => {
    request = supertest(routes);

    createUser = async () => await request.post('/api/users').send(user);
});

describe('Testing success cases', () => {
    it('Should return en empty array', async () => {
        const { statusCode, body } = await request.get('/api/users');
    
        expect(statusCode).toBe(EStatusCode.OK);
        expect(body).toEqual([]);
    });
    
    it('Should create a user', async () => {
        const { statusCode, body: { id, username, age, hobbies } } = await createUser();
    
        expect(statusCode).toBe(EStatusCode.CREATED);
        expect(id).not.toEqual('');
        expect(username).toBe(user.username);
        expect(age).toBe(user.age);
        expect(hobbies).toEqual(user.hobbies);
    });
    
    it('Should get a user with current id', async () => {
        const { body: { id: createdId } } = await createUser();
    
        const { statusCode, body } = await request.get(`/api/users/${createdId}`);
    
        expect(statusCode).toBe(EStatusCode.OK);
        expect(body).toEqual({ ...user, id: createdId });
    });
    
    it('Should update user successfully', async () => {
        const { body: { id } } = await createUser();
        
        const { statusCode, body } = await request.put(`/api/users/${id}`).send({ username: 'New name', age: 30, hobbies: [] });
        
        expect(statusCode).toBe(EStatusCode.OK);
        expect(body).toEqual({ id, username: 'New name', age: 30, hobbies: [] });
    });
    
    it('Should delete user successfully', async () => {
        const { body: { id } } = await createUser();
    
        const { statusCode } = await request.delete(`/api/users/${id}`);
    
        expect(statusCode).toBe(EStatusCode.NO_CONTENT);
    });
});

describe('Testing error messages', () => {
    it('Should return an error for trying to get user with invalid uuid', async () => {
        await createUser();

        const { statusCode, body: { message } } = await request.get(`/api/users/invalid-uuid`);

        expect(statusCode).toBe(EStatusCode.BAD_REQUEST);
        expect(message).toEqual(EErrorMessage.INVALID_USER_ID);
    });

    it('Should return an error for trying to get user with undefined user', async () => {
        await createUser();

        const { statusCode, body: { message } } = await request.get(`/api/users/${v4()}`);

        expect(statusCode).toBe(EStatusCode.NOT_FOUND);
        expect(message).toEqual(EErrorMessage.USER_NOT_FOUND);
    });

    it('Should return an error for trying to update user with invalid uuid', async () => {
        await createUser();

        const { statusCode, body: { message } } = await request.put('/api/users/invalid-uuid').send({ username: 'Test', age: 20, hobbies: [] });

        expect(statusCode).toBe(EStatusCode.BAD_REQUEST);
        expect(message).toEqual(EErrorMessage.INVALID_USER_ID);
    });

    it('Should return an error for trying to update user with non exists uuid', async () => {
        await createUser();

        const { statusCode, body: { message } } = await request.put(`/api/users/${v4()}`).send({ username: 'Test', age: 20, hobbies: [] });

        expect(statusCode).toBe(EStatusCode.NOT_FOUND);
        expect(message).toEqual(EErrorMessage.USER_NOT_FOUND);
    });

    it('Should return an error for trying to delete user with invalid uuid', async () => {
        await createUser();

        const { statusCode, body: { message } } = await request.delete(`/api/users/invalid-uuid`);

        expect(statusCode).toBe(EStatusCode.BAD_REQUEST);
        expect(message).toEqual(EErrorMessage.INVALID_USER_ID);
    });

    it('Should return an error for trying to delete user with non exists uuid', async () => {
        await createUser();

        const { statusCode, body: { message } } = await request.delete(`/api/users/${v4()}`);

        expect(statusCode).toBe(EStatusCode.NOT_FOUND);
        expect(message).toEqual(EErrorMessage.USER_NOT_FOUND);
    });
});