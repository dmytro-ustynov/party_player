import {ACCESS_TOKEN_KEY, CURRENT_USER_KEY, LOGIN_PAGE_URL, REFRESH_TOKEN_URl} from "./constants";

export async function fetcher(params) {
    let {url, payload, body, credentials, headers, method = "POST", asFile = false} = params
    let fetchProps = {method: method}
    if (payload && Object.entries(payload).length) {
        fetchProps = {...fetchProps, body: JSON.stringify(payload)}
        headers = {
            ...headers,
            'Content-Type': 'application/json'
        }
    } else if (body) {
        fetchProps = {...fetchProps, body}
    }

    if (credentials === true) {
        fetchProps = {...fetchProps, credentials: 'include'}
        const accessToken = localStorage.getItem(ACCESS_TOKEN_KEY)
        if (Boolean(accessToken)) {
            headers = {...headers, 'Authorization': `Bearer ${accessToken}`}
        }
    }
    fetchProps = {...fetchProps, headers}
    try {
        const request = await fetch(url, fetchProps)
        if (request.ok) {
            if (asFile === false) return await request.json()
            else return await request.blob()
        } else {
            const status = request.status
            if (status === 401) {
                console.log('try to refresh token...')
                const refreshResponse = await fetch(REFRESH_TOKEN_URl, {credentials: "include"})
                const data = await refreshResponse.json()

                if (data[ACCESS_TOKEN_KEY]) {
                    localStorage.setItem(ACCESS_TOKEN_KEY, data.access_token);
                    console.log('token refreshed successfully')
                    // retry the same request with updated access token
                    return fetcher(params)
                } else {
                    console.log('refresh fails, logout...')
                    localStorage.removeItem(ACCESS_TOKEN_KEY)
                    localStorage.removeItem(CURRENT_USER_KEY);
                    // redirect to login page for protected routes
                    window.location.href = LOGIN_PAGE_URL
                }
            } else {
                const data = await request.json()
                return {result: false, details: data.details, status}
            }
        }
    } catch (e) {
        console.warn(`oops, smth wrong at our side, please try later: ${e}`)
        return {}
    }
}

export async function download(blob, filename) {
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    const clicker = () => {
        setTimeout(() => {
            URL.revokeObjectURL(url);
            a.removeEventListener('click', clicker);
        }, 150)
    }
    a.addEventListener('click', clicker, false)
    a.click()
}