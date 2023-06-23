export default function Footer() {
    const year = new Date().getFullYear()
    return (
        <footer>
            <div style={{cursor: 'pointer'}}
                 onClick={() => window.location = '/about'}>
                &#169; Ustynov Dmytro, {year}
            </div>
        </footer>
    )
}