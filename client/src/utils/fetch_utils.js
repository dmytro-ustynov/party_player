import {ACCESS_TOKEN_KEY} from "./constants";

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
            const data = await request.json()
            return {result: false, details: data.details, status}
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