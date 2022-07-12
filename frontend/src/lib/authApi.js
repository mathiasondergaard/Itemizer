const baseUrl = 'http://localhost:3000/api/auth';

//class used as a wrapper for fetch
async function request({method, path, authorization}) {
    const options = {
        method, credentials: 'include',
        headers: {
            "Content-Type": "application/json",
            "Authorization": authorization
        }
    };

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

export function post(path, authorization) {
    return request({method: 'POST', path, authorization});
}

export function patch(path, authorization) {
    return request({method: 'PATCH', path, authorization});
}

export function put(path, authorization) {
    return request({method: 'PUT', path, authorization});
}