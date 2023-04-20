import {BASE_URL} from '../constants'

const AUTH_URL = BASE_URL + '/auth'

export async function login(data) {
    const loginUrl = AUTH_URL + '/login'
    return await fetch(loginUrl, {
        method: 'POST',
        body: JSON.stringify(data),
        headers: {'Content-Type': 'application/json'}
    })
}

export async function refresh_token() {
    const refresh_url = AUTH_URL + '/refresh'
    const req = await fetch(refresh_url, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`
        },
        credentials: 'include'
    })
    return await req.json()
}
