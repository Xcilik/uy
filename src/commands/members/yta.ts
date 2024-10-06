const handler = async (bot: Bot, msg: WAMessage, msgInfoObj: MsgInfoObj) => {
  const { reply, args, from } = msgInfoObj;
  if (args.length === 0) {
    await reply(`❌ URL is empty! \nSend ${prefix}yta url`);
    return;
  }
  const urlYt = args[0];
  if (!urlYt.startsWith("http")) {
    await reply(`❌ Give youtube link!`);
    return;
  }
  const infoYt = await ytdl.getInfo(urlYt);
  // 60 MIN
  if (Number(infoYt.videoDetails.lengthSeconds) >= 3600) {
    await reply(`❌ Cannot download! Audio duration limit: 60 min`);
    return;
  }
  const titleYt = infoYt.videoDetails.title;
  const randomFileName = getRandomFileName(".mp3");

  const cs = 'VISITOR_INFO1_LIVE=BZLnInSfl8c; VISITOR_PRIVACY_METADATA=CgJJRBIEGgAgTQ%3D%3D; YSC=M1JMuaGd1bY; GPS=1; __Secure-1PSIDTS=sidts-CjIBQlrA-AoaXSzeu_estzOOqKcIKs_dg3IsTrIKWdcM_0jI0POp4qYxVed4J2DO6tTc0RAA; __Secure-3PSIDTS=sidts-CjIBQlrA-AoaXSzeu_estzOOqKcIKs_dg3IsTrIKWdcM_0jI0POp4qYxVed4J2DO6tTc0RAA; __Secure-3PAPISID=mefVImErXPpxDKIx/AintujD7iw4LIvc7L; __Secure-3PSID=g.a000owgr1USCR4MbzaX3jVTew_8TypWJ67cVoNqC1UZ2zU53yBBnCruEZdRhmGOIBswL9DK94wACgYKAYUSARISFQHGX2Miv5hfuP6B0_wLsZxXD3PuYhoVAUF8yKoNuFnJoMl0Cj3AjZJJ299w0076; LOGIN_INFO=AFmmF2swRAIgbMjcT_ZWyfcNTh50rMFpjahnJmiA3xk6wlkNnRHbYDoCICPwMpvbnWPttyHQ95SJ1Apspm3gB7Z3ui1lFVnpWSAb:QUQ3MjNmdzRTdEtMbWRtbTFDNVdvbnJNbXUxNnlwVFliZHFiMEFFN0hfWXZEb2xwb3FkdGJWajM0T0wxdmlRa0xZU2hsaUhjNTVLcG84c19BckNsY0VUVUFQZVVZZGRuZUNzc05yN1RsY3F1bXlIWnMzM05ZVmNKM3Z3dXVfVXVTbUxRLVZlODk4anFnbTlVUG16aWhSNThsYUNFYTNHdkVB; PREF=f6=40000000&tz=Asia.Jakarta&f7=100; __Secure-3PSIDCC=AKEyXzXdi-qvela_G6HmCGp7EfAhBHpO_2cp2qOMyM45F8DWhyC5ZzfXvzUPd-cq9dp-Vh2poQ'; // replace with your cookie value
  const authorization = 'SAPISIDHASH 1728210575_15fa4e74ca9a6dfdbf48eb50b8ef016adfd87078_u'; // replace with your authorization value

  const stream = ytdl(urlYt, {
    quality: "highestaudio",
    requestOptions: {
      headers: {
        Cookie: cs,
        Authorization: authorization,
        "x-youtube-identity-token",
      },
    },
    filter: (info) => info.audioBitrate === 160 || info.audioBitrate === 128,
  }).pipe(fs.createWriteStream(`./${randomFileName}`));

  console.log("Audio downloading ->", urlYt);
  await new Promise((resolve, reject) => {
    stream.on("error", reject);
    stream.on("finish", resolve);
  });

  const stats = fs.statSync(`./${randomFileName}`);
  const fileSizeInBytes = stats.size;
  const fileSizeInMegabytes = fileSizeInBytes / (1024 * 1024);
  console.log(`Audio downloaded! Size: ${fileSizeInMegabytes}`);

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
