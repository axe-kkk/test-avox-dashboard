/**
 * Hand-written translation pairs used by the Inbox demo.
 *
 * The Inbox translator is mock-only: there is no live translation service.
 * Instead, when a guest message matches a pair below it is swapped for the
 * translated text. This makes the translator UX feel real for the seed
 * conversations: Anna Koroleva (ru), Alexander Hoffmann (de), Isabella Rossi
 * (it), Carlos Mendoza (es), Dasha Chaban (uk).
 *
 * Lookup is keyed on the trimmed source text. Punctuation and casing matter,
 * so the seed messages must match these strings exactly.
 */

type Lang = 'ru' | 'de' | 'it' | 'es' | 'uk' | 'fr' | 'pl';
type Pair = { src: string; en: string; lang: Lang };

export const translationPairs: Pair[] = [
  // ── Russian (Anna Koroleva, conv_014) ────────────────────────────
  { lang: 'ru', src: 'Здравствуйте! Я бронировал номер на 30 апреля. Можно ранний заезд?',
    en: 'Hello! I booked a room for April 30. Is early check-in possible?' },
  { lang: 'ru', src: 'Я прилетаю утром, рейс в 8:30. Буду в отеле к 10.',
    en: "I land in the morning, flight at 08:30. I'll be at the hotel by 10." },
  { lang: 'ru', src: 'Спасибо! А завтрак входит в стоимость?',
    en: 'Thank you! Is breakfast included?' },
  { lang: 'ru', src: 'Отлично, тогда подтверждаю. До встречи!',
    en: 'Great, confirming then. See you soon!' },
  { lang: 'ru', src: 'Можно ли организовать трансфер из аэропорта?',
    en: 'Could you arrange an airport transfer?' },
  { lang: 'ru', src: 'Хочу отметить день рождения жены. Что вы посоветуете?',
    en: "I'd like to celebrate my wife's birthday. What do you recommend?" },
  { lang: 'ru', src: 'Замечательно, бронируйте, пожалуйста.',
    en: 'Wonderful, please go ahead and book it.' },
  { lang: 'ru', src: 'А какая сегодня погода?',
    en: "What's the weather like today?" },

  // ── German (Alexander Hoffmann, conv_001) ────────────────────────
  { lang: 'de', src: 'Guten Tag, ich möchte unsere Reservierung für den 2. Mai bestätigen. Können Sie auch einen Champagner-Empfang für meine Frau arrangieren? Es ist unser Hochzeitstag.',
    en: "Good day, I'd like to confirm our reservation for May 2. Could you also arrange a champagne welcome for my wife? It's our anniversary." },
  { lang: 'de', src: 'Wunderbar, vielen Dank! Außerdem hätten wir gerne Rosenblätter im Zimmer.',
    en: 'Wonderful, thank you! We would also like rose petals in the room.' },
  { lang: 'de', src: 'Ja, gerne. Buchen Sie bitte das Romance-Paket und reservieren Sie das Restaurant für 20:00.',
    en: 'Yes, gladly. Please book the Romance package and reserve the restaurant for 8 PM.' },
  { lang: 'de', src: 'Eine letzte Frage — ist es möglich, das Auto vor dem Eingang abzustellen, bis das Gepäck im Zimmer ist?',
    en: 'One last question — is it possible to leave the car at the entrance until the luggage is in the room?' },
  { lang: 'de', src: 'Vielen Dank, wir freuen uns sehr auf den Aufenthalt.',
    en: 'Thank you very much, we are really looking forward to the stay.' },
  { lang: 'de', src: 'Können Sie eine glutenfreie Geburtstagstorte für Samstagabend besorgen?',
    en: 'Could you arrange a gluten-free birthday cake for Saturday evening?' },

  // ── Italian (Isabella Rossi, conv_004) ───────────────────────────
  { lang: 'it', src: 'Ciao! Vorremmo venire il 23 aprile — ho prenotato online. Avete disponibilità per un trattamento spa il primo giorno?',
    en: "Hi! We'd like to come on April 23 — I booked online. Do you have availability for a spa treatment on the first day?" },
  { lang: 'it', src: 'Le 18:00 sarebbero perfette. Possiamo anche avere una camera con vista sul giardino?',
    en: '6 PM would be perfect. Could we also have a room with a garden view?' },
  { lang: 'it', src: 'E a che ora aprite la colazione la domenica?',
    en: 'And what time does breakfast open on Sunday?' },
  { lang: 'it', src: 'Perfetto. Una richiesta — siamo allergici alle noci, può segnalarlo alla cucina?',
    en: "Perfect. One request — we're allergic to nuts, could you flag it to the kitchen?" },
  { lang: 'it', src: 'Grazie mille, a presto!',
    en: 'Thank you so much, see you soon!' },

  // ── Spanish (Carlos Mendoza, conv_005) ───────────────────────────
  { lang: 'es', src: '¡Hola! ¿Estará lista la cuna en la habitación cuando lleguemos?',
    en: 'Hi! Will the cot be ready in the room when we arrive?' },
  { lang: 'es', src: 'Tiene 6 meses. ¡Muchas gracias!',
    en: "He's 6 months old. Thank you very much!" },
  { lang: 'es', src: 'Una pregunta más — ¿pueden añadir leche sin lactosa al desayuno?',
    en: 'One more question — can you add lactose-free milk to the breakfast?' },
  { lang: 'es', src: 'Perfecto, nos vemos mañana.',
    en: "Perfect, see you tomorrow." },

  // ── Ukrainian (Dasha Chaban, conv_012) ───────────────────────────
  { lang: 'uk', src: 'Привіт! Можна замовити квіти в номер на 3 травня? Бюджет до €60.',
    en: 'Hi! Can I order flowers to the room on May 3? Budget up to €60.' },
  { lang: 'uk', src: 'Білі/пастельні. І додайте листівку “З річницею”.',
    en: 'White/pastel. And add a card saying "Happy Anniversary".' },
  { lang: 'uk', src: 'Супер, дякую!',
    en: 'Awesome, thanks!' },
  { lang: 'uk', src: 'Чи є у готелі парковка для електромобіля?',
    en: 'Does the hotel have parking for an electric car?' },

  // ── French (Sébastien Aubert, conv_018 — Conversion engine demo) ─────
  { lang: 'fr', src: 'Bonjour, je regarde votre site depuis hier — j\'hésite entre la Suite Romantica et la Grand Corner Suite pour notre week-end du 15 mai. Quelle est la vraie différence pour le prix ?',
    en: "Hello, I've been looking at your site since yesterday — I'm hesitating between the Suite Romantica and the Grand Corner Suite for our weekend on May 15. What's the real difference for the price?" },
  { lang: 'fr', src: 'D\'accord. Et si je réserve aujourd\'hui, est-ce qu\'il y a un avantage ?',
    en: "OK. And if I book today, is there any advantage?" },
  { lang: 'fr', src: 'Très bien, je prends la Grand Corner Suite. Je vous envoie ma carte par email sécurisé.',
    en: "Very well, I'll take the Grand Corner Suite. I'll send my card by secure email." },
  { lang: 'fr', src: 'Une dernière question — pouvez-vous garantir le lit king-size et non deux lits jumeaux ?',
    en: "One last question — can you guarantee the king-size bed and not two twin beds?" },
  { lang: 'fr', src: 'Parfait, merci pour votre patience.',
    en: "Perfect, thank you for your patience." },

  // ── Polish (Magdalena Wójcik, conv_019 — Reputation engine demo) ─────
  { lang: 'pl', src: 'Dzień dobry. Wróciłam wczoraj z pobytu — wszystko było wspaniałe, oprócz hałasu z windy w pierwszą noc. Reszta była idealna.',
    en: "Good day. I came back from my stay yesterday — everything was wonderful, except the noise from the lift on the first night. The rest was perfect." },
  { lang: 'pl', src: 'Tak, zostawię recenzję na Booking.com. Ocena 9/10 — windę zgłaszam tylko jako sugestię.',
    en: "Yes, I'll leave a review on Booking.com. Rating 9/10 — I'm only mentioning the lift as a suggestion." },
  { lang: 'pl', src: 'Dziękuję bardzo. Już rezerwuję na wrzesień.',
    en: "Thank you very much. I'm already booking for September." },
  { lang: 'pl', src: 'Czy macie zniżkę dla powracających gości?',
    en: "Do you have a discount for returning guests?" },
];

const fwd = new Map<string, string>();
const bwd = new Map<string, Pair>();
for (const p of translationPairs) {
  fwd.set(`${p.lang}|${p.src.trim()}`, p.en);
  bwd.set(`en|${p.en.trim()}`, p);
}

/**
 * Translate `text` from `from` to `to`. Returns the dictionary match if one
 * exists, otherwise null so the caller can fall back to a `[XX] text` prefix.
 */
export function lookupTranslation(text: string, from: string, to: string): string | null {
  const key = text.trim();
  if (!key) return null;
  if (from === to) return text;

  // Foreign → English
  if (to === 'en') {
    const hit = fwd.get(`${from}|${key}`);
    return hit ?? null;
  }
  // English → foreign (used when an agent composes in en and replies in target)
  if (from === 'en') {
    const pair = bwd.get(`en|${key}`);
    if (pair && pair.lang === to) return pair.src;
    return null;
  }
  return null;
}
