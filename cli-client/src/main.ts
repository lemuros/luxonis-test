import net from "net";
import { UNIX_SOC_PATH } from "common/config";
import { CliPlayerController } from "./CliPlayerController";
import { handleBufferedMessagesTCP } from "common/handleBufferedMessagesTCP";

console.clear();

const connection = net.createConnection({ path: UNIX_SOC_PATH });

handleBufferedMessagesTCP(connection);

new CliPlayerController(connection);
