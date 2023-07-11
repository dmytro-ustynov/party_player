import Typography from "@mui/material/Typography";
import React, {useEffect, useState} from "react";
import {useAuthState} from "./context";
import {Button, Divider, Paper} from "@mui/material";
import {Chart as ChartJS, ArcElement, Tooltip, Legend} from "chart.js";
import {Doughnut} from "react-chartjs-2";
import Stack from "@mui/material/Stack";
import {useAudioState} from "../audio/audioReducer";
import IconButton from "@mui/material/IconButton";
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import Link from "@mui/material/Link";


const usedFilesChart = {
    labels: [
        'Files Used',
        'Free space'
    ],
    datasets: [{
        label: 'Total Files',
        data: [],
        backgroundColor: [
            'rgb(255, 99, 132)',
            'rgb(255, 205, 86)'
        ],
        hoverOffset: 4
    }]
};
const colors = {
    mp3: 'rgb(255, 99, 132)',
    wav: 'rgb(54, 162, 235)',
    webm: 'rgb(255, 205, 86)',
    flac: 'rgb(14,97,255)',
    aac: 'rgb(14,255,211)',
    ogg: 'rgb(66,255,14)',
}


ChartJS.register(ArcElement, Tooltip, Legend);

export default function FilesStatictics() {
    const state = useAuthState()
    const user = state.user
    const tierDetails = user.tier_details
    const {audio, dispatch} = useAudioState()
    const files = audio.files
    const fileTypes = {mp3: 0, webm: 0, wav: 0, flac: 0, wma: 0, aac: 0, ogg: 0}
    const fileTypeChart = {
        labels: [],
        datasets: [{
            label: 'File types',
            data: [],
            backgroundColor: [],
            hoverOffset: 4
        }]
    };

    const renderedList = []

    useEffect(() => {
        tierDetails.formats.forEach(f => fileTypes[f] = 0)
        const freeSpace = tierDetails.max_files - files.length
        usedFilesChart.datasets[0].data = [files.length, freeSpace]
    }, [files.length])

    files.forEach((f, n) => {
        fileTypes[f.ext] += 1
        renderedList.push(<tr
            key={f.id}>
            <td>{n + 1}.</td>
            <td style={{textAlign: 'start'}}><Link onClick={()=>{
                navigate('/redactor?file_id='+f.id)
            }}>{f.filename} </Link></td>
            <td style={{color: colors[f.ext]}}>{f.ext}</td>
            <td><IconButton>
                <DeleteForeverIcon fontSize="small"/>
            </IconButton></td>
        </tr>)
    })
    let fileTypeLabels = []
    let chartColors = []
    let fileNumbers = []
    for (const [k, v] of Object.entries(fileTypes)) {
        if (v !== 0) {
            fileTypeLabels.push(k)
            chartColors.push(colors[k])
            fileNumbers.push(v)
        }
    }
    fileTypeChart.datasets[0].data = fileNumbers
    fileTypeChart.labels = fileTypeLabels
    fileTypeChart.datasets[0].backgroundColor = chartColors

    return (
        <>
            <Typography variant="h6">Manage my files</Typography>
            <Stack direction="row" spacing={2} sx={{mb: 2}}>
                <Paper>
                    <Typography>Used space</Typography>
                    <Divider/>
                    <Doughnut data={usedFilesChart}/>
                    <Button variant="contained" sx={{m: 2}}
                            color="success"> Get more space </Button>
                </Paper>
                <Paper>
                    <Typography>File types</Typography>
                    <Divider/>
                    <Doughnut data={fileTypeChart}/>
                    <Button variant="contained" sx={{m: 2}}
                            color="success">Unlock more types </Button>
                </Paper>
            </Stack>
            <Paper>
                List of files:
                <table>
                    <thead></thead>
                    <tbody>
                    {renderedList}
                    </tbody>

                </table>
            </Paper>
        </>
    )
}
