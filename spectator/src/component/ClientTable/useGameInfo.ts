import { useEffect, useState } from "react";
import { useConnectionContext } from "../../app/ConnectionProvider";
import { MessageTypeEnum, parseMessageType } from "common/messageBase";
import {
  BroadcastGameStateMessage,
  PostGameStateMessage,
  RequestGameStateMessage,
} from "common/messages";
import { GameInfo } from "common/GameInfo";

export const useGameInfo = (clientId: string) => {
  const { ws } = useConnectionContext();
  const [game, setGame] = useState<GameInfo | undefined>();

  useEffect(() => {
    if (ws) {
      const message = RequestGameStateMessage.serialize({ clientId });
      ws.send(new Uint8Array(message));
    }
  }, [ws, clientId]);

  useEffect(() => {
    if (ws) {
      const handleMessage = async (event: CustomEvent<Buffer>) => {
        const type = parseMessageType(event.detail);
        switch (type) {
          case MessageTypeEnum.PostGameState: {
            const message = PostGameStateMessage.parse(event.detail);
            setGame(message.payload.game);
            break;
          }
          case MessageTypeEnum.BroadcastGameState: {
            const message = BroadcastGameStateMessage.parse(event.detail);
            setGame(message.payload.game);
            break;
          }
        }
      };

      ws.addEventListener("singleMessage", handleMessage);

      return () => {
        ws.removeEventListener("singleMessage", handleMessage);
      };
    }
  }, [ws]);

  return game;
};
