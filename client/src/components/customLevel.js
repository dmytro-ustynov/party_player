export default function CustomLevel(props) {
    const {n = 3, width = 80, height = 30, fill = 1,
        color = 'green', emptyColor = 'grey', text=''} = props
    const divs = []
    const w = Math.round(width /n)
    for (let i=0; i< n; i++) {
        const h= Math.round(i*height/n)+5
        divs.push(<div key={i} style={{width: `${w}px`,
            height: `${h}px`,
            backgroundColor: i/n < fill ? color : emptyColor,
            }} />)
    }
    return (
        <div style={{display: "flex", alignItems: 'flex-end',
            gap: '2px',
            height: `${height}px`,}}>
            {divs}
            <span style={{marginLeft: '10px'}}>{text}</span>
        </div>

    )
}