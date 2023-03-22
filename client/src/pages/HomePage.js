import Footer from "../components/Footer";
import Header from "../components/Header";
import {
    Grid,
    TextField,
} from "@mui/material";
import SearchIcon from '@mui/icons-material/Search';

import IconButton from '@mui/material/IconButton';
import YouTuber from "../components/YouTuber";
import RecentFiles from "../components/RecentFiles";
import FileUploader from "../components/FileUploader";
import {useEffect} from "react";
import MicRecorder from "../components/MicRecorder";

export default function HomePage() {
    const styles = {
        btn: {
            color: 'primary',
            sx: {
                fontSize: "10rem",
                borderRadius: "5rem",
            }
        },
        grid: {
            sx: {width: '16rem'}
        },
        paper: {
            sx: {
                m: 1,
                p: 1,
                borderRadius: "0.8rem",
            },
            elevation: 6
        }
    }
    useEffect(() => {
        document.title = 'SounDream | Home'
    }, [])

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
                    {/* grid item root element for each child below: */}
                    <MicRecorder styles={styles}/>
                    <FileUploader styles={styles}/>
                    <YouTuber styles={styles}/>
                </Grid>
                <RecentFiles/>
            </div>
            <Footer/>
        </>
    )
}