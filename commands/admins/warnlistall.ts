import { WAMessage } from "@adiwajshing/baileys";
import { MsgInfoObj } from "../../interface/msgInfoObj";
import { Bot } from "../../interface/Bot";
import { getCountWarningAllGroup } from "../../db/warningDB";

export const command = () => {
  let cmd = ["warnlistall", "warninglistall"];

  return { cmd, handler };
};

const handler = async (bot: Bot, msg: WAMessage, msgInfoObj: MsgInfoObj) => {
  let { reply, groupName } = msgInfoObj;
  const more = String.fromCharCode(8206);
  const readMore = more.repeat(4001);

  let warnCount = await getCountWarningAllGroup();
  let warnMsg = `*ALL PVX GROUPS*\n_warning status_${readMore}\n`;

  warnCount.forEach((mem: any) => {
    warnMsg += `\n${mem.count} - ${mem.name}`;
  });

  await reply(warnMsg);
};
