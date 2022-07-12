const baseUrl = 'http://localhost:3000/api';

//class used as a wrapper for fetch
async function request({method, path, body}) {
    const options = {
        method, credentials: 'include',
        headers: {
            "Content-Type": "application/json"

        }
    };

    if (body) {
        options.body = JSON.stringify(body);
    }

    const response = await fetch(`${baseUrl}${path}`, options);
    const data = await response.text();
    if (!data) {
        return {
            status: response.status
        };
    }

    try {
        return {
            status: response.status,
            data: JSON.parse(data),
        };
    } catch (err) {
        return {
            status: response.status,
            data
        };
    }
}

export function get(path) {
    return request({method: 'GET', path});
}

export function del(path) {
    return request({method: 'DELETE', path});
}

export function post(path, body) {
    return request({method: 'POST', path, body});
}

export function patch(path, body) {
    return request({method: 'PATCH', path, body});
}

export function put(path, body) {
    return request({method: 'PUT', path, body});
}