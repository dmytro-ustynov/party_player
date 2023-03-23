import {Divider, Grid, Typography} from "@mui/material";
import Box from "@mui/material/Box";

export default function FileInfo(props) {
    const {info} = props

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
                    {info.thumbnail && <div><img src={info.thumbnail} alt={'thumb'}
                                                 style={{maxWidth: "320px"}}/></div>}
                    <Typography variant="body1">File id: {info.file_id}</Typography>
                </Box>
            </Grid>
        </Grid>
    )
}