import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    Grid,
    Paper,
    TextField
} from "@mui/material";
import IconButton from "@mui/material/IconButton";
import YouTubeIcon from "@mui/icons-material/YouTube";
import {useState} from "react";
import LoadingButton from "@mui/lab/LoadingButton";
import {YOUTUBE_LOAD_URL} from "../utils/constants";
import {fetcher} from "../utils/fetch_utils";

export default function YouTuber(props) {
    const {btnProps} = props
    const [open, setOpen] = useState(false);
    const [link, setLink] = useState('');
    const [disabled, setDisabled] = useState(true);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleClose = () => {
        setOpen(false);
        setLink('')
        setError('')
        setDisabled(true)
    };
    const handleLinkInput = (event) => {
        const checkUrl = (url) => {
            // Regular expression to match YouTube video URLs
            const regExp = /^(http(s)?:\/\/)?((w){3}.)?youtu(be|.be)?(\.com)?\/.+$/;
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
    const handleDownloadClick = async () => {
        setLoading(true)
        const url = YOUTUBE_LOAD_URL + link
        const req = await fetcher({url, method: "GET", credentials: true})
        if (req.result === true){
            console.log('download complete : ')
            setOpen(false)
            // post load logic
            window.location.replace('/')
        } else {
            console.log('error loading')
        }
        console.log(req)
        setLoading(false)
        handleClose()
    }

    return (
        <Grid item sx={{width: '16rem', height: '16rem'}} >
            <Paper   sx={{m: 1, p: 1,}} elevation={5}>
                <IconButton title={"Load sound from Youtube"} onClick={() => setOpen(true)}>
                    <YouTubeIcon {...btnProps} color='error'/>
                </IconButton>
            </Paper>
            <Dialog open={open} onClose={handleClose}>
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
        </Grid>
    )
}