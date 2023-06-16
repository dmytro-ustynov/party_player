import Typography from "@mui/material/Typography";
import {Roles, useAuthState} from "./context";
import {
    Box,
    Button, Card, CardContent, CardHeader,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle, Divider,
    Fab,
    IconButton,
    Paper,
    Stack, Table, TableCell, TableRow,
    TextField
} from "@mui/material";
import {useEffect, useState} from "react";
import ForwardToInboxIcon from '@mui/icons-material/ForwardToInbox';
import {BASE_URL} from "../../utils/constants";
import KeyIcon from "@mui/icons-material/Key";
import PasswordChangeForm from "./PasswordChangeForm";

export default function AccountInfo() {
    const state = useAuthState()
    const user = state.user

    const [openPasswordDialog, setOpenPasswordDialog] = useState(false)

    useEffect(() => {
        console.log(user)
    }, [])


    return (
        <div>
            <PasswordChangeForm
                userId={user.user_id}
                open={openPasswordDialog}
                setOpen={setOpenPasswordDialog}/>
            <Typography variant="h5">Account settings</Typography>
            <Stack direction="row" spacing={2}>
                <Paper elevation={3} sx={{width: '35vmin'}}>
                    <Typography variant="h6">Personal</Typography>
                    <Table>
                        <TableRow>
                            <TableCell align="left"><Typography variant="subtitle">Username</Typography></TableCell>
                            <TableCell align="left">{user.username}</TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell align="left"><Typography variant="subtitle">Firstname</Typography></TableCell>
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
                            <TableCell align="center">
                                {user.email_verified ? <div>verified</div> :
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
                                        onClick={()=>setOpenPasswordDialog(true)}
                                        startIcon={<KeyIcon />}>Change </Button>
                            </TableCell>

                        </TableRow>
                    </Table>


                </Paper>
                <Paper elevation={3} sx={{width: '35vmin'}}>
                    <Typography variant="h6">Tier</Typography>
                    <Typography variant="h6">{user.tier}</Typography>
                    <Button variant="outlined">Change tier</Button>
                </Paper>
            </Stack>

        </div>
    )
}