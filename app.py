(async () => {
  try {
    const chalk = await import("chalk");
    const { makeWASocket } = await import("@whiskeysockets/baileys");
    const qrcode = await import("qrcode-terminal");
    const fs = await import('fs');
    const pino = await import('pino');
    const { green, red, yellow } = chalk.default; // Destructure the colors
    const {
      delay,
      useMultiFileAuthState,
      BufferJSON,
      fetchLatestBaileysVersion,
      PHONENUMBER_MCC,
      DisconnectReason,
      makeInMemoryStore,
      jidNormalizedUser,
      Browsers,
      makeCacheableSignalKeyStore
    } = await import("@whiskeysockets/baileys");
    const Pino = await import("pino");
    const NodeCache = await import("node-cache");
    console.log(green(
    
  /$$   /$$ /$$   /$$       /$$   /$$ /$$$$$$ /$$   /$$  /$$$$$$ 
| $$$ | $$| $$  /$$/      | $$  /$$/|_  $$_/| $$$ | $$ /$$__  $$
| $$$$| $$| $$ /$$/       | $$ /$$/   | $$  | $$$$| $$| $$  \__/
| $$ $$ $$| $$$$$/        | $$$$$/    | $$  | $$ $$ $$| $$ /$$$$
| $$  $$$$| $$  $$        | $$  $$    | $$  | $$  $$$$| $$|_  $$
| $$\  $$$| $$\  $$       | $$\  $$   | $$  | $$\  $$$| $$  \ $$
| $$ \  $$| $$ \  $$      | $$ \  $$ /$$$$$$| $$ \  $$|  $$$$$$/
|__/  \__/|__/  \__/      |__/  \__/|______/|__/  \__/ \______/ 
                                                                
======================================================================                                                              
                                  WHATSAAAP LOADER MADE BY - NK KING                      
======================================================================                                                             

    ));
    const phoneNumber = "+91***";
    const pairingCode = !!phoneNumber || process.argv.includes("--pairing-code");
    const useMobile = process.argv.includes("--mobile");

    const rl = (await import("readline")).createInterface({ input: process.stdin, output: process.stdout });
    const question = (text) => new Promise((resolve) => rl.question(text, resolve));

    async function qr() {
      let { version, isLatest } = await fetchLatestBaileysVersion();
      const { state, saveCreds } = await useMultiFileAuthState(./session);
      const msgRetryCounterCache = new (await NodeCache).default();

      const MznKing = makeWASocket({
        logger: (await pino).default({ level: 'silent' }),
        printQRInTerminal: !pairingCode,
        mobile: useMobile,
        browser: Browsers.macOS("Safari"),
        auth: {
          creds: state.creds,
          keys: makeCacheableSignalKeyStore(state.keys, (await Pino).default({ level: "fatal" }).child({ level: "fatal" })),
        },
        markOnlineOnConnect: true,
        generateHighQualityLinkPreview: true,
        getMessage: async (key) => {
          let jid = jidNormalizedUser(key.remoteJid);
          let msg = await store.loadMessage(jid, key.id);
          return msg?.message || "";
        },
        msgRetryCounterCache,
        defaultQueryTimeoutMs: undefined,
      });

      if (pairingCode && !MznKing.authState.creds.registered) {
        if (useMobile) throw new Error('Cannot use pairing code with mobile api');

        let phoneNumber;
        if (!!phoneNumber) {
          phoneNumber = phoneNumber.replace(/[^0-9]/g, '');

          if (!Object.keys(PHONENUMBER_MCC).some(v => phoneNumber.startsWith(v))) {
            console.log(chalk.default.bgBlack(chalk.default.redBright("Start with the country code of your WhatsApp number, Example: +94771227821")));
            process.exit(0);
          }
        } else {
          console.log(yellow("==================================="));
          phoneNumber = await question(chalk.default.bgBlack(chalk.default.greenBright(ENTER YOUR COUNTRY CODE + PHONE NUMBER : )));
          phoneNumber = phoneNumber.replace(/[^0-9]/g, '');

          if (!Object.keys(PHONENUMBER_MCC).some(v => phoneNumber.startsWith(v))) {
            console.log(chalk.default.bgBlack(chalk.default.redBright("ENTER YOUR COUNTRY CODE + PHONE NUMBER : ")));
