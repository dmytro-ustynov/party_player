import {useNavigate} from "react-router-dom";

export default function Footer() {
    const navigate = useNavigate()
    const year = new Date().getFullYear()
    return (
        <footer>
            <div style={{cursor: 'pointer'}}
                 onClick={() => navigate('/about')}>
                &#169; Ustynov Dmytro, {year}
            </div>
        </footer>
    )
}