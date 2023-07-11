import logoImage from "../images/logo_640.png";
import {useNavigate} from "react-router-dom";

export default function BrandLogo() {
    const navigate = useNavigate()
    return (
        <img src={logoImage} alt={"logo"} className="image-logo"
             onClick={() => navigate('/')}/>
    )
}