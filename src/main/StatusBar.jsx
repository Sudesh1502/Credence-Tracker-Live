import React, { useState, useEffect } from "react";
import "./StatusBar.css";

const StatusBar = ({ setData, setInactiveIds }) => {
  const [stop, setStop] = useState(0);
  const [running, setRunning] = useState(0);
  const [overspeed, setOverspeed] = useState(0);
  const [idle, setIdle] = useState(0);
  const [inactive, setInactive] = useState(0);
  const [all, setAll] = useState(0);
  const [positions, setPositions] = useState([]);
  const [device, setDevice] = useState([]); // State to store inactive device IDs

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
      const inactiveDeviceIds = []; // Temporary array to hold inactive device IDs

      device.forEach((carItem) => {
        // Fetch position details based on deviceId from carItem
        const position = positions.find(pos => pos.deviceId === carItem.id);

        // If no matching position data is found, consider the car inactive
        if (!position) {
          if (carItem.status === 'offline') {
            inactiveCount++;
            inactiveDeviceIds.push(carItem); // Add the inactive device ID to the array
          }
          return; // Skip to the next carItem
        }

        // Extract necessary details
        const speed = position.speed;
        const ignition = position?.attributes?.ignition || false;

        switch (true) {
          case speed <= 2.0 && ignition:
            idleCount++;
            break;
          case speed > 2.0 && ignition:
            runningCount++;
            break;
          case speed > 60.0 && ignition:
            overspeedCount++;
            break;
          case speed <= 1.0 && !ignition:
            stopCount++;
            break;
          default:
            break;
        }
      });

      setStop(stopCount);
      setIdle(idleCount);
      setRunning(runningCount);
      setOverspeed(overspeedCount);
      setInactive(inactiveCount);
      setAll(device.length); // Total devices
      setInactiveIds(inactiveDeviceIds); // Store the inactive device IDs
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
