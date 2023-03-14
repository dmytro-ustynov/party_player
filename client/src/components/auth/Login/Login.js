import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import {
    Button,
    Divider,
    Fade,
    IconButton,
    Menu,
    MenuItem,
    Tooltip,
} from "@mui/material";
import {useState} from "react";
import {Roles, useAuthDispatch, useAuthState} from "../context";
import {logout} from "../actions";


export default function Login() {
    const state = useAuthState()
    const user = state.user
    const dispatch = useAuthDispatch()

    const [anchorEl, setAnchorEl] = useState(null);
    const open = Boolean(anchorEl);
    const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
    };
    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleLogout = async () => {
        handleClose()
        logout(dispatch)
    }

    return (
        <div className="header-right-menu">

            {user.role === Roles.ANONYMOUS ? (
                <>
                    <Tooltip title='Register new user'>
                        <Button sx={{ml: 2}}
                                href="register"
                                variant="outlined">Register</Button>
                    </Tooltip>
                    <Tooltip title='Already registered? Please sign up'>
                        <Button sx={{ml: 2}}
                                href="/login"
                                variant="contained">Login</Button>
                    </Tooltip>
                </>) : (<Tooltip title="Account settings">
                <IconButton sx={{ml: 2}}
                            onClick={handleClick}
                            color="primary">
                    <AccountCircleIcon
                        sx={{width: 32, height: 32}}
                        color="primary"/>
                </IconButton>
            </Tooltip>)}
            <Menu
                id="fade-menu"
                MenuListProps={{
                    'aria-labelledby': 'fade-button',
                }}
                anchorEl={anchorEl}
                open={open}
                onClose={handleClose}
                TransitionComponent={Fade}
            >
                <p style={{padding: "5px"}}>Signed as <strong>{user.username}</strong></p>
                <MenuItem onClick={handleClose}>Profile</MenuItem>
                <MenuItem onClick={handleClose}>My account</MenuItem>
                <MenuItem onClick={handleClose}>F.A.Q.</MenuItem>
                <Divider/>
                <MenuItem onClick={handleLogout}>Logout</MenuItem>
            </Menu>
        </div>
    )
}