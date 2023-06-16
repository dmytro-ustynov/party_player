import {Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle} from "@mui/material";
import KeyIcon from "@mui/icons-material/Key";
import PasswordField from "./passwordField";
import LoadingButton from "@mui/lab/LoadingButton";
import React, {useEffect, useState} from "react";
import {CHANGE_PASSWORD_URL} from "../../utils/constants";
import {fetcher} from "../../utils/fetch_utils";
import Snackbar from "@mui/material/Snackbar";

export default function PasswordChangeForm(props) {

    const {open, setOpen} = props
    const [oldPassword, setOldPassword] = useState('')
    const [password, setPassword] = useState('')
    const [password2, setPassword2] = useState('')
    const [oldPasswordErrorMessage, setOldPasswordErrorMessage] = useState(null)
    const [passwordErrorMessage, setPasswordErrorMessage] = useState(null)
    const [passwordChangePending, setPasswordChangePending] = useState(false)
    const [message, setMessage] = useState('')

    useEffect(() => {
        if (password !== password2) {
            setPasswordErrorMessage('Passwords should match')
        } else if (password.length < 5) {
            setPasswordErrorMessage('Password must be at least 5 characters long')
        } else if (!!password && password === oldPassword) {
            setPasswordErrorMessage('New password should be other than old one')
        } else {
            setPasswordErrorMessage(null)
        }
    }, [password, password2, oldPassword])

    const handleClose = () => {
        setOpen(false)
        setPassword('')
        setPassword2('')
        setOldPassword('')
        setOldPasswordErrorMessage(null)
        setPasswordChangePending(false)

    }
    const submitPasswordUpdate = async () => {
        const url = CHANGE_PASSWORD_URL
        if (password.length > 0) {
            if (!passwordErrorMessage) {
                setPasswordChangePending(true)
                const payload = {
                    password,
                    old_password: oldPassword,
                    password_confirm: password2
                }
                try {
                    const req = await fetcher({url, payload, credentials: true})
                    if (req.result === true) {
                        setMessage('Password was changed')
                        handleClose()
                    } else {
                        setOldPasswordErrorMessage(req.details)
                        // setMessage(req.details)
                    }
                } catch (e) {
                    console.log(e)
                }
                setPasswordChangePending(false)
            }
        }
    }
    const sx = {width: '320px', height: '70px', margin: '8px'}

    return (
        <>
            <Snackbar
                anchorOrigin={{vertical: 'top', horizontal: 'center'}}
                open={!!message}
                onClose={() => setMessage(null)}
                message={message}/>
            <Dialog open={open} onClose={handleClose}>
                <DialogTitle>Change your password <KeyIcon/></DialogTitle>
                <DialogContent>
                    <DialogContentText m={1.5}>
                        To change your password enter old one, new one and confirm it.
                    </DialogContentText>
                    <form>
                        <PasswordField label="Old Password"
                                       sx={sx}
                                       value={oldPassword}
                            // fullwidth={true}
                                       error={!!oldPasswordErrorMessage}
                                       errorMessage={oldPasswordErrorMessage    }
                                       setValue={setOldPassword}/>
                        <br/>
                        <PasswordField label="Password"
                                       value={password}
                                       sx={sx}
                            // fullwidth={true}
                                       setValue={setPassword}/>
                        <br/>
                        <PasswordField label="Confirm password"
                                       value={password2}
                                       sx={sx}
                                       fullwidth={true}
                                       setValue={setPassword2}
                                       error={!!passwordErrorMessage && !!password}
                                       errorMessage={passwordErrorMessage}/>
                    </form>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose}>Cancel</Button>
                    <LoadingButton
                        disabled={!!passwordErrorMessage || !oldPassword}
                        loading={passwordChangePending}
                        onClick={submitPasswordUpdate}>Change password</LoadingButton>

                </DialogActions>
            </Dialog>
        </>
    )
}