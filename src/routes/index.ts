import { IncomingMessage, ServerResponse } from 'http';
import { create, deleteUser, get, getById, handleError, notAllowed, update } from '../models/user';

const parseUrl = (url: string) => {
    const parsedUrl = url.split('/').filter(Boolean);
    const api: string = parsedUrl[0];
    const users: string = parsedUrl[1];
    const id: string = parsedUrl[2];
    const rest: string[] = parsedUrl.slice(3);

    return { api, users, id, rest }
}

export const routes = async (request: IncomingMessage, response: ServerResponse) => {
    response.setHeader('Content-Type', 'application/json');

    const { api, users, id, rest } = parseUrl(request.url);

    if (`${api}/${users}` === "api/users" && rest.length === 0) {
        switch (request.method) {
            case 'GET':
                if (id) {
                    await getById(request, response, id);
                } else {
                    await get(request, response);
                }

                break;
            case 'POST':
                await create(request, response);
                
                break;
            case 'PUT':
                await update(request, response, id);
                
                break;
            case 'DELETE':
                await deleteUser(request, response, id);

                break;
            default:
                notAllowed(response);

                break;
        }
    } else {
        handleError(response);
    }
};