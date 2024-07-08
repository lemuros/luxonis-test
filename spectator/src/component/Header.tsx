import { AppBar, Stack, Toolbar, Typography } from "@mui/material";
import { useConnectionContext } from "../app/ConnectionProvider";

import PortableWifiOffIcon from "@mui/icons-material/PortableWifiOff";
import WifiTetheringIcon from "@mui/icons-material/WifiTethering";
import SensorsIcon from "@mui/icons-material/Sensors";

export const Header = () => {
  const { connection } = useConnectionContext();
  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          Game Spectator
        </Typography>
        <Stack direction="row" spacing={1}>
          {connection === "CONNECTED" && (
            <>
              <WifiTetheringIcon /> <span>Connected</span>
            </>
          )}
          {connection === "CONNECTING" && (
            <>
              <SensorsIcon /> <span>Connecting</span>
            </>
          )}
          {connection === "DISCONNECTED" && (
            <>
              <PortableWifiOffIcon /> <span>Disconnected</span>
            </>
          )}
        </Stack>
      </Toolbar>
    </AppBar>
  );
};
