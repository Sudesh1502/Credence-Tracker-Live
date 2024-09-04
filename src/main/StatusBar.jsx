import React, { useState, useEffect } from "react";
import "./StatusBar.css";
import { useEffectAsync } from "../reactHelper";

const StatusBar = ({ setData }) => {
  const [stop, setStop] = useState(0);
const [running, setRunning] = useState(0);
const [overspeed, setOverspeed] = useState(0);
const [idle, setIdle] = useState(0);
const [inactive, setInactive] = useState(0);
const [all, setAll] = useState(0);
const [positions, setPositions] = useState([]);
const [device, setDevice] = useState([]);

useEffect(() => {
  const fetchPositions = async () => {
    try {
      const response = await fetch('/api/positions');
      if (response.ok) {
        const data = await response.json();
        setPositions(data);
      } else {
        console.error("Failed to fetch positions:", await response.text());
      }
    } catch (error) {
      console.error("Error fetching positions:", error);
    }
  };

  fetchPositions();
}, []);

useEffect(() => {
  const fetchDevices = async () => {
    try {
      const response = await fetch('/api/devices');
      if (response.ok) {
        setDevice(await response.json());
      } else {
        console.error("Failed to fetch devices:", await response.text());
      }
    } catch (error) {
      console.error("Error fetching devices:", error);
    }
  };

  fetchDevices();
}, []);

useEffect(() => {
  const calculateStatus = () => {
    let stopCount = 0;
    let idleCount = 0;
    let runningCount = 0;
    let overspeedCount = 0;
    let inactiveCount = 0;

    positions.forEach((position) => {
      const ignition = position?.attributes?.ignition;
      const speed = position?.speed || 0;

      if (!position || !position.attributes || Object.keys(position).length === 0) {
        inactiveCount++;
      } else if (!ignition && speed < 1) {
        stopCount++;
      } else if (ignition && speed < 2) {
        idleCount++;
      } else if (ignition && speed >= 2 && speed <= 60) {
        runningCount++;
      } else if (ignition && speed > 60) {
        overspeedCount++;
      } else {
        console.log('Unhandled Vehicle: in position', position);
        const data = device.find((pos) => pos.id === position.deviceId);
        console.log('Unhandled Vehicle: in device', data);
      }
    });

    setStop(stopCount);
    setIdle(idleCount);
    setRunning(runningCount);
    setOverspeed(overspeedCount);

    const inactiveDevices = device.filter(dev => {
      const data = positions.find((pos) => pos.deviceId === dev.id);
      return dev.status === "offline" && !data?.attributes?.ignition;
    } ).length;
    setInactive(inactiveDevices);

    setAll(device.length);
  };

  if (positions.length > 0 && device.length > 0) {
    calculateStatus();
  }
}, [positions, device]);




  const statuses = [
    { count: all, label: "ALL", colorClass: "all", status: "all" },
    { count: running, label: "RUNNING", colorClass: "running", status: "running" },
    { count: stop, label: "STOPPED", colorClass: "stopped", status: "stop" },
    { count: overspeed, label: "OVERSPEED", colorClass: "overspeed", status: "overspeed" },
    { count: idle, label: "IDLE", colorClass: "idle", status: "idle" },
    { count: inactive, label: "INACTIVE", colorClass: "inactive", status: "inactive" },
  ];

  const handleClick = (status) => {
    setData(status);
  };

  return (
    <div className="status-bar">
      {statuses.map((item, index) => (
        <div
          key={index}
          item
          className={`status-item ${item.colorClass}`}
          onClick={() => handleClick(item.status)} // Pass the selected status to setData
        >
          <span className="count">
            {item.count}
          </span>
          <span className="label">
            {item.label}
          </span>
        </div>
      ))}
    </div>
  );
};


export default StatusBar;
