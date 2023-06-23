import Typography from "@mui/material/Typography";
import {useAuthState} from "./context";
import {
    Button,
    Paper,
    Stack, Table, TableCell, TableRow, TableBody, Chip
} from "@mui/material";
import {useState} from "react";
import ForwardToInboxIcon from '@mui/icons-material/ForwardToInbox';
import KeyIcon from "@mui/icons-material/Key";
import DoneAllIcon from '@mui/icons-material/DoneAll';
import PasswordChangeForm from "./PasswordChangeForm";

export default function AccountInfo() {
    const state = useAuthState()
    const user = state.user
    // console.log(user)
    const tier = user.tier
    const tierDetails = user.tier_details
    console.log(tierDetails)

    const [openPasswordDialog, setOpenPasswordDialog] = useState(false)

    return (
        <div>
            <PasswordChangeForm
                open={openPasswordDialog}
                setOpen={setOpenPasswordDialog}/>
            <Typography variant="h5">Account settings</Typography>
            <Stack direction="row" spacing={2}>
                <Paper elevation={3} sx={{width: '35vmin'}}>
                    <Typography variant="h6">Personal</Typography>
                    <Table>
                        <TableBody>
                            <TableRow>
                                <TableCell align="left"><Typography variant="subtitle">Username</Typography></TableCell>
                                <TableCell align="left">{user.username}</TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell align="left"><Typography
                                    variant="subtitle">Firstname</Typography></TableCell>
                                <TableCell align="left">{user.firstname}</TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell align="left"><Typography variant="subtitle">Lastname</Typography></TableCell>
                                <TableCell align="left">{user.lastname}</TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell align="left"><Typography variant="subtitle">Email</Typography></TableCell>
                                <TableCell align="left">{user.email_address}</TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell align="left"><Typography variant="subtitle">Email
                                    verification</Typography></TableCell>
                                <TableCell align="left">
                                    {user.email_verified ?
                                        <div>verified &nbsp;<DoneAllIcon color={'primary'} m={1}/></div> :
                                        <><Button color="success"
                                                  variant="outlined"
                                                  startIcon={<ForwardToInboxIcon/>}
                                                  title="Send Verification Email"> Verify</Button></>}
                                </TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell>Password</TableCell>
                                <TableCell align="center">
                                    <Button variant="outlined"
                                            onClick={() => setOpenPasswordDialog(true)}
                                            startIcon={<KeyIcon/>}>Change </Button>
                                </TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                </Paper>
                <Paper elevation={3} sx={{width: '35vmin'}}>
                    <Typography variant="h6">Tier</Typography>
                    <Table>
                        <TableBody>
                            <TableRow>
                                <TableCell align="center" colSpan={2}>
                                    <Chip label={tier.toUpperCase()} color="primary"/>
                                </TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell align="left"><Typography variant="subtitle">File
                                    Limit</Typography></TableCell>
                                <TableCell align="left">{tierDetails.max_files}</TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell align="left"><Typography variant="subtitle">Microphone duration,
                                    sec</Typography></TableCell>
                                <TableCell align="left">{tierDetails.mic_length}</TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell align="left"><Typography variant="subtitle">Available
                                    formats</Typography></TableCell>
                                <TableCell align="left">
                                    {tierDetails.formats.map(ext => {
                                        return (
                                            <Chip color="success" variant="outlined" label={ext}/>
                                        )
                                    })}
                                </TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell colspan={2} align='center'>
                                    <Button variant="outlined">Change tier</Button>
                                </TableCell>
                            </TableRow>
                        </TableBody></Table>
                </Paper>
            </Stack>

        </div>
    )
}