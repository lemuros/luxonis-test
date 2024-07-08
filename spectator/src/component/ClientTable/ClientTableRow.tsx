import { IconButton, TableCell, TableRow } from "@mui/material";
import {
  ClientInfo,
  ClientStateEnum,
  getClientStateName,
  getClientTypeName,
} from "common/ClientInfo";
import { useMemo, useState } from "react";
import { ClientDialog } from "./ClientDialog";
import QueryStatsIcon from "@mui/icons-material/QueryStats";

export const ClientTableRow = (client: ClientInfo) => {
  const clientState = useMemo(() => getClientStateName(client.state), [client]);
  const clientType = useMemo(() => getClientTypeName(client.type), [client]);

  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <>
      <TableRow>
        <TableCell>{client.id}</TableCell>
        <TableCell>{client.username}</TableCell>
        <TableCell>{clientType}</TableCell>
        <TableCell>{clientState}</TableCell>
        <TableCell sx={{ pt: 0, pb: 0 }}>
          <IconButton
            onClick={() => setDialogOpen(true)}
            disabled={client.state !== ClientStateEnum.IN_GAME}
          >
            <QueryStatsIcon />
          </IconButton>
        </TableCell>
      </TableRow>
      {client.state === ClientStateEnum.IN_GAME && (
        <ClientDialog
          open={dialogOpen}
          onClose={() => setDialogOpen(false)}
          client={client}
        />
      )}
    </>
  );
};
