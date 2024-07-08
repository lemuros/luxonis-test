import {
  Card,
  CardContent,
  CardHeader,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from "@mui/material";
import { ClientTableRow } from "./ClientTableRow";
import { useClientTableData } from "./useClientTableData";

export const ClientTable = () => {
  const clients = useClientTableData();

  return (
    <Card>
      <CardHeader title="Game Clients" />
      <CardContent>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Client ID</TableCell>
              <TableCell>Username</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>State</TableCell>
              <TableCell width={40}></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {clients.map((client) => (
              <ClientTableRow key={client.id} {...client} />
            ))}
            {clients.length === 0 && (
              <TableRow>
                <TableCell colSpan={5}>No clients are connected</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};
