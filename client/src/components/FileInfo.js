import {Grid, Table, TableBody, TableCell, TableRow} from "@mui/material";

export default function FileInfo(props) {
    const {info} = props
    let forbiddenKeys = ["updated_at", "file_path", "user_id", "deleted"]
    return (
        <Grid container>
            <Grid item>
                <Table className={"table-item-info"} size="small">
                    <TableBody>
                        {Object.entries(info).map(([key, value], number) => {
                            return (
                                !forbiddenKeys.includes(key) &&
                                (<TableRow key={`${key}-${number}`}>
                                    <TableCell> {key} </TableCell>
                                    {key === 'thumbnail' ?
                                        <TableCell>
                                            <img src={value} alt={'thumb'}
                                                 style={{maxWidth: "320px"}}/>
                                        </TableCell> :
                                        (<TableCell> {value} </TableCell>)}
                                </TableRow>)
                            )
                        })}
                    </TableBody>
                </Table>
            </Grid>
        </Grid>
    )
}