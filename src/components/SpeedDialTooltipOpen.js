"use client"; // Required for client components in Next.js app router

import * as React from "react";
import Box from "@mui/material/Box";
import SpeedDial from "@mui/material/SpeedDial";
import SpeedDialIcon from "@mui/material/SpeedDialIcon";
import SpeedDialAction from "@mui/material/SpeedDialAction";
import CameraIcon from "@mui/icons-material/Camera";
import UploadFileIcon from "@mui/icons-material/UploadFile";

const actions = [
  { icon: <UploadFileIcon />, name: "Upload File" },
  { icon: <CameraIcon />, name: "Take Photo" },
];

export default function SpeedDialTooltipOpen() {
  const [open, setOpen] = React.useState(false);

  return (
    <Box sx={{ position: "absolute", bottom: 16, right: 16, zIndex: 10 }}>
      <SpeedDial
        ariaLabel="SpeedDial example"
        icon={<SpeedDialIcon />}
        onClose={() => setOpen(false)}
        onOpen={() => setOpen(true)}
        open={open}
      >
        {actions.map((action) => (
          <SpeedDialAction
            key={action.name}
            icon={action.icon}
            tooltipTitle={action.name}
            tooltipOpen
            onClick={() => setOpen(false)}
          />
        ))}
      </SpeedDial>
    </Box>
  );
}
