import {Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, TextField} from "@mui/material";
import LoadingButton from "@mui/lab/LoadingButton";
import React, {useEffect, useState} from "react";
import {BASE_URL, UPDATE_PROFILE_URL} from "../../utils/constants";
import {fetcher} from "../../utils/fetch_utils";
import Snackbar from "@mui/material/Snackbar";
import {useAuthDispatch, useAuthState} from "./context";
import Box from "@mui/material/Box";
import {validateEmail} from "../auth/utils.js";
import Typography from "@mui/material/Typography";
import {authTypes} from "./reducer";
// import DoneAllIcon from "@mui/icons-material/DoneAll";
// import InputAdornment from "@mui/material/InputAdornment";

export default function EditProfileForm(props) {

    const {open, setOpen} = props

    const state = useAuthState()
    const dispatch = useAuthDispatch()
    const user = state.user
    const [username, setUsername] = useState('')
    const [firstname, setFirstname] = useState('')
    const [lastname, setLastname] = useState('')
    const [email, setEmail] = useState('')
    const [usernameErrorMessage, setUsernameErrorMessage] = useState(null);
    const [emailErrorMessage, setEmailErrorMessage] = useState(null);


    const [message, setMessage] = useState('')
    const [updatePending, setUpdatePending] = useState(false)

    useEffect(() => {
        setUsername(user.username)
        setFirstname(user.firstname)
        setLastname(user.lastname)
        setEmail(user.email_address)
    }, [user])
    const handleClose = () => {
        setOpen(false)
    }

    const validateInputUsername = async () => {
        if (username === user.username) {
            setUsernameErrorMessage(null)
            return
        }
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
        if (email === user.email_address) {
            setEmailErrorMessage(null)
            return
        }
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


    const submitUpdate = async () => {
        setUpdatePending(true)
        const url = UPDATE_PROFILE_URL
        const payload = {username, first_name: firstname, last_name: lastname}
        if (user.email_address !== email) {
            payload.email = email
        }
        try {
            const req = await fetcher({url, payload, credentials: true})
            if (req.result === true) {
                const user = req.user
                dispatch({type: authTypes.LOGIN_SUCCESS, payload: {user}});
                setMessage('Profile updated')
                setOpen(false)
            }
            else{
                setMessage(req.details)
            }
        } catch (e) {
            console.log(e)
        }
        setUpdatePending(false)
    }

    return (
        <>
            <Snackbar
                anchorOrigin={{vertical: 'top', horizontal: 'center'}}
                open={!!message}
                onClose={() => setMessage(null)}
                message={message}/>
            <Dialog open={open} onClose={handleClose}>
                <DialogTitle>Edit Profile</DialogTitle>
                <DialogContent>
                    <DialogContentText m={1.5}>
                        Update your profile
                    </DialogContentText>
                    <Box component="form" sx={{mt: 1, flexDirection: 'column'}}>
                        <TextField
                            fullWidth
                            required
                            label="Username"
                            name="username"
                            margin="normal"
                            value={username}
                            onBlur={validateInputUsername}
                            error={usernameErrorMessage !== null}
                            helperText={usernameErrorMessage}
                            onChange={(e) => setUsername(e.target.value)}/>
                        <TextField
                            label="Firstname"
                            name="firstname"
                            margin="normal"
                            value={firstname}
                            onChange={(e) => setFirstname(e.target.value)}/>
                        <TextField
                            label="Lastname"
                            name="lastname"
                            margin="normal"
                            value={lastname}
                            onChange={(e) => setLastname(e.target.value)}/>
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
                        <Typography variant="caption">Changing email require verification</Typography>
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose}>Cancel</Button>
                    <LoadingButton
                        disabled={!!emailErrorMessage || !!usernameErrorMessage || (user.username === username && user.firstname === firstname && user.lastname === lastname && user.email_address === email)}
                        loading={updatePending}
                        onClick={submitUpdate}>Update profile</LoadingButton>

                </DialogActions>
            </Dialog>
        </>
    )
}