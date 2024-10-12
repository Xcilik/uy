import { WAMessage } from "@whiskeysockets/baileys";
import { MsgInfoObj } from "../../interfaces/msgInfoObj";
import { Bot } from "../../interfaces/Bot";

const handler = async (bot: Bot, msg: WAMessage, msgInfoObj: MsgInfoObj) => {
  const { reply } = msgInfoObj;
  const text = `*─「TEKNIK INFORMATIKA」 ─*\n\nIS ALIVE!!!`;

  await reply(text);
};

const alive = () => {
  const cmd = ["alive", "a"];

  return { cmd, handler };
};

export default alive;
