import { IncomingMessage, ServerResponse } from 'http';
import { db } from 'src/db';
import { users } from 'src/db/users/users';
import { EErrorMessage } from 'src/types/enums/errors';
import { EStatusCode } from 'src/types/enums/statusCode';
import { IUser } from 'src/types/interfaces/users';
import { v4, validate } from 'uuid';

const userValidation = (username: string, age: number, hobbies: string[]) =>
    !username ||
    typeof username !== "string" ||
    typeof age !== "number" ||
    !hobbies ||
    !Array.isArray(hobbies) ||
    !hobbies.every(hobby => typeof hobby === "string")

export const get = async (_: IncomingMessage, response: ServerResponse) => {
    try {
        response.writeHead(EStatusCode.OK, { 'Content-Type': 'application/json' });
        response.end(JSON.stringify(db.users));
    } catch {
        console.error(EErrorMessage.INTERNAL_SERVER_ERROR);

        response.writeHead(EStatusCode.INTERNAL_SERVER_ERROR, { 'Content-Type': 'application/json' });
        response.end(JSON.stringify({ message: EErrorMessage.INTERNAL_SERVER_ERROR }));
    }
};

export const getById = async (_: IncomingMessage, response: ServerResponse, id: string) => {
    try {
        if (!validate(id)) {
            response.writeHead(EStatusCode.BAD_REQUEST, { "Content-Type": "application/json" });
            response.end(JSON.stringify({ message: EErrorMessage.INVALID_USER_ID }));

            return;
        }

        const user = users.find((user) => user.id === id);

        if (!user) {
            response.writeHead(EStatusCode.NOT_FOUND, { "Content-Type": "application/json" });
            response.end(JSON.stringify({ message: EErrorMessage.USER_NOT_FOUND }));

            return;
        }

        response.writeHead(EStatusCode.OK, { 'Content-Type': 'application/json' });
        response.end(JSON.stringify(user));
    } catch {
        console.error(EStatusCode.INTERNAL_SERVER_ERROR);

        response.writeHead(EStatusCode.INTERNAL_SERVER_ERROR, { "Content-Type": "application/json" });
        response.end(JSON.stringify({ message: EStatusCode.INTERNAL_SERVER_ERROR }));
    }
};

export const create = async (request: IncomingMessage, response: ServerResponse) => {
    try {
        let body = ''

        request.on('data', (chunk) => {
            body += chunk.toString();
        });

        request.on('end', () => {
            try {
                const { username, age, hobbies } = JSON.parse(body);

                if (!userValidation(username, age, hobbies)) {
                    response.writeHead(EStatusCode.BAD_REQUEST, { 'Content-Type': 'application/json' });
                    response.end(JSON.stringify({ message: EErrorMessage.MISSING_FIELDS }));
                    return;
                }

                const newUser: IUser = {
                    id: v4(),
                    username,
                    age,
                    hobbies,
                };

                users.push(newUser);

                response.writeHead(EStatusCode.CREATED, { "Content-Type": "application/json" });
                response.end(JSON.stringify(newUser));
            } catch {
                console.error(EErrorMessage.INVALID_BODY);

                response.writeHead(EStatusCode.BAD_REQUEST, { "Content-Type": "application/json" });
                response.end(JSON.stringify({ message: EErrorMessage.INVALID_BODY }));
            }
        });

    } catch {
        console.error(EErrorMessage.INTERNAL_SERVER_ERROR);

        response.writeHead(EStatusCode.INTERNAL_SERVER_ERROR, { "Content-Type": "application/json" });
        response.end(JSON.stringify({ message: EErrorMessage.INTERNAL_SERVER_ERROR }));
    }
};

export const update = async (request: IncomingMessage, response: ServerResponse, id: string) => {
    try {
        if (!validate(id)) {
            response.writeHead(EStatusCode.BAD_REQUEST, { "Content-Type": "application/json" });
            response.end(JSON.stringify({ message: EErrorMessage.INVALID_USER_ID }));

            return;
        }

        const currentUserIndex = users.findIndex((user) => user.id === id);

        if (currentUserIndex === -1) {
            response.writeHead(EStatusCode.NOT_FOUND, { "Content-Type": "application/json" });
            response.end(JSON.stringify({ message: EErrorMessage.USER_NOT_FOUND }));

            return;
        }

        let body = ''

        request.on('data', (chunk) => {
            body += chunk.toString();
        });

        request.on('end', () => {
            try {
                const { username, age, hobbies } = JSON.parse(body);
                if (userValidation(username, age, hobbies)) {
                    response.writeHead(EStatusCode.BAD_REQUEST, { "Content-Type": "application/json" });
                    response.end(JSON.stringify({ message: EErrorMessage.MISSING_FIELDS }));

                    return;
                }

                users[currentUserIndex] = { ...users[currentUserIndex], ...{ username, age, hobbies } };

                response.writeHead(EStatusCode.OK, { "Content-Type": "application/json" });
                response.end(JSON.stringify(users[currentUserIndex]));
            } catch {
                console.error(EErrorMessage.INVALID_REQUEST_BODY);

                response.writeHead(EStatusCode.BAD_REQUEST, { "Content-Type": "application/json" });
                response.end(JSON.stringify({ message: EErrorMessage.INVALID_REQUEST_BODY }));
            }
        });
    } catch {
        console.error(EErrorMessage.INTERNAL_SERVER_ERROR);

        response.writeHead(EStatusCode.INTERNAL_SERVER_ERROR, { "Content-Type": "application/json" });
        response.end(JSON.stringify({ message: EErrorMessage.INTERNAL_SERVER_ERROR }));
    }
};

export const deleteUser = async (_: IncomingMessage, response: ServerResponse, id: string) => {
    try {
        if (!validate(id)) {
            response.writeHead(EStatusCode.BAD_REQUEST, { "Content-Type": "application/json" });
            response.end(JSON.stringify({ message: EErrorMessage.INVALID_USER_ID }));
            return;
        }

        const userIndex = users.findIndex((user) => user.id === id);

        if (userIndex === -1) {
            response.writeHead(EStatusCode.NOT_FOUND, { "Content-Type": "application/json" });
            response.end(JSON.stringify({ message: EErrorMessage.USER_NOT_FOUND }));
        } else {
            users.splice(userIndex, 1);
            response.writeHead(EStatusCode.NO_CONTENT);
            response.end();
        }
    } catch (error) {
        console.error(EErrorMessage.INTERNAL_SERVER_ERROR);
        
        response.writeHead(EStatusCode.INTERNAL_SERVER_ERROR, { "Content-Type": "application/json" });
        response.end(JSON.stringify({ message: EErrorMessage.INTERNAL_SERVER_ERROR }));
    }
};

export const notAllowed = async (response: ServerResponse) => {
    try {
        response.writeHead(EStatusCode.NOT_FOUND, { "Content-Type": "application/json" });
        response.end(JSON.stringify({ message: EErrorMessage.NOT_FOUND }));
    } catch (error) {
        console.error(EErrorMessage.INTERNAL_SERVER_ERROR);

        response.writeHead(EStatusCode.INTERNAL_SERVER_ERROR, { "Content-Type": "application/json" });
        response.end(JSON.stringify({ message: EErrorMessage.INTERNAL_SERVER_ERROR }));
    }
};

export const handleError = async (response: ServerResponse) => {
    console.error(EErrorMessage.NOT_FOUND);

    response.writeHead(EStatusCode.NOT_FOUND, { "Content-Type": "application/json" });
    response.end(JSON.stringify({ message: EErrorMessage.NOT_FOUND }));
};