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
       <h2 style={{ paddingLeft: '20px' }}>Logs</h2>

      <Table
        sx={{
          borderCollapse: "collapse",
          border: "2px solid gray",
        }}
      >
        <TableHead>
          <TableRow>
            <TableCell
              sx={{
                border: "2px solid gray",
                background: "#d3d3d3",
                color: "black",
              }}
              className={classes.columnAction}
            />
            <TableCell
              sx={{
                border: "2px solid gray",
                background: "#d3d3d3",
                color: "black",
              }}
            >
              {t("deviceIdentifier")}
            </TableCell>
            <TableCell
              sx={{
                border: "2px solid gray",
                background: "#d3d3d3",
                color: "black",
              }}
            >
              {t("positionProtocol")}
            </TableCell>
            <TableCell
              sx={{
                border: "2px solid gray",
                background: "#d3d3d3",
                color: "black",
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
                }}
              >
                {item.uniqueId}
              </TableCell>
              <TableCell
                sx={{
                  border: "2px solid gray",
                }}
              >
                {item.protocol}
              </TableCell>
              <TableCell
                sx={{
                  border: "2px solid gray",
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