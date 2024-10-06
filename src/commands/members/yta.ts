import { WAMessage } from "@whiskeysockets/baileys";
import ytdl from "ytdl-core";
import fs from "fs";
import { MsgInfoObj } from "../../interfaces/msgInfoObj";
import { Bot } from "../../interfaces/Bot";
import getRandomFileName from "../../functions/getRandomFileName";
import { prefix } from "../../utils/constants";

const handler = async (bot: Bot, msg: WAMessage, msgInfoObj: MsgInfoObj) => {
  const { reply, args, from } = msgInfoObj;

  if (args.length === 0) {
    await reply(`❌ URL is empty! \nSend ${prefix}yta url`);
    return;
  }

  const urlYt = args[0];
  if (!urlYt.startsWith("http")) {
    await reply(`❌ Give a valid YouTube link!`);
    return;
  }

  // Read cookies from the src/utils/cokies.txt file
  const cookieFilePath = './src/utils/cokies.txt'; // Adjust path if needed
  let cookies = '';

  try {
    cookies = fs.readFileSync(cookieFilePath, 'utf-8');
  } catch (err) {
    await reply(`❌ Error reading cookies: ${err.message}`);
    return;
  }

  const infoYt = await ytdl.getInfo(urlYt, {
    requestOptions: {
      headers: {
        Cookie: cookies // Set the cookies in the headers
      }
    }
  });

  // Check for duration limit
  if (Number(infoYt.videoDetails.lengthSeconds) >= 3600) {
    await reply(`❌ Cannot download! Audio duration limit: 60 min`);
    return;
  }

  const titleYt = infoYt.videoDetails.title;
  const randomFileName = getRandomFileName(".mp3");

  const stream = ytdl(urlYt, {
    filter: (info) => info.audioBitrate === 160 || info.audioBitrate === 128,
    requestOptions: {
      headers: {
        Cookie: cookies // Set the cookies in the headers
      }
    }
  }).pipe(fs.createWriteStream(`./${randomFileName}`));

  console.log("Audio downloading ->", urlYt);
  
  await new Promise((resolve, reject) => {
    stream.on("error", reject);
    stream.on("finish", resolve);
  });

  const stats = fs.statSync(`./${randomFileName}`);
  const fileSizeInBytes = stats.size;
  const fileSizeInMegabytes = fileSizeInBytes / (1024 * 1024);
  
  console.log(`Audio downloaded! Size: ${fileSizeInMegabytes} MB`);
  
  if (fileSizeInMegabytes <= 100) {
    await bot.sendMessage(
      from,
      {
        document: fs.readFileSync(`./${randomFileName}`),
        fileName: `${titleYt}.mp3`,
        mimetype: "audio/mpeg",
      },
      { quoted: msg }
    );
  } else {
    await reply(`❌ Cannot download! Audio size limit: 100 MB`);
  }

  fs.unlinkSync(`./${randomFileName}`);
};

const yta = () => {
  const cmd = ["yta"];

  return { cmd, handler };
};

export default yta;
