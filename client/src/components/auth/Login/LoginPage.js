import {useState} from "react";
// import {useAuthDispatch, useAuthState} from "./context";
import styles from '../auth.module.css';
import {loginUser} from "../actions";
import {useAuthDispatch, useAuthState} from "../context";
import { useNavigate } from "react-router-dom";


function LoginPage(props) {

    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')

    const dispatch = useAuthDispatch()
    const {loading, errorMessageLogin} = useAuthState() //read the values of loading and errorMessage from context
    let navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault()

        try {
            let response = await loginUser(dispatch, {email_address: username, password})
            console.log(response)
            if (Boolean(response.result)) {
                navigate('/')
            }
        } catch (error) {
            console.log(error)
        }
    }
    return (
        <div className={styles.container}>
            <div className={{width: 200}}>
                <h1>Login Page</h1>
                {
                    errorMessageLogin ? <p className={styles.error}>{errorMessageLogin}</p> : null
                }
                <form>
                    <div className={styles.loginForm}>
                        <div className={styles.loginFormItem}>
                            <label htmlFor="email">Email address</label>
                            <input type="text" id='username' value={username}
                                   onChange={(e) => setUsername(e.target.value)}
                                   disabled={loading}/>
                        </div>
                        <div className={styles.loginFormItem}>
                            <label htmlFor="password">Password</label>
                            <input type="password" id='password' value={password}
                                   onChange={(e) => setPassword(e.target.value)}
                                   disabled={loading}/>
                        </div>
                    </div>
                    <button onClick={handleLogin} disabled={loading}>login</button>
                </form>
            </div>
        </div>
    )
}

export default LoginPage