import "@fontsource/roboto/300.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";

import { ConnectionProvider } from "./ConnectionProvider";
import { ClientTable } from "../component/ClientTable/ClientTable";
import { DefaultLayout } from "../layout/DefaultLayout";
import { CssBaseline, GlobalStyles } from "@mui/material";

export const App = () => {
  return (
    <ConnectionProvider>
      <CssBaseline />
      <GlobalStyles
        styles={{
          html: { minHeight: "100vh" },
          body: { minHeight: "100vh" },
          "#root": {
            minHeight: "100vh",
            display: "flex",
            flexDirection: "column",
          },
        }}
      />

      <DefaultLayout>
        <ClientTable />
      </DefaultLayout>
    </ConnectionProvider>
  );
};
