# StayFinder – Backend

Ett REST-API för en bokningsapp för boenden, inspirerad av Airbnb. Värdar kan lägga upp boenden, och gäster kan söka, boka, ändra och avboka.

Byggt med **Hono**, **TypeScript** och **Supabase** (PostgreSQL + Auth).

---

## Innehåll

- [Teknik](#teknik)
- [Kom igång](#kom-igång)
- [Miljövariabler](#miljövariabler)
- [Projektstruktur](#projektstruktur)
- [API](#api)
- [Säkerhet och regler](#säkerhet-och-regler)
- [Databas](#databas)
- [Testning](#testning)
- [Deploy](#deploy)

---

## Teknik

| Del | Verktyg |
| --- | --- |
| Ramverk | [Hono](https://hono.dev) |
| Språk | TypeScript |
| Databas och inloggning | [Supabase](https://supabase.com) (PostgreSQL, Auth, Row Level Security) |
| Validering | [Zod](https://zod.dev) + `@hono/zod-validator` |
| Inloggning i requests | `@supabase/ssr` med httpOnly-cookies |
| Utveckling | `tsx` |
| Deploy | Vercel |

---

## Kom igång

**1. Klona och installera**

```bash
git clone https://github.com/ManauTunjae/stay-finder-be.git
cd stay-finder-be
npm install
```

**2. Skapa en `.env`-fil** i projektets rot (se [Miljövariabler](#miljövariabler)).

**3. Starta servern**

```bash
npm run dev
```

Servern startar på `http://localhost:3000` (eller porten i `HONO_PORT`).

### Scripts

| Kommando | Vad det gör |
| --- | --- |
| `npm run dev` | startar servern och laddar om vid ändringar |
| `npm run build` | bygger TypeScript till `dist/` |
| `npm start` | kör den byggda versionen |
| `npx tsc --noEmit` | kontrollerar alla typer utan att bygga |

---

## Miljövariabler

| Namn | Beskrivning |
| --- | --- |
| `SUPABASE_URL` | Project URL från Supabase |
| `SUPABASE_KEY` | Publishable (anon) key från Supabase |
| `NODE_ENV` | `development` lokalt, `production` på servern |
| `HONO_PORT` | port lokalt (valfri, standard `3000`) |

> `.env` ligger i `.gitignore` och ska aldrig committas.

---

## Projektstruktur

```
src/
├── index.ts            # startar appen, kopplar routes och middleware
├── env.ts              # läser och kontrollerar miljövariabler
├── lib/
│   └── supabase.ts     # Supabase-klient
├── middleware/
│   └── auth.ts         # optionalAuth och requireAuth
├── routes/             # endpoints
│   ├── auth.ts
│   ├── properties.ts
│   └── bookings.ts
├── database/           # alla anrop till Supabase
│   ├── property.ts
│   └── booking.ts
├── validators/         # Zod-scheman för body, params och query
├── types/              # TypeScript-typer
└── utils/
    ├── date.ts         # calculateNights, getTodayDate
    └── validation.ts   # formaterar valideringsfel
```

Uppdelningen följer en enkel regel: **routes** tar emot requesten, **validators** kontrollerar datan, och **database** pratar med Supabase.

---

## API

Inloggning sker med en **httpOnly-cookie**. Från en frontend behöver varje anrop som kräver inloggning `credentials: "include"`.

Datum skrivs alltid som `YYYY-MM-DD`.

### Auth

| Metod | Route | Inloggning | Beskrivning |
| --- | --- | --- | --- |
| POST | `/auth/register` | nej | skapa konto (`email`, `password`) |
| POST | `/auth/login` | nej | logga in, sätter cookie |
| POST | `/auth/logout` | ja | logga ut, tömmer cookie |
| GET | `/auth/me` | nej | `{ user: { id, email } }` eller `{ user: null }` |

### Properties

| Metod | Route | Inloggning | Beskrivning |
| --- | --- | --- | --- |
| GET | `/properties` | nej | lista med filter, sortering och paginering |
| GET | `/properties/my-properties` | ja | den inloggades boenden |
| GET | `/properties/kind/:kind` | nej | `villa` eller `apartment` |
| GET | `/properties/:id` | nej | ett boende |
| POST | `/properties` | ja | skapa ett boende |
| PUT | `/properties/:id` | ja, ägaren | uppdatera ett boende |
| DELETE | `/properties/:id` | ja, ägaren | ta bort ett boende |

**Query-parametrar för listor**

| Parameter | Beskrivning |
| --- | --- |
| `city`, `country` | filtrera på plats |
| `max_guests` | boenden för minst så många gäster |
| `min_price`, `max_price` | prisintervall per natt |
| `q` | sök i titel, beskrivning och stad |
| `check_in`, `check_out` | bara boenden som är lediga hela perioden |
| `sort_by` | `title`, `city`, `price_per_night`, `created_at` |
| `sort_order` | `asc` eller `desc` |
| `limit`, `offset` | paginering (max 50 per sida) |

Svar: `{ data: [...], count, offset, limit }`

Exempel:

```
GET /properties?city=Stockholm&check_in=2026-12-10&check_out=2026-12-13&sort_by=price_per_night&sort_order=asc
```

### Bookings

Alla kräver inloggning.

| Metod | Route | Vem | Beskrivning |
| --- | --- | --- | --- |
| GET | `/bookings` | gäst och värd | gästen ser sina, värden ser bokningar på sina boenden |
| GET | `/bookings/:id` | gäst och värd | en bokning |
| POST | `/bookings` | inloggad | skapa en bokning |
| PATCH | `/bookings/:id/guests` | gästen | ändra antal gäster |
| PATCH | `/bookings/:id/dates` | gästen | ändra datum, priset räknas om |
| PATCH | `/bookings/:id/confirm` | värden | bekräfta en bokning |
| PATCH | `/bookings/:id/cancel` | gäst eller värd | avboka |

### Statuskoder

| Kod | Betyder |
| --- | --- |
| 200 / 201 | lyckades / skapad |
| 400 | felaktig data |
| 401 | inte inloggad |
| 403 | inloggad, men fel roll |
| 404 | finns inte, eller du får inte se den |
| 409 | konflikt, t.ex. dubbelbokning eller fel status |

### Felformat

```json
{ "error": "Booking not found" }
```

Valideringsfel:

```json
{ "errors": [["check_out", "Check-out must be after check-in"]] }
```

---

## Säkerhet och regler

### Ägarskap
- Ett boende tillhör den som skapade det (`host_id`). Bara ägaren kan ändra eller ta bort det.
- En bokning tillhör gästen som gjorde den (`guest_id`).
- En gäst ser bara sina egna bokningar. En värd ser alla bokningar på sina boenden.
- `host_id` och `guest_id` sätts av servern från inloggningen. Klienten kan inte välja dem.

### Bokningar
- **Inga dubbelbokningar.** En ny eller ändrad bokning får inte krocka med en annan bokning som inte är avbokad. En ändrad bokning krockar inte med sig själv.
- **Kapacitet.** Antal gäster kontrolleras mot boendets `max_guests` i databasen.
- **Pris.** `total_price` räknas på servern (nätter × pris per natt) och sparas. Om boendets pris ändras senare påverkas inte befintliga bokningar.
- **Tid.** Check-in i det förflutna nekas. En bokning vars check-in har passerat kan inte ändras eller avbokas.

### Statusflöde

```
pending   → confirmed   (bara värden)
pending   → cancelled   (gäst eller värd)
confirmed → cancelled   (gäst eller värd)
cancelled → —           (låst)
```

En ny bokning blir alltid `pending`. Gästen kan bara ändra en bokning medan den är `pending`.

---

## Databas

### Tabeller

**properties:** `property_id`, `title`, `description`, `city`, `country`, `kind`, `price_per_night`, `max_guests`, `image_url`, `host_id`, `created_at`

**bookings:** `booking_id`, `property_id`, `guest_id`, `guest_name`, `guest_email`, `check_in`, `check_out`, `guests`, `status`, `total_price`, `created_at`

Databasen kontrollerar också själv, bland annat:
- `check_out` måste vara efter `check_in`
- `guests`, `price_per_night` och `total_price` måste vara större än 0
- `status` kan bara vara `pending`, `confirmed` eller `cancelled`
- `kind` kan bara vara `apartment` eller `villa`

### Row Level Security

| Tabell | Kommando | Vem |
| --- | --- | --- |
| properties | SELECT | alla |
| properties | INSERT, UPDATE, DELETE | bara ägaren |
| bookings | INSERT | den inloggade, som gäst |
| bookings | SELECT | gästen, och värden för boendet |
| bookings | UPDATE | gästen eller värden för boendet |

Routerna använder den inloggade användarens Supabase-klient, så att RLS vet vem som frågar.

### Databasfunktioner

| Funktion | Används till |
| --- | --- |
| `has_overlapping_booking` | kontrollera dubbelbokningar |
| `get_unavailable_property_ids` | söka lediga boenden |

Båda är `security definer`: de ser alla bokningar, men returnerar bara ja/nej eller boende-id:n. Ingen information om andra gäster lämnar databasen.

---

## Testning

API:t är testat i **Postman** med flera användare (två värdar och två gäster), både för det som ska lyckas och det som ska nekas. Exempel:

- en gäst kan inte se eller ändra en annan gästs bokning → 404
- en gäst kan inte bekräfta sin egen bokning → 403
- en bokning som krockar med en annan → 409
- ett pris som klienten skickar ignoreras

---

## Deploy

Projektet är deployat på **Vercel**, som känner igen Hono automatiskt.

1. Koppla repot i Vercel och välj `main` som produktions-branch
2. Lägg in miljövariablerna under **Settings → Environment Variables** (med `NODE_ENV=production`)
3. Varje merge till `main` deployas automatiskt

`src/index.ts` exporterar appen med `export default app`. Den lokala servern (`serve`) startar bara när appen inte körs på Vercel.
