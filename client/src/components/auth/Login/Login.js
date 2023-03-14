import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import {IconButton} from "@mui/material";


export default function Login() {
    return (
        <div className="header-right-menu">
            <IconButton color="primary">
                <AccountCircleIcon color="primary"/>
            </IconButton>
        </div>
    )
}