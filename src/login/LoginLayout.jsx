import React from "react";
import { Paper } from "@mui/material";
import makeStyles from "@mui/styles/makeStyles";
import { useTheme } from "@mui/material/styles";
import './LoginLayout.css';

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
    height: "100vh", // Ensure full viewport height
    width: "100%",
  },
  sidebar: {
    position: "relative",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    width: "50%",
    overflow: "hidden", // Prevent video overflow
    [theme.breakpoints.down("lg")]: {
      width: theme.dimensions.sidebarWidthTablet,
    },
    [theme.breakpoints.down("sm")]: {
      width: "0px", // Hide the sidebar on small screens
    },
  },
  video: {
    position: "absolute",
    top: "50%",
    left: "50%",
    width: "100%",
    height: "100%",
    objectFit: "cover", // Ensure the video covers the entire sidebar
    transform: "translate(-50%, -50%)",
    zIndex: -1, // Keep the video in the background
  },
  paper: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    // flex: 1,
    width: "50%",
    backgroundColor: "#D3D3D3",
    boxShadow: "-2px 0px 16px rgba(0, 0, 0, 0.25)",
    borderRadius:"0px",
  },
  form: {
    // maxWidth: theme.spacing(52),
    // padding: theme.spacing(5),
    width: "40%",
  },
}));

const LoginLayout = ({ children }) => {
  const classes = useStyles();
  const theme = useTheme();

  return (
    <main className={classes.root}>
      <div className={classes.sidebar}>
        <video autoPlay muted loop className={classes.video}>
          <source src="login-video.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      </div>
      <Paper className={classes.paper}>
        <div className="logo">
          <img src="CR-LOGO.png" alt="Logo" className="loginLogo" />
          <h1 className="slogan">Navigating Towards a Secured Future.</h1>
        </div>
        <form className={classes.form}>{children}</form>
      </Paper>
    </main>
  );
};

export default LoginLayout;
