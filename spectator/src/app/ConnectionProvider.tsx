import {
  PropsWithChildren,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { HOST, WS_PORT } from "common/config";
import { MessageTypeEnum, parseMessageType } from "common/messageBase";
import { ErrorMessage, PostApiKeyMessage } from "common/messages";
import { handleBufferedMessagesWSWeb } from "common/handleBufferedMessagesWSWeb";

export type ConnectionContextType = {
  connection: "CONNECTED" | "CONNECTING" | "DISCONNECTED";
  ws?: WebSocket;
  error?: string;
};

const ConnectionContext = createContext<ConnectionContextType>({
  connection: "DISCONNECTED",
});

export const useConnectionContext = () => useContext(ConnectionContext);

export const ConnectionProvider = (props: PropsWithChildren) => {
  const [connection, setConnection] =
    useState<ConnectionContextType["connection"]>("DISCONNECTED");
  const [ws, setWs] = useState<WebSocket | undefined>();
  const [error, setError] = useState<string | undefined>();

  const connect = useCallback(() => {
    const webSocket = new WebSocket(`ws://${HOST}:${WS_PORT}`);

    handleBufferedMessagesWSWeb(webSocket);
    setWs(webSocket);
    setConnection("CONNECTING");

    // Connection opened
    webSocket.addEventListener("open", () => {
      console.log("Connected to WS Server");
      setConnection("CONNECTED");
    });

    // Handle WebSocket closing
    webSocket.addEventListener("close", () => {
      console.log("Disconnected from WS Server");
      setConnection("DISCONNECTED");
      setTimeout(connect, 5000);
    });

    // Log errors
    webSocket.addEventListener("error", (error) =>
      console.error("WebSocket error: ", error)
    );

    webSocket.addEventListener("singleMessage", async (event) => {
      const type = parseMessageType(event.detail);
      switch (type) {
        case MessageTypeEnum.RequestIdentification: {
          const message = PostApiKeyMessage.serialize({
            apiKey: import.meta.env.VITE_API_KEY,
          });
          webSocket.send(message);
          break;
        }
        case MessageTypeEnum.Error: {
          const message = ErrorMessage.parse(event.detail);
          setError(message.payload.errorMessage);
          break;
        }
      }
    });

    return webSocket;
  }, []);

  // Connect to WS
  useEffect(() => {
    const webSocket = connect();

    return () => {
      webSocket.close();
    };
  }, []);

  const ctxValue = useMemo(
    () => ({ connection, ws, error }),
    [connection, ws, error]
  );

  return (
    <ConnectionContext.Provider value={ctxValue}>
      {props.children}
    </ConnectionContext.Provider>
  );
};
