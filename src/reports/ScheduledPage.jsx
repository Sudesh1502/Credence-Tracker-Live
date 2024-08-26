import React, { useState } from "react";
import { useSelector } from "react-redux";
import {
  Table,
  TableRow,
  TableCell,
  TableHead,
  TableBody,
  IconButton,
} from "@mui/material";
import makeStyles from "@mui/styles/makeStyles";
import DeleteIcon from "@mui/icons-material/Delete";
import { useEffectAsync } from "../reactHelper";
import { useTranslation } from "../common/components/LocalizationProvider";
import PageLayout from "../common/components/PageLayout";
import ReportsMenu from "./components/ReportsMenu";
import TableShimmer from "../common/components/TableShimmer";
import RemoveDialog from "../common/components/RemoveDialog";

const useStyles = makeStyles((theme) => ({
  columnAction: {
    width: "1%",
    paddingRight: theme.spacing(1),
  },
}));

const ScheduledPage = () => {
  const classes = useStyles();
  const t = useTranslation();

  const calendars = useSelector((state) => state.calendars.items);

  const [timestamp, setTimestamp] = useState(Date.now());
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [removingId, setRemovingId] = useState();

  useEffectAsync(async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/reports");
      if (response.ok) {
        setItems(await response.json());
      } else {
        throw Error(await response.text());
      }
    } finally {
      setLoading(false);
    }
  }, [timestamp]);

  const formatType = (type) => {
    switch (type) {
      case "events":
        return t("reportEvents");
      case "route":
        return t("reportRoute");
      case "summary":
        return t("reportSummary");
      case "trips":
        return t("reportTrips");
      case "stops":
        return t("reportStops");
      default:
        return type;
    }
  };

  return (
    <PageLayout
      menu={<ReportsMenu />}
      breadcrumbs={["settingsTitle", "reportScheduled"]}
    >
      <h2 style={{ paddingLeft: '20px' }}>Scheduled Reports</h2>
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
            >
              {t("sharedType")}
            </TableCell>
            <TableCell
              sx={{
                border: "2px solid gray",
                background: "#d3d3d3",
                color: "black",
              }}
            >
              {t("sharedDescription")}
            </TableCell>
            <TableCell
              sx={{
                border: "2px solid gray",
                background: "#d3d3d3",
                color: "black",
              }}
            >
              {t("sharedCalendar")}
            </TableCell>
            <TableCell
              sx={{
                border: "2px solid gray",
                background: "#d3d3d3",
                color: "black",
              }}
              className={classes.columnAction}
            />
          </TableRow>
        </TableHead>
        <TableBody>
          {!loading ? (
            items.map((item) => (
              <TableRow key={item.id}>
                <TableCell
                  sx={{
                    border: "2px solid gray",
                  }}
                >
                  {formatType(item.type)}
                </TableCell>
                <TableCell
                  sx={{
                    border: "2px solid gray",
                  }}
                >
                  {item.description}
                </TableCell>
                <TableCell
                  sx={{
                    border: "2px solid gray",
                  }}
                >
                  {calendars[item.calendarId].name}
                </TableCell>
                <TableCell
                  sx={{
                    border: "2px solid gray",
                  }}
                  className={classes.columnAction}
                  padding="none"
                >
                  <IconButton
                    size="small"
                    onClick={() => setRemovingId(item.id)}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableShimmer columns={4} endAction />
          )}
        </TableBody>
      </Table>
      <RemoveDialog
        style={{ transform: "none" }}
        open={!!removingId}
        endpoint="reports"
        itemId={removingId}
        onResult={(removed) => {
          setRemovingId(null);
          if (removed) {
            setTimestamp(Date.now());
          }
        }}
      />
    </PageLayout>
  );
};

export default ScheduledPage;
