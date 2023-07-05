import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    Grid,
    Paper,
    TextField, Typography
} from "@mui/material";
import IconButton from "@mui/material/IconButton";
import YouTubeIcon from "@mui/icons-material/YouTube";
import React, {useState} from "react";
import LoadingButton from "@mui/lab/LoadingButton";
import {YOUTUBE_LOAD_URL} from "../utils/constants";
import {fetcher} from "../utils/fetch_utils";
import {useAudioState} from "./audio/audioReducer";
import {AudioAction} from "./audio/actions";
import Snackbar from "@mui/material/Snackbar";
import ytDownloadScreen from "../images/Youtube_download_screenshot.png"
import {Roles, useAuthState} from "./auth/context";

export default function YouTuber(props) {
    const {styles} = props
    const [openDownloadDialog, setOpenDownloadDialog] = useState(false);
    const [openRegisterDialog, setOpenRegisterDialog] = useState(false);
    const [link, setLink] = useState('');
    const [disabled, setDisabled] = useState(true);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('')
    const {dispatch} = useAudioState()
    const state = useAuthState()
    const user = state.user

    const handleClose = () => {
        setOpenDownloadDialog(false);
        setLink('')
        setError('')
        setDisabled(true)
    };
    const handleLinkInput = (event) => {
        const checkUrl = (url) => {
            // Regular expression to match YouTube video URLs
            const regExp = /^(http(s)?:\/\/)?((w){3}.)?(music.)?youtu(be|.be)?(\.com)?\/.+$/;
            // Test the string against the regular expression
            return regExp.test(url);
        }
        const ytLink = event.target.value
        setLink(ytLink)
        if (!checkUrl(ytLink)) {
            setDisabled(true)
            setError("Not valid YouTube link")
            return
        }
        setError(null)
        setDisabled(false)
    }
    const handleYouTubeClick = () => {
        console.log(user)
        if (user.role === Roles.ANONYMOUS) {
            setOpenRegisterDialog(true)
        } else {
            setOpenDownloadDialog(true)
        }
    }

    const handleDownloadClick = async () => {
        setLoading(true)
        const url = YOUTUBE_LOAD_URL + link
        const req = await fetcher({url, method: "GET", credentials: true})
        if (req.result === true) {
            // console.log('download complete : ')
            setMessage('download complete')
            setOpenDownloadDialog(false)
            // post load logic
            dispatch({type: AudioAction.ADD_FILE, file: req.file})
        } else {
            console.log('error loading')
        }
        console.log(req)
        setLoading(false)
        handleClose()
    }

    return (
        <Grid item {...styles.grid} >
            <Paper {...styles.paper}>
                <IconButton title={"Load sound from Youtube"} onClick={handleYouTubeClick}>
                    <YouTubeIcon {...styles.btn} color='error'/>
                </IconButton>
            </Paper>
            <Snackbar
                anchorOrigin={{vertical: 'top', horizontal: 'center'}}
                open={!!message}
                onClose={() => setMessage(null)}
                message={message}/>
            <Dialog open={openDownloadDialog} onClose={handleClose}>
                <DialogTitle>Download sound from Youtube video</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        To load sound from Youtube video paste a proper link here:
                    </DialogContentText>
                    <TextField
                        autoFocus
                        fullWidth
                        label="Youtube Link"
                        error={Boolean(error)}
                        helperText={error}
                        value={link}
                        onChange={handleLinkInput}
                        margin="dense"
                        variant="standard"
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose}>Cancel</Button>
                    <LoadingButton
                        disabled={disabled}
                        loading={loading}
                        onClick={handleDownloadClick}>Download</LoadingButton>
                </DialogActions>
            </Dialog>
            <Dialog open={openRegisterDialog} onClose={() => setOpenRegisterDialog(false)}>
                <DialogTitle>Register</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Downloading from Youtube option is available for registered Users.
                    </DialogContentText>
                    <Typography>That's what you will see here: </Typography>
                    <div style={{display: 'flex', justifyContent: 'center', marginTop: '1em'}}>
                        <img src={ytDownloadScreen} alt="img" width="320px"/>
                    </div>

                    <Typography variant="h5">Why should you register today? </Typography>
                    <Typography>Compare different Tiers and discover benefits you can get!</Typography>
                    <div style={{display: 'flex', justifyContent: 'center', marginTop: '1em'}}>
                        <Button href='welcome#tiers' variant="contained" color="success">Compare</Button>
                    </div>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenRegisterDialog(false)}>Cancel</Button>
                    <Button href="register" variant="contained">Register</Button>
                </DialogActions>
            </Dialog>
        </Grid>
    )
}