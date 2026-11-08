# Dark War: Survival auto-redeem

Wisselt automatisch elke giftcode in `codes.json` in voor elke UID in het secret `DWS_UIDS`.
Het script praat met dezelfde officiële API als https://www.darkwar-survival.com/giftCenter/ :

| Stap | Aanroep |
|---|---|
| Inloggen | `GET https://giftcenter.darkwar-survival.com/getcodeuser.php?uid=UID` → `{code:0, result:{name, sid, level}}` |
| Code inwisselen | `GET https://giftcenter.darkwar-survival.com/code.php?uid=UID&code=CODE`, header `Usertoken: UID` → `{errorCode:"ok"}` of `E004`–`E009` |

Er is geen wachtwoord, QR-login of sessie nodig: alleen de UID. Beloningen komen in de in-game mailbox.

## Instellen (GitHub Actions)

1. **Settings → Secrets and variables → Actions → New repository secret**: `DWS_UIDS` = `123456789,987654321` (komma's ertussen).
2. Zet de codes in `codes.json`, bijvoorbeeld `["DWDC20EN", "DWDCHG24"]`. De Eventplanner-pagina toont onder *Volautomatisch inwisselen* een kant-en-klare lijst van de actieve gedeelde codes.
3. De workflow `.github/workflows/darkwar-autoredeem.yml` draait elke 6 uur, bij elke wijziging aan `codes.json` en handmatig via **Actions → Dark War auto-redeem → Run workflow** (daar kun je ook losse codes meegeven).

Geplande runs werken alleen als de workflow op de standaardbranch van de repo staat.

`state.json` onthoudt welke UID/code-combinaties klaar zijn en welke codes dood zijn (verlopen, bestaat niet, limiet bereikt). Hij bevat UID's en wordt daarom in de Actions-cache bewaard, niet gecommit. Het overzicht van elke run (in de job summary) toont alleen de laatste 4 cijfers van een UID.

## Lokaal

```bash
DWS_UIDS=123456789 node tools/darkwar-autoredeem/redeem.mjs            # echt inwisselen
DWS_UIDS=123456789 node tools/darkwar-autoredeem/redeem.mjs --dry-run  # alleen tonen wat er zou gebeuren
```

Node 18 of nieuwer, geen dependencies. `DWS_DELAY_MS` (standaard 2500) is de pauze tussen aanroepen. Bij `E009` ("te vaak") wacht het script 4, 8 en 15 seconden en probeert opnieuw.

## Foutcodes (uit de officiële Gift Center-code)

| Code | Betekenis | Gevolg |
|---|---|---|
| `ok` | Ingewisseld | klaar voor deze UID |
| `E004` | Code bestaat niet | code gemarkeerd als dood |
| `E005` | Code verlopen | code gemarkeerd als dood |
| `E006` | Al gebruikt op dit account | klaar voor deze UID |
| `E007` | Inwissellimiet van de code bereikt | code gemarkeerd als dood |
| `E009` | Te veel verzoeken | opnieuw proberen, daarna volgende run |
| login `10018` | Verkeerde UID | UID overgeslagen |

## Let op

- Alleen UID's van mensen die daarmee instemmen. Iedereen die een UID kent, kan er codes op inwisselen (zo werkt de officiële site), maar vraag het eerst.
- Getest tegen een nagebootste API, nog niet tegen de echte. Kijk na de eerste run in de job summary.
- Als de uitgever de API verandert of GitHub-IP's blokkeert, faalt de run met een duidelijke melding.
