import Header from "../components/Header";
import Footer from "../components/Footer";
import {useAudioState} from "../components/audio/audioReducer";
import {useEffect, useState} from "react";
import Link from "@mui/material/Link";
import {useNavigate} from "react-router-dom";
import {BASE_URL} from "../utils/constants";
import {fetcher} from "../utils/fetch_utils";
import {Grid, TextField} from "@mui/material";
import {Table, TableBody, TableCell, TableRow} from "@mui/material";

const FONT_SIZE = 9
const DEFAULT_INPUT_WIDTH = 200

export default function RedactorPage() {
    const {audio} = useAudioState()
    const [filename, setFilename] = useState('')
    const [info, setInfo] = useState({})
    const [inputWidth, setInputWidth] = useState(200)
    const sound = audio.sound
    const navigate = useNavigate()

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
            console.log(req)

        }
        document.title = 'SounDream | Redactor'
        loadInfo()
    }, [sound])

    return (
        <>
            <Header/>
            <div className='content'>
                {sound ? (<>

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
                            <Grid container>
                                <Grid item>
                                    <Table className={"table-item-info"} size="small">
                                        <TableBody>
                                            {Object.entries(info).map(([key, value], number) => {
                                                let forbiddenKeys = ["updated_at", "file_path", "user_id"]
                                                return (
                                                    !forbiddenKeys.includes(key) &&
                                                    (<TableRow key={`${key}-${number}`}>
                                                        <TableCell> {key} </TableCell>
                                                        {key === 'thumbnail' ?
                                                            <TableCell>
                                                                <img src={value}
                                                                     style={{maxWidth: "320px"}}/>
                                                            </TableCell> :
                                                            (<TableCell> {value} </TableCell>)}
                                                    </TableRow>)
                                                )
                                            })}
                                        </TableBody>
                                    </Table>

                                </Grid>
                            </Grid>
                        </>
                    ) :
                    (
                        <p>
                            you should select sound
                            <Link to={'/'} onClick={() => navigate('/')}>Home</Link>
                        </p>
                    )
                }
            </div>
            <Footer/>
        </>

    )
}