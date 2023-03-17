import {Grid, Typography} from "@mui/material";
import FileCard from "./FileCard";
import {useEffect, useState} from "react";
import {BASE_URL, CURRENT_USER_KEY} from "../utils/constants";
import {fetcher} from "../utils/fetch_utils";

export default function RecentFiles() {
    const [recentFiles, setRecentFiles] = useState([])

    const loadRecentFiles = async () => {
        const user = JSON.parse(localStorage.getItem(CURRENT_USER_KEY))
        if (Boolean(user)) {
            const url = BASE_URL + "/audio/get_my_files?user_id=" + user.user_id
            const req = await fetcher({url, method: "GET"})
            console.log(req)
            if (req.result === true) {
                setRecentFiles(req.files)
            }
        }
    }

    useEffect(() => {
        document.title = 'SounDream | Home'
        loadRecentFiles()
    }, [])

    return (
        <div>
            <Typography variant={"h5"}>Recent files</Typography>
            {recentFiles && recentFiles.length > 0 ? (
                <Grid container ml={4} mr={4}>
                    {recentFiles.map(file => {
                        return (
                            <Grid item key={file.file_id}>
                                <FileCard file={file}/>
                            </Grid>
                        )
                    })}
                </Grid>
            ) : (
                <div> start creating your library with recording voice, loading audio from your PC or downloading
                    sound!</div>)}
        </div>
    )
}