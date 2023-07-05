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
import MenuIcon from '@mui/icons-material/Menu';

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
        document.cookie.split(";").forEach(function (c) {
            document.cookie = c.replace(/^ +/, "")
                .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
        });
        // reload homepage to flush saved uid
        window.location.replace('/')
    }

    const handleTermsClick = () => {
        window.location = '/terms'
    }

    const profileClick = () =>{
        window.location = '/profile'
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
                    <IconButton sx={{ml: 2}}
                                onClick={handleClick}
                                color="primary">
                        <MenuIcon
                            sx={{width: 32, height: 32}}
                        />
                    </IconButton>
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
                        <MenuItem onClick={handleClose}>Help</MenuItem>
                        <MenuItem onClick={()=> window.location='/welcome'}>Why register?</MenuItem>
                        <MenuItem onClick={handleClose}>F.A.Q.</MenuItem>
                        <MenuItem onClick={handleTermsClick}>Terms of Use</MenuItem>
                    </Menu>
                </>) : (<>
                <Tooltip title="Account settings">
                    <IconButton sx={{ml: 2}}
                                onClick={handleClick}
                                color="primary">
                        <AccountCircleIcon
                            sx={{width: 32, height: 32}}
                            color="primary"/>
                    </IconButton>
                </Tooltip>
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
                    <MenuItem onClick={profileClick}>Profile</MenuItem>
                    <MenuItem onClick={handleClose}>My account</MenuItem>
                    <MenuItem onClick={handleClose}>F.A.Q.</MenuItem>
                    <Divider/>
                    <MenuItem onClick={handleLogout}>Logout</MenuItem>
                </Menu>
            </>)}
        </div>
    )
}