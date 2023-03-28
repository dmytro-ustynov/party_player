import {Button, Divider, Grid, Typography} from "@mui/material";
import Box from "@mui/material/Box";
import {useAudioState} from "./audio/audioReducer";

export default function FileInfo() {

    const {audio} = useAudioState()
    const info = audio.info

    return (
        <Grid container>
            <Grid item>
                <Box className={"table-item-info"} size="small">
                    <Typography variant="h5">File Details</Typography>
                    <Divider/>
                    <Typography variant="h6">{info.title}</Typography>
                    <Typography variant="body1">{info.filename}</Typography>
                    <Typography variant="body1">ext: {info.ext}</Typography>
                    <Typography variant="body1">Duration: {info.duration} sec</Typography>
                    {info.thumbnail ? <Button component="label">
                            <input hidden accept="image/*" type="file"/>
                            <img src={info.thumbnail} alt='thumb' style={{maxWidth: "320px"}}/>
                        </Button> :
                        <Button variant="outlined" component="label" title="Click to change thumbnail">
                            thumbnail
                            <input hidden accept="image/*" type="file"/>
                        </Button>}

                    <Typography variant="body2">File ID: {info.file_id}</Typography>
                </Box>
            </Grid>
        </Grid>
    )
}