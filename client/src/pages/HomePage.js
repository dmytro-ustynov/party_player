import Footer from "../components/Footer";
import Header from "../components/Header";
import {
    Grid,
    Paper,
    TextField,
} from "@mui/material";
import MicIcon from '@mui/icons-material/Mic';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import SearchIcon from '@mui/icons-material/Search';

import IconButton from '@mui/material/IconButton';
import YouTuber from "../components/YouTuber";
import RecentFiles from "../components/RecentFiles";


export default function HomePage() {

    const btnProps = {
        color: "primary",
        sx: {
            fontSize: "10rem",
            borderRadius: "5rem",
        }
    }

    return (
        <>
            <Header/>
            <div className='content'>
                <Grid container justifyContent="center" alignItems="center" pt={4}>
                    <Grid item>
                        <TextField label="Search" variant="standard" sx={{fontSize: '2rem'}}/>
                        <IconButton>
                            <SearchIcon sx={{fontSize: '2rem'}}/>
                        </IconButton>
                    </Grid>
                </Grid>
                <Grid container justifyContent="center" p={3}>
                    <Grid item>
                        <Paper
                            sx={{m: 2, p: 4,}}
                            elevation={5}>
                            <IconButton title={"Start recording"}>
                                <MicIcon {...btnProps} />
                            </IconButton>
                        </Paper>
                    </Grid>
                    <Grid item>
                        <Paper sx={{m: 2, p: 4}} elevation={5}>
                            <IconButton title={"Add audio file"}>
                                <AddCircleOutlineIcon {...btnProps}/>
                            </IconButton>
                        </Paper>
                    </Grid>
                    {/* grid item root element */}
                    <YouTuber btnProps={btnProps}/>
                </Grid>
                <RecentFiles />
            </div>
            <Footer/>
        </>
    )
}