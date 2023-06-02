import { WAMessage } from "@adiwajshing/baileys";

//preference to mentioned
export const getMentionedOrTaggedParticipant = async (
  msg: WAMessage
): Promise<string> => {
  let participant: string;

  const mentionedUsers =
    msg.message?.extendedTextMessage?.contextInfo?.mentionedJid;
  const taggedMessageUser =
    msg.message?.extendedTextMessage?.contextInfo?.participant;

  if (mentionedUsers && mentionedUsers.length) {
    //when member are mentioned with command
    participant = mentionedUsers[0];
  } else if (taggedMessageUser && taggedMessageUser.length) {
    //when message is tagged with command
    participant = taggedMessageUser;
  } else {
    participant = "";
  }
  return participant;
};