export default function Footer() {
    const year = new Date().getFullYear()
    return (
        <footer>
            &#169; Ustynov Dmytro, {year}
        </footer>
    )
}