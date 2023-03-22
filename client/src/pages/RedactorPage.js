import {useEffect, useState} from "react";
import {useNavigate} from "react-router-dom";
import Link from "@mui/material/Link";
import {
    Button,
    CircularProgress,
    Divider,
    Grid,
    ListItemIcon,
    ListItemText,
    Menu,
    MenuItem,
    Stack,
    TextField, Typography
} from "@mui/material";
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import ShareIcon from '@mui/icons-material/Share';
import DownloadIcon from '@mui/icons-material/Download';
import DeleteIcon from '@mui/icons-material/Delete';
import Header from "../components/Header";
import Footer from "../components/Footer";
import FileInfo from "../components/FileInfo";
import {useAudioState} from "../components/audio/audioReducer";
import {BASE_URL, SAVEAS_URL} from "../utils/constants";
import {fetcher, download} from "../utils/fetch_utils";

const FONT_SIZE = 9
const DEFAULT_INPUT_WIDTH = 200

export default function RedactorPage() {
    const {audio} = useAudioState()
    const [filename, setFilename] = useState('')
    const [info, setInfo] = useState({})
    const [inputWidth, setInputWidth] = useState(200)
    const sound = audio.sound
    const navigate = useNavigate()
    const [anchorFileEl, setAnchorFileEl] = useState(null);
    const openFileSubmenu = Boolean(anchorFileEl);
    const [downloading, setDownloading] = useState(false)
    const handleFileClick = (event) => {
        setAnchorFileEl(event.currentTarget);
    };
    const handleFileClose = () => {
        setAnchorFileEl(null);
    };

    useEffect(() => {
        if (filename.length * FONT_SIZE > DEFAULT_INPUT_WIDTH) {
            setInputWidth((filename.length + 1) * FONT_SIZE)
        } else {
            setInputWidth(DEFAULT_INPUT_WIDTH)
        }
    }, [filename])

    useEffect(() => {
        const loadInfo = async () => {
            const url = BASE_URL + '/audio/?file_id=' + sound
            const req = await fetcher({url, method: "GET"})
            setInfo(req)
            setFilename(req.filename)
        }
        document.title = 'SounDream | Redactor'
        if (sound) {
            loadInfo()
        }
    }, [sound])
    const styles = {
        btn: {
            variant: "text",
            color: "secondary"
        }
    }
    const saveAsFile = async (format) => {
        setDownloading(true)
        const url = SAVEAS_URL
        const data = {'file_id': sound, 'format': format}
        const file = await fetcher({url, payload: data, credentials: true, asFile: true})
        if (file instanceof Blob) {
            const name = filename.split('.')[0]
            download(file, `${name}.${format}`)
        } else {
            console.log(file)
        }
        setDownloading(false)
    }
    const saveAsMP3 = () => {
        setDownloading(true)
        saveAsFile('mp3')
        handleFileClose()
    }
    const saveAsWAV = () => {
        setDownloading(true)
        saveAsFile('wav')
        handleFileClose()
    }
    const saveAsFLAC = () => {
        setDownloading(true)
        saveAsFile('flac')
        handleFileClose()
    }
    return (
        <>
            <Header/>
            <div className="content">
                {sound ? (<>
                        <div className="file-menu">
                            <Stack direction="row" spacing={4}>
                                <span style={{minWidth: "40px", minHeight: "45px"}}>
                                    {downloading && <CircularProgress color='secondary'/>}
                                </span>
                                <Button {...styles.btn}
                                        onClick={handleFileClick}
                                        endIcon={<KeyboardArrowDownIcon/>}>
                                    File
                                </Button>
                                <Button {...styles.btn} endIcon={<KeyboardArrowDownIcon/>}>Effects</Button>
                                <Button {...styles.btn} endIcon={<KeyboardArrowDownIcon/>}>Help</Button>

                            </Stack>
                            <Menu
                                id="basic-menu"
                                sx={{width: 320, maxWidth: '100%'}}
                                anchorEl={anchorFileEl}
                                open={openFileSubmenu}
                                onClose={handleFileClose}
                                MenuListProps={{
                                    'aria-labelledby': 'basic-button',
                                }}>
                                <MenuItem onClick={saveAsMP3} disabled={downloading}>
                                    <ListItemIcon>
                                        <DownloadIcon fontSize="small"/>
                                    </ListItemIcon>
                                    <ListItemText>Save as MP3</ListItemText>
                                </MenuItem>
                                <MenuItem onClick={saveAsWAV} disabled={downloading}>
                                    <ListItemIcon>
                                        <DownloadIcon fontSize="small"/>
                                    </ListItemIcon>
                                    <ListItemText>Save as WAV</ListItemText>
                                </MenuItem>
                                <MenuItem onClick={saveAsFLAC} disabled={downloading}>
                                    <ListItemIcon>
                                        <DownloadIcon fontSize="small"/>
                                    </ListItemIcon>
                                    <ListItemText>Save as FLAC</ListItemText>
                                </MenuItem>

                                <MenuItem onClick={handleFileClose} disabled={downloading}>
                                    <ListItemIcon>
                                        <DeleteIcon fontSize="small"/>
                                    </ListItemIcon>
                                    <ListItemText>Delete</ListItemText>
                                </MenuItem>
                                <Divider/>
                                <MenuItem onClick={handleFileClose}>
                                    <ListItemIcon>
                                        <ShareIcon fontSize="small"/>
                                    </ListItemIcon>
                                    <ListItemText>Share</ListItemText>
                                </MenuItem>
                            </Menu>
                        </div>

                        <Grid container>
                            <Grid item>
                                <TextField value={filename}
                                           InputProps={{
                                               style: {width: `${inputWidth}px`},
                                           }}
                                           fullWidth
                                           variant='standard' sx={{width: '300px'}}/>
                            </Grid>
                        </Grid>
                        <FileInfo info={info}/>
                    </>
                ) : (<span>
                            <p>you should select sound </p>
                            <Link to={'/'} onClick={() => navigate('/')} sx={{cursor: 'pointer'}}> Home</Link>
                        </span>)
                }
            </div>
            <Footer/>
        </>
    )
}