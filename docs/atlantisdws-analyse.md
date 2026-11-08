# Analyse atlantisdws.com (Atlantis Hub) — november 2026

Bron: de publieke pagina's en JavaScript-bundels van https://atlantisdws.com/ en van het officiële Gift Center (https://www.darkwar-survival.com/giftCenter/), bekeken op 8 november 2026.

## Hoe hun auto-redeem werkt

Atlantis Hub draait op TanStack Start met een Supabase-backend. Alle Dark War-acties lopen via hun **eigen server** (server functions); de browser praat nooit rechtstreeks met Dark War. Er zijn twee niveaus.

1. **Gift Center (gratis)**: je bewaart tot 5 survivors (UID's). Met één klik stuurt hun server elke actieve code naar Dark War, voor elke survivor na elkaar, met 2,5 s tussen codes en backoff van 4/8/15/25 s bij "cooldown". Een zelf getypte code kan ook (`^[A-Z0-9]{3,32}$`).
2. **Atlantis+ ($4,99/maand, 7 dagen proef, via Stripe)**: volautomatisch inwisselen van nieuwe codes, plus automatische **7-Day Check-in**, **Weekly VIP**, **Free War Pass** en **Membership Points**, tot 15 survivors, en een Discord-DM als de verbinding verloopt.

Voor dat tweede deel koppel je je account via **QR-code (pc) of één tik in de game (telefoon)**, "zonder wachtwoord". Dat is de login van de officiële webshop (darkwar-survival.com / pay.darkwar-survival.com). Atlantis bewaart die sessie op hun server; de UI zegt zelf dat Dark War-sessies binnen 7 dagen verlopen en opnieuw gekoppeld moeten worden. Ze bieden ook "survivor invites" (link voor een vriend, 24 u geldig) en het volgen van de officiële Invite Event-referrals.

## Wat het officiële Gift Center eigenlijk vraagt

Codes inwisselen heeft **geen QR-login nodig**, alleen de UID:

- `GET giftcenter.darkwar-survival.com/getcodeuser.php?uid=…` → naam, server, level
- `GET giftcenter.darkwar-survival.com/code.php?uid=…&code=…` met header `Usertoken: <uid>` → `errorCode` `ok` / `E004` bestaat niet / `E005` verlopen / `E006` al gebruikt / `E007` limiet / `E009` te vaak

De QR-sessie is alleen nodig voor check-in, VIP, War Pass en de webshop.

## Wat wij nu bieden

| Functie | Atlantis | Onze Eventplanner |
|---|---|---|
| Survivors bewaren | 5 gratis, 15 met Plus (server) | 10, alleen in je eigen browser |
| Codelijst | door hun team bijgehouden | gedeelde lijst, door spelers aangevuld, met meldingen "werkt" en "verlopen" |
| Eén-klik inwisselen in de browser | ja (via hun server) | nee: de pagina mag geen andere sites contacteren. Wel een assistent: UID en code kopiëren, Gift Center openen, resultaat bijhouden per survivor |
| Volautomatisch, op schema | Atlantis+ | `tools/darkwar-autoredeem` + GitHub Action elke 6 uur, gratis |
| Check-in, VIP, War Pass | Atlantis+ (QR-sessie) | bewust niet: dat vraagt sessiesleutels van spelers op een server te bewaren |
| Talen | Engels (+ taalkeuze) | NL, EN, FR, ES, DE, AR (rechts-naar-links) |

## Andere functies van Atlantis die we (nog) niet hebben

State Archives (alle states en records), Hive Planner en Community Hives, Capital Planner, Black Gold Planner, Red Gear-, Chip-, Exclusive Weapon- en APC Workshop-calculator, Industrial Buildings, Migration Center (allianties zoeken/aanbieden), Power Arena-leaderboard, Supremacy (SvS-archief), Achievements/badges, een FAQ met 230+ antwoorden, Server Time, Wiki, een tekstgenerator voor gekleurde bio-tekst, Content Creators, AtlantisTV en mini-games (Arcade).

Logische volgende stappen voor onze hub: een Red Gear-calculator, een Black Gold Battlefield-planner en een Discord-commando `/redeem` in de bot, dat dezelfde twee API-aanroepen gebruikt.

## Kanttekeningen

- Atlantis is een onofficieel fanproject ("not affiliated with Omnilojo Limited / Florere Game Limited"). Hetzelfde geldt voor ons.
- Volautomatisch inwisselen hangt af van een API die de uitgever op elk moment kan wijzigen of afschermen.
