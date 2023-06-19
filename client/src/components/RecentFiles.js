import {Grid, Typography} from "@mui/material";
import FileCard from "./FileCard";
import {useEffect} from "react";
import {BASE_URL, CURRENT_USER_KEY} from "../utils/constants";
import {fetcher} from "../utils/fetch_utils";
import {useAudioState} from "./audio/audioReducer";
import {AudioAction} from "./audio/actions";
import {Roles, useAuthState} from "./auth/context";
import Link from "@mui/material/Link";

export default function RecentFiles() {
    const {audio, dispatch} = useAudioState()
    const files = audio.files
    const state = useAuthState()
    const user = state.user

    useEffect(() => {
        const loadRecentFiles = async () => {
            const user = JSON.parse(localStorage.getItem(CURRENT_USER_KEY))
            if (Boolean(user)) {
                const url = BASE_URL + "/audio/get_my_files"
                const req = await fetcher({url, method: "GET", credentials: true})
                if (req.result === true) {
                    dispatch({type: AudioAction.SET_FILES, files: req.files})
                }
            }
        }
        loadRecentFiles()
    }, [dispatch])

    return (
        <div style={{justifyContent: 'center'}}>
            <Typography variant={"h5"}>Recent files</Typography>
            {files && files.length > 0 ? (
                <>
                    {user.role === Roles.ANONYMOUS && (
                        <Typography><Link href={'/register'}>Register</Link>, if you don't want to loose your
                            files</Typography>)}
                    <Grid container ml={4} mr={4} sx={{display: 'flex', maxWidth: '75%'}}>
                        {files.map(file => {
                            return (
                                <Grid item key={file.file_id} m={1} sx={{flex: "1 0 18%"}}>
                                    <FileCard file={file}/>
                                </Grid>
                            )
                        })}
                    </Grid>
                </>
            ) : (
                <div> Start creating your library with recording voice, loading audio from your PC or downloading
                    sound!</div>)
            }
        </div>
    )
}