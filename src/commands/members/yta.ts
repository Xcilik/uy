import { WAMessage } from "@whiskeysockets/baileys";
import fs from "fs";
import { MsgInfoObj } from "../../interfaces/msgInfoObj";
import { Bot } from "../../interfaces/Bot";
import getRandomFileName from "../../functions/getRandomFileName";
import { prefix } from "../../utils/constants";
import { exec } from "child_process";

const downloadAudio = (url, cookies) => {
  return new Promise((resolve, reject) => {
    const command = `yt-dlp -x --audio-format mp3 --cookies "${cookies}" -o "${getRandomFileName('.mp3')}" "${url}"`;
    
    exec(command, (error, stdout, stderr) => {
      if (error) {
        reject(`Error: ${stderr}`);
      } else {
        resolve(stdout);
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

  // Read cookies from the src/utils/cookies.txt file
  const cookieFilePath = './src/utils/cokies.txt';
  let cookies = '';

  // Read cookies
  try {
    cookies = fs.readFileSync(cookieFilePath, 'utf-8').trim();
    if (!cookies) {
      await reply(`❌ No valid cookies found in the file.`);
      return;
    }
  } catch (err) {
    await reply(`❌ Error reading cookies: ${err.message}`);
    return;
  }

  // Download audio
  try {
    const downloadOutput = await downloadAudio(urlYt, cookies);
    const audioFileName = downloadOutput.trim(); // Assuming yt-dlp outputs the filename

    // Check if file exists
    if (fs.existsSync(audioFileName)) {
      const stats = fs.statSync(audioFileName);
      const fileSizeInMegabytes = stats.size / (1024 * 1024);

      console.log(`Audio downloaded! Size: ${fileSizeInMegabytes} MB`);

      if (fileSizeInMegabytes <= 100) {
        await bot.sendMessage(
          from,
          {
            document: fs.readFileSync(audioFileName),
            fileName: `${audioFileName}.mp3`,
            mimetype: "audio/mpeg",
          },
          { quoted: msg }
        );
      } else {
        await reply(`❌ Cannot download! Audio size limit: 100 MB`);
      }

      // Clean up the downloaded file
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
