import TextField from '@mui/material/TextField';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import Link from '@mui/material/Link';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import {
    Accordion, AccordionDetails,
    AccordionSummary,
    Paper
} from "@mui/material";
import BrandLogo from "../components/BrandLogo";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import {useEffect, useState} from "react";
import {BASE_URL, CURRENT_USER_KEY, IMAGE_URL} from "../utils/constants";
import LoadingButton from "@mui/lab/LoadingButton";
import Footer from "../components/Footer";
import {fetcher} from "../utils/fetch_utils";
import PasswordField from "../components/auth/passwordField.js";
import {validateEmail} from "../components/auth/utils";


export default function RegisterPage() {
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [password2, setPassword2] = useState('')
    const [email, setEmail] = useState('')
    const [firstName, setFirstName] = useState('')
    const [lastName, setLastName] = useState('')
    const [agree, setAgree] = useState(false);
    const [loading, setLoading] = useState(false);
    const [usernameErrorMessage, setUsernameErrorMessage] = useState(null);
    const [passwordErrorMessage, setPasswordErrorMessage] = useState(null);
    const [emailErrorMessage, setEmailErrorMessage] = useState(null);
    const [expanded, setExpanded] = useState(false)

    useEffect(() => {
        document.title = 'SounDream | Register'
    }, [])

    const validateInputUsername = async () => {
        if (!username) {
            setUsernameErrorMessage('This field is required')
            return
        }
        if (username.length < 4) {
            setUsernameErrorMessage('Username must be at least 4 characters long.')
            return
        }
        if (username !== '') {
            const url = BASE_URL + "/users/check_username?username=" + username
            const req = await fetcher({url, method: "GET"})
            if (req.result !== true) {
                setUsernameErrorMessage(req.details)
                return
            }
        }
        setUsernameErrorMessage(null)
    }

    const validateInputEmail = async () => {
        if (email !== '' && !validateEmail(email)) {
            setEmailErrorMessage('Not valid Email')
            return
        }
        if (email !== '') {
            const url = BASE_URL + "/users/check_email?email=" + email
            const req = await fetcher({url, method: "GET"})
            if (req.result !== true) {
                setEmailErrorMessage(req.details)
                return
            }
        }
        setEmailErrorMessage(null)
    }

    const handleSubmit = async () => {
        const pwdError = []
        if (!password || !password2 || password.length < 5 || password2.length < 5) {
            pwdError.push('Password must be at least 5 characters long')
        }
        if (password !== password2) {
            pwdError.push('Passwords don`t match')
        }
        const errString = pwdError.join('; ')
        if (errString !== '') {
            setPasswordErrorMessage(errString)
            return
        }
        setPasswordErrorMessage(null)
        if (emailErrorMessage !== null) return
        let uid
        try {
            const user = JSON.parse(localStorage.getItem(CURRENT_USER_KEY))
            uid = user.user_id
        } catch (e) {
            console.log(e)
        }
        const payload = {
            username,
            email,
            password,
            user_id: uid,
            first_name: firstName,
            last_name: lastName,
        }
        setLoading(true)

        const url = BASE_URL + "/users/signup"
        const req = await fetcher({url, payload})
        if (req.result === true) {
            // flush saved user_id, bcause it was already registered
            localStorage.removeItem(CURRENT_USER_KEY)
            window.location.replace('/login')
        } else {
            console.log(req)
        }

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
                            marginTop: '2vh',
                            minHeight: '93vh' // in summ must be 95vh
                        }}
                    >
                        <BrandLogo/>
                        <Typography component="h1" variant="h5">
                            Sign up
                        </Typography>
                        <Box component="form" sx={{mt: 1}}>
                            <TextField
                                autoFocus
                                required
                                fullWidth
                                label="Username"
                                name="username"
                                margin="normal"
                                sx={{height: "80px"}}
                                error={usernameErrorMessage !== null}
                                helperText={usernameErrorMessage}
                                onBlur={validateInputUsername}
                                value={username}
                                onChange={e => setUsername(e.target.value)}
                            />
                            <TextField
                                fullWidth
                                required
                                label="Email address"
                                margin="dense"
                                sx={{height: "80px"}}
                                value={email}
                                onBlur={validateInputEmail}
                                error={emailErrorMessage !== null}
                                helperText={emailErrorMessage}
                                onChange={e => setEmail(e.target.value)}/>
                            <PasswordField label="Password"
                                           sx={{height: "80px"}}
                                           value={password}
                                           fullwidth={true}
                                           setValue={setPassword}/>
                            <PasswordField label="Confirm password"
                                           value={password2}
                                           sx={{height: "80px"}}
                                           fullwidth={true}
                                           setValue={setPassword2}
                                           error={passwordErrorMessage !== null}
                                           errorMessage={passwordErrorMessage}/>
                            <Accordion expanded={expanded}
                                       onChange={() => setExpanded(!expanded)}>
                                <AccordionSummary expandIcon={<ExpandMoreIcon/>}>
                                    <Typography>Optional information</Typography>
                                </AccordionSummary>
                                <AccordionDetails>
                                    <Typography sx={{color: 'text.secondary'}}>
                                        You may fill this fields after registration. We recommend you to provide an
                                        email in order not to loose the access to your account.
                                    </Typography>
                                    <TextField
                                        fullWidth
                                        label="First Name"
                                        margin="dense"
                                        value={firstName}
                                        onChange={e => setFirstName(e.target.value)}
                                    />
                                    <TextField
                                        fullWidth
                                        label="Last Name"
                                        margin="dense"
                                        value={lastName}
                                        onChange={e => setLastName(e.target.value)}/>

                                </AccordionDetails>
                            </Accordion>
                            <FormControlLabel
                                control={<Checkbox
                                    value={agree}
                                    color="primary"
                                    onChange={() => setAgree(!agree)}/>}
                                label={<>I agree with <Link href={'/terms'}>terms of use</Link>.</>}
                            />
                            <LoadingButton
                                fullWidth
                                loading={loading}
                                disabled={!agree || usernameErrorMessage !== null || email.length ===0 || emailErrorMessage!==null}
                                onClick={handleSubmit}
                                variant="contained"
                                sx={{m: 1}}
                            >
                                Sign Up
                            </LoadingButton>
                            <Grid container justifyContent={"end"}>
                                <Grid item>
                                    <Link href="/login" variant="body2">
                                        {"Already have an account? Please sign in."}
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