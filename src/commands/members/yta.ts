import { WAMessage } from "@whiskeysockets/baileys";
import fs from "fs";
import { MsgInfoObj } from "../../interfaces/msgInfoObj";
import { Bot } from "../../interfaces/Bot";
import getRandomFileName from "../../functions/getRandomFileName";
import { prefix } from "../../utils/constants";
import { exec } from "child_process";
import path from "path";

const downloadAudio = (url: string, cookies: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    const outputDir = './downloads';
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    const outputFile = path.join(outputDir, getRandomFileName('.mp3'));
    const command = `yt-dlp -x --audio-format mp3 --cookies "${cookies}" -o "${outputFile}" "${url}"`;

    exec(command, (error, stdout, stderr) => {
      if (error) {
        reject(`Error: ${stderr || stdout}`);
      } else {
        resolve(outputFile);
      }
    });
  });
};

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

  const cookieFilePath = './src/utils/cookies.txt';
  let cookies = '';

  try {
    cookies = await fs.promises.readFile(cookieFilePath, 'utf-8');
    if (!cookies.trim()) {
      await reply(`❌ No valid cookies found in the file.`);
      return;
    }
  } catch (err) {
    await reply(`❌ Error reading cookies: ${err.message}`);
    return;
  }

  try {
    const audioFileName = await downloadAudio(urlYt, cookies);

    if (fs.existsSync(audioFileName)) {
      const stats = fs.statSync(audioFileName);
      const fileSizeInMegabytes = stats.size / (1024 * 1024);

      console.log(`Audio downloaded! Size: ${fileSizeInMegabytes} MB`);

      if (fileSizeInMegabytes <= 100) {
        await bot.sendMessage(
          from,
          {
            document: fs.createReadStream(audioFileName),
            fileName: path.basename(audioFileName),
            mimetype: "audio/mpeg",
          },
          { quoted: msg }
        );
      } else {
        await reply(`❌ Cannot download! Audio size limit: 100 MB`);
      }

      fs.unlinkSync(audioFileName);
    } else {
      await reply(`❌ Error: File not found after download.`);
    }
  } catch (err) {
    await reply(`❌ ${err}`);
  }
};

const yta = () => {
  const cmd = ["yta"];
  return { cmd, handler };
};

export default yta;
