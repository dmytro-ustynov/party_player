/*eslint-disable*/
import React from "react";
// import DeleteIcon from "@material-ui/icons/Delete";
// import IconButton from "@material-ui/core/IconButton";
// react components for routing our app without refresh
import {Link, NavLink, useNavigate} from "react-router-dom";
import AccountCircleIcon from '@material-ui/icons/AccountCircle';
import MenuIcon from '@material-ui/icons/Menu';

// @material-ui/core components
import {makeStyles} from "@material-ui/core/styles";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
// import Tooltip from "@material-ui/core/Tooltip";

// @material-ui/icons
// import {Apps, CloudDownload} from "@material-ui/icons";

// core components
import CustomDropdown from "../CustomDropdown/CustomDropdown.js";
// import Button from "components/CustomButtons/Button.js";

import styles from "../../assets/jss/material/components/headerLinksStyle.js";
import {useAuthDispatch, useAuthState} from "../auth/context";
import {logout} from "../auth/actions";
// import ExitToAppIcon from "@material-ui/icons/ExitToApp";

const useStyles = makeStyles(styles);

export default function HeaderLinks(props) {
  const classes = useStyles();

  const state = useAuthState()
  const user = state.user
  // window.state = state
  const dispatch = useAuthDispatch()
  const navigate = useNavigate()

  let icon
  let dropdownItems
  let dropdownHeader
  if (user && user.role !== 'anonymous') {
    icon = AccountCircleIcon
    dropdownHeader = user.username
    dropdownItems = [
      <NavLink to={'/profile'}
               className={classes.dropdownLink}>
        Profile
      </NavLink>,
      <NavLink to={'/payments'}
               className={classes.dropdownLink}>
        Payments
      </NavLink>,
      {divider: true},
      <div className={classes.dropdownLink}
           onClick={() => {
             logout(dispatch)
             history.push('/')
           }}>
        Logout
      </div>,
    ]
  } else {
    icon = MenuIcon
    dropdownHeader = null
    dropdownItems = [
      <NavLink to={'/login'}
               className={classes.dropdownLink}>
        Login
      </NavLink>,
      <NavLink
        to={'/create_user'}
        className={classes.dropdownLink}>
        Register
      < /NavLink>,
      {divider: true},
      <NavLink to={'/landing_page#why_register'}
               className={classes.dropdownLink}>
        Why register?</NavLink>
    ]
  }


  return (
    <List className={classes.list}>
      <ListItem className={classes.listItem}>
        <CustomDropdown
          noLiPadding
          dropdownHeader={dropdownHeader}
          // buttonText="Components"
          buttonProps={{
            className: classes.navLink,
            color: "transparent",
          }}
          buttonIcon={icon}
          dropdownList={dropdownItems}
        />
      </ListItem>
    </List>
  );
}
