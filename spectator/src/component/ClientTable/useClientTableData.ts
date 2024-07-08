import { useEffect, useState } from "react";
import { useConnectionContext } from "../../app/ConnectionProvider";
import { MessageTypeEnum, parseMessageType } from "common/messageBase";
import {
  BroadcastClientStateMessage,
  PostClientsMessage,
  RequestClientListMessage,
} from "common/messages";
import { ClientInfo, ClientStateEnum } from "common/ClientInfo";

export const useClientTableData = () => {
  const { ws } = useConnectionContext();
  const [clients, setClients] = useState<Array<ClientInfo>>([]);

  useEffect(() => {
    if (ws) {
      const message = RequestClientListMessage.serialize({});
      ws.send(new Uint8Array(message));
    }
  }, [ws]);

  useEffect(() => {
    if (ws) {
      const handleMessage = async (event: CustomEvent<Buffer>) => {
        const type = parseMessageType(event.detail);
        switch (type) {
          case MessageTypeEnum.PostClients: {
            const message = PostClientsMessage.parse(event.detail);
            setClients(message.payload.clients);
            break;
          }
          case MessageTypeEnum.BroadcastClientState: {
            const message = BroadcastClientStateMessage.parse(event.detail);
            const existingIndex = clients.findIndex(
              (client) => client.id === message.payload.id
            );
            if (message.payload.state !== ClientStateEnum.DISCONNECTED) {
              if (existingIndex > -1) {
                const newArray = [...clients];
                newArray.splice(existingIndex, 1);
                newArray.push(message.payload);
                setClients(newArray);
              } else {
                setClients([...clients, message.payload]);
              }
            } else {
              const newArray = [...clients];
              newArray.splice(existingIndex, 1);
              setClients(newArray);
            }
            break;
          }
        }
      };

      ws.addEventListener("singleMessage", handleMessage);

      return () => {
        ws.removeEventListener("singleMessage", handleMessage);
      };
    }
  }, [ws, clients]);

  return clients;
};
