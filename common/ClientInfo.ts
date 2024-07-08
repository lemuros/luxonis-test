export enum ClientStateEnum {
  IN_LOBBY,
  IN_GAME,
  DISCONNECTED,
  SPECTATING,
}

export enum ClientTypeEnum {
  PLAYER,
  SPECTATOR,
  UNDECIDED,
}

export interface ClientInfo {
  id: string;
  username: string;
  state: ClientStateEnum;
  type: ClientTypeEnum;
}

export const getClientTypeName = (value: ClientTypeEnum) => {
  return Object.keys(ClientTypeEnum).find(
    (key) => ClientTypeEnum[key as keyof typeof ClientTypeEnum] === value
  );
};

export const getClientStateName = (value: ClientStateEnum) => {
  return Object.keys(ClientStateEnum).find(
    (key) => ClientStateEnum[key as keyof typeof ClientStateEnum] === value
  );
};
