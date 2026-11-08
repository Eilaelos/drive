# Dark War giftcode-bot (Discord)

Spelers koppelen één keer hun UID; daarna wisselt de bot elke nieuwe giftcode automatisch voor hen in via het officiële Gift Center. Hij gebruikt dezelfde API-aanroepen als `tools/darkwar-autoredeem` (`getcodeuser.php` en `code.php`). Er is geen wachtwoord of QR-login nodig.

Antwoorden in het Nederlands, Engels, Frans, Spaans, Duits en Arabisch. De bot volgt de taal van je Discord-client; Arabisch (dat Discord niet als clienttaal heeft) kies je met `/language`.

## Commando's

| Commando | Wie | Wat |
|---|---|---|
| `/link uid` | iedereen | UID koppelen (max. 10 per persoon). De bot controleert de UID bij Dark War, toont naam/state/HQ en wisselt meteen alle actieve codes in. |
| `/unlink uid` | iedereen | Account loskoppelen |
| `/accounts` | iedereen | Je gekoppelde accounts |
| `/redeem code` | iedereen | Code nu inwisselen voor al je accounts. Werkt hij, dan komt hij op de gedeelde lijst en krijgt iedereen hem. |
| `/codes` | iedereen | Actieve codes |
| `/notify on` | iedereen | DM bij ingewisselde codes aan/uit (standaard aan) |
| `/language` | iedereen | Taal van de bot |
| `/dwhelp` | iedereen | Uitleg |
| `/addcode code note` | Manage Server | Code toevoegen en meteen voor iedereen inwisselen |
| `/removecode code` | Manage Server | Code van de lijst halen |
| `/setup codes_channel log_channel` | Manage Server | Kanaal om codes uit te lezen en kanaal voor de resultaten |
| `/runnow` | Manage Server | Nu een ronde draaien |
| `/botstatus` | Manage Server | Aantal gebruikers, accounts, codes, laatste ronde |

## Zo komt de bot automatisch aan nieuwe codes

1. **Officiële aankondigingen volgen.** Ga in de officiële Dark War-Discord (discord.gg/darkwar) naar het kanaal waar codes worden aangekondigd. Is dat een aankondigingskanaal, dan staat er een knop **Follow**: kies een kanaal in jouw server. Zet dat kanaal met `/setup codes_channel:#kanaal`. Elke gevolgde aankondiging komt binnen als webhookbericht; de bot haalt de codes eruit en wisselt ze voor iedereen in.
2. **Admins** posten een code in dat kanaal of gebruiken `/addcode`.
3. **Spelers** die met `/redeem` een werkende code invoeren, delen hem automatisch met iedereen.

Daarnaast draait elke `AUTO_INTERVAL_MIN` minuten (standaard 60) een ronde over alle accounts en actieve codes, zodat nieuw gekoppelde of eerder mislukte accounts worden bijgewerkt. Codes die Dark War als verlopen, onbestaand of op hun limiet meldt, worden gemarkeerd en niet meer geprobeerd.

Berichten van gewone leden in het codekanaal worden genegeerd (alleen webhooks/gevolgde kanalen en leden met Manage Server tellen), zodat niemand rommel kan laten inwisselen.

## Installeren

1. https://discord.com/developers/applications → **New Application** (of gebruik de bestaande Translator-app) → **Bot** → **Reset Token**.
2. Zet onder **Privileged Gateway Intents** de **Message Content Intent** aan als je het codekanaal wilt laten uitlezen.
3. Uitnodigen: **OAuth2 → URL Generator** → scopes `bot` en `applications.commands`, rechten *View Channels*, *Send Messages*, *Read Message History*.
4. Starten:

```bash
cd bots/darkwar-redeem-bot
cp .env.example .env      # DISCORD_TOKEN invullen
npm install
npm start                 # Node 20+
```

Of met Docker, vanuit de root van de repo:

```bash
docker build -f bots/darkwar-redeem-bot/Dockerfile -t darkwar-redeem-bot .
docker run -d --restart unless-stopped --env-file bots/darkwar-redeem-bot/.env -v dwbot-data:/data darkwar-redeem-bot
```

De bot moet continu draaien (een VPS, Raspberry Pi, Railway, Fly.io, …). GitHub Actions is daar niet geschikt voor; daarvoor is het losse script in `tools/darkwar-autoredeem`.

Slash-commando's worden bij het opstarten geregistreerd. Met `GUILD_ID` gebeurt dat alleen in die server en zijn ze meteen zichtbaar; zonder `GUILD_ID` globaal.

## Gegevens

`data/db.json` bevat per Discord-gebruiker de gekoppelde UID's, taal, DM-instelling en welke codes per UID klaar zijn, plus de codelijst en de kanaalinstellingen per server. Maak er een back-up van; zet hem niet in git (staat in `.gitignore`).

Alle oproepen naar Dark War lopen door één wachtrij met `DWS_DELAY_MS` (standaard 2,5 s) ertussen. Eén nieuwe code voor 100 accounts duurt dus ongeveer 8 minuten (inloggen plus inwisselen per account).

## Testen

```bash
npm test
```

De tests draaien tegen een nagebootste Discord-client en een nagebootst Gift Center: koppelen, `/redeem` die een code deelt, verlopen codes, het codekanaal, de wachtrij, en of elke taal alle teksten heeft. Tegen de echte Dark War-API is de bot nog niet getest.
