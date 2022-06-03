// import logo from './logo.svg';
import {useState} from "react";
async function fetcher(params) {
    let {url, payload, body, credentials, headers} = params
    let fetchProps = {method: "POST"}
      if (payload && Object.entries(payload).length) {
        fetchProps = {...fetchProps, body: JSON.stringify(payload)}
        headers = {...headers,
          'Content-Type': 'application/json'}
      }else if (body){
        fetchProps = {...fetchProps, body}
      }

      // if (credentials === true) {
      //   fetchProps = {...fetchProps, credentials: 'include'}
      //   const accessToken = localStorage.getItem(ACCESS_TOKEN_KEY)
      //   if (Boolean(accessToken)) {
      //     headers = {...headers, 'Authorization': `Bearer ${accessToken}`}
      //   }
      // }
  fetchProps = {...fetchProps, headers}
    try {
    const request = await fetch(url, fetchProps)
    if (request.ok){
      return await request.json()
    } else {
      const status = request.status
      const data = await request.json()
      console.log('error request', request)
      return {result: false, details: data.details, status}
    }
    } catch (e) {
    console.warn(`oops, smth wrong at our side, please try later: ${e}`)
    return {}
    }
}

const {REACT_APP_API_BASE_URL} = process.env

function App() {
    const [filteredFiles, filterFiles] = useState([])


    const fetchFiles = async () => {
    try {
      const url = `${REACT_APP_API_BASE_URL}/users/`
      return await fetcher({url, credentials:true})
    } catch (e) {
      console.log(e)
      return {}
    }
  }
  const getFiles = async () => {
        const files = await fetchFiles()
      filterFiles(files.users)
  }
  return (
    <div className="App">
      <button onClick={getFiles}> go </button>
        {filteredFiles.length > 0 ?
          filteredFiles.map((item) => {
              return (
                <div key={item.email}>{item.username} - {item.email}</div>
              )
            }
          ) : <p>No such files found</p>
        }
    </div>
  );
}

export default App;
