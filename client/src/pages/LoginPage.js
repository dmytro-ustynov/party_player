import Footer from "../components/Footer";
import BrandLogo from "../components/BrandLogo";
import {
    Box,
    Checkbox,
    FormControlLabel,
    Grid,
    Link,
    Paper,
    TextField,
    Typography
} from "@mui/material";
import LoadingButton from '@mui/lab/LoadingButton';

import {useEffect, useState} from "react";
import {IMAGE_URL} from "../utils/constants";
import {loginUser} from "../components/auth/actions";
import {useAuthDispatch} from "../components/auth/context";

export default function LoginPage() {
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [remember, setRemember] = useState(false)
    const [error, setError] = useState(false)
    const [errorMessage, setErrorMessage] = useState('')
    const [loading, setLoading] = useState(false)

    // const state = useAuthState()
    const dispatch = useAuthDispatch()

    useEffect(()=>{
        document.title = 'SounDream | Log In'
    }, [])
    const handleSubmit = async () => {
        if (!(username && password)) {
            setError(true)
            setErrorMessage('You must specify username and password')
        } else {
            setError(false)
            setErrorMessage(null)
            setLoading(true)
            try {
                let response = await loginUser(dispatch, {username, password, remember})
                if (!response.result) {
                    setError(true)
                    setErrorMessage(response.details)
                    setLoading(false)
                    return
                }
                window.location.replace("/")
            } catch (error) {
                console.log(error)
                setError(true)
                setErrorMessage('error')
                setLoading(false)
            }
        }
    }
    const handleInputName = (event) => {
        setUsername(event.target.value)
    }
    const handleInputPassword = (event) => {
        setPassword(event.target.value)
    }

    const imageUrl = `url(${IMAGE_URL})`
    return (
        <>
            <Grid container sx={{height: '100vh'}}>
                <Grid
                    item
                    xs={false}
                    sm={4}
                    md={7}
                    sx={{
                        backgroundImage: imageUrl,
                        backgroundRepeat: 'no-repeat',
                        backgroundColor: (t) =>
                            t.palette.mode === 'light' ? t.palette.grey[50] : t.palette.grey[900],
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                    }}
                />
                <Grid item xs={12} sm={8} md={5} component={Paper} elevation={6} square>
                    <Box
                        sx={{
                            mx: 4,
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            marginTop: '15vh',
                            minHeight: '80vh'
                        }}
                    >
                        <BrandLogo/>
                        <Typography component="h1" variant="h5">
                            Sign in
                        </Typography>
                        <Box component="form" sx={{mt: 1}}>
                            <TextField
                                margin="normal"
                                error={error}
                                required
                                fullWidth
                                value={username}
                                id="email"
                                label="Email Address"
                                name="email"
                                autoComplete="email"
                                autoFocus
                                onChange={handleInputName}
                            />
                            <TextField
                                margin="normal"
                                error={error}
                                helperText={errorMessage}
                                required
                                fullWidth
                                value={password}
                                name="password"
                                label="Password"
                                type="password"
                                id="password"
                                autoComplete="current-password"
                                onChange={handleInputPassword}
                            />
                            <FormControlLabel
                                control={<Checkbox value={remember}
                                                   color="primary"
                                                   onChange={() => setRemember(!remember)}/>}
                                label="Remember me"
                            />
                            <LoadingButton
                                loading={loading}
                                onClick={handleSubmit}
                                fullWidth
                                variant="contained"
                                sx={{mt: 3, mb: 2}}
                            >
                                CONTINUE
                            </LoadingButton>
                            <Grid container>
                                <Grid item xs>
                                    <Link href="#" variant="body2">
                                        Forgot password?
                                    </Link>
                                </Grid>
                                <Grid item>
                                    <Link href="/register" variant="body2">
                                        {"Don't have an account? Sign Up"}
                                    </Link>
                                </Grid>
                            </Grid>
                        </Box>
                    </Box>
                    <Footer/>
                </Grid>
            </Grid>
        </>
    )
}