import { PropsWithChildren } from "react";
import { useConnectionContext } from "../app/ConnectionProvider";
import { Box, Container, Stack, Typography } from "@mui/material";
import { Header } from "../component/Header";
import PortableWifiOffIcon from "@mui/icons-material/PortableWifiOff";

export const DefaultLayout = (props: PropsWithChildren) => {
  const { connection } = useConnectionContext();

  return (
    <Box
      sx={{
        background: (theme) => theme.palette.grey[100],
        height: "100%",
        flexGrow: 1,
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Header />
      {connection !== "CONNECTED" && (
        <Box
          sx={{
            flexGrow: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Stack direction="row" spacing={2}>
            <PortableWifiOffIcon />
            <Typography>Not connected to server, reconnecting...</Typography>
          </Stack>
        </Box>
      )}
      {connection === "CONNECTED" && (
        <Container sx={{ mt: 2 }}>{props.children}</Container>
      )}
    </Box>
  );
};
