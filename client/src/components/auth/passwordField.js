import {useState} from "react";
import TextField from "@mui/material/TextField";
import {IconButton, InputAdornment} from "@mui/material";
import {Visibility, VisibilityOff} from "@mui/icons-material";

export default function PasswordField({value, setValue, label, error, errorMessage, fullwidth,sx}) {
    const [showPassword, setShowPassword] = useState(false);
    const handleClickShowPassword = () => setShowPassword((show) => !show);

    return (
        <TextField
            label={label}
            required
            fullWidth={fullwidth}
            error={error}
            helperText={errorMessage}
            value={value}
            autoComplete={label}
            title="Password must be at least 5 characters long"
            sx={sx}
            onChange={event => setValue(event.target.value)}
            type={showPassword ? 'text' : 'password'}
            InputProps={{
                endAdornment: (<InputAdornment position="end">
                    <IconButton
                        aria-label="toggle password visibility"
                        onClick={handleClickShowPassword}
                        onMouseDown={e => e.preventDefault()}
                        edge="end"
                    >
                        {showPassword ? <VisibilityOff/> : <Visibility/>}
                    </IconButton>
                </InputAdornment>)
            }}
        />
    )
}