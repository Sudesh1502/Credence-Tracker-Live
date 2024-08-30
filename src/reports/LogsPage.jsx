import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  Table,
  TableRow,
  TableCell,
  TableHead,
  TableBody,
  IconButton,
  Tooltip,
} from "@mui/material";
import makeStyles from "@mui/styles/makeStyles";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import { useTranslation } from "../common/components/LocalizationProvider";
import PageLayout from "../common/components/PageLayout";
import ReportsMenu from "./components/ReportsMenu";
import { sessionActions } from "../store";

const useStyles = makeStyles((theme) => ({
  columnAction: {
    width: "1%",
    paddingLeft: theme.spacing(1),
  },
  success: {
    color: theme.palette.success.main,
  },
  error: {
    color: theme.palette.error.main,
  },
}));

const LogsPage = () => {
  const classes = useStyles();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const t = useTranslation();

  useEffect(() => {
    dispatch(sessionActions.enableLogs(true));
    return () => dispatch(sessionActions.enableLogs(false));
  }, []);

  const items = useSelector((state) => state.session.logs);

  const registerDevice = (uniqueId) => {
    const query = new URLSearchParams({ uniqueId });
    navigate(`/settings/device?${query.toString()}`);
  };

  return (
    <PageLayout
      menu={<ReportsMenu />}
      breadcrumbs={["reportTitle", "statisticsTitle"]}
    >
      <h2 style={{ paddingLeft: "20px" }}>Logs</h2>

      <Table
        sx={{
          borderCollapse: "collapse",
          border: "2px solid gray",
          paddingTop: "3px",
          paddingRight: "3px",
          width: "100%",
        }}
      >
        <TableHead>
          <TableRow>
            <TableCell
              sx={{
                border: "2px solid gray",
                background: "#d3d3d3",
                color: "black",
                width: "10%",
                paddingTop: "3px !important",
                paddingBottom: "3px !important",
              }}
              className={classes.columnAction}
            />
            <TableCell
              sx={{
                border: "2px solid gray",
                background: "#d3d3d3",
                color: "black",
                paddingTop: "3px !important",
                paddingBottom: "3px !important",
              }}
            >
              {t("deviceIdentifier")}
            </TableCell>
            <TableCell
              sx={{
                border: "2px solid gray",
                background: "#d3d3d3",
                color: "black",
                paddingTop: "3px !important",
                paddingBottom: "3px !important",
              }}
            >
              {t("positionProtocol")}
            </TableCell>
            <TableCell
              sx={{
                border: "2px solid gray",
                background: "#d3d3d3",
                color: "black",
                paddingTop: "3px !important",
                paddingBottom: "3px !important",
              }}
            >
              {t("commandData")}
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {items.map((item, index) => (
            /* eslint-disable react/no-array-index-key */ <TableRow key={index}>
              <TableCell
                sx={{
                  border: "2px solid gray",
                  paddingRight: "2px !important",
                  paddingTop: "5px !important",
                  paddingBottom: "5px !important",
                }}
                className={classes.columnAction}
                padding="none"
              >
                {item.deviceId ? (
                  <IconButton size="small" disabled>
                    <CheckCircleOutlineIcon
                      fontSize="small"
                      className={classes.success}
                    />
                  </IconButton>
                ) : (
                  <Tooltip title={t("loginRegister")}>
                    <IconButton
                      size="small"
                      onClick={() => registerDevice(item.uniqueId)}
                    >
                      <HelpOutlineIcon
                        fontSize="small"
                        className={classes.error}
                      />
                    </IconButton>
                  </Tooltip>
                )}
              </TableCell>
              <TableCell
                sx={{
                  border: "2px solid gray",
                  paddingRight: "2px !important",
                  paddingTop: "5px !important",
                  paddingBottom: "5px !important",
                }}
              >
                {item.uniqueId}
              </TableCell>
              <TableCell
                sx={{
                  border: "2px solid gray",
                  paddingRight: "2px !important",
                  paddingTop: "5px !important",
                  paddingBottom: "5px !important",
                }}
              >
                {item.protocol}
              </TableCell>
              <TableCell
                sx={{
                  border: "2px solid gray",
                  paddingRight: "2px !important",
                  paddingTop: "5px !important",
                  paddingBottom: "5px !important",
                }}
              >
                {item.data}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </PageLayout>
  );
};

export default LogsPage;
