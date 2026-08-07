import type { Locale } from "./config";

// A kategóriák semleges kulcsokkal élnek az adatbázisban; itt a címkéik.
export const CATEGORY_LABELS: Record<Locale, Record<string, string>> = {
  hu: {
    food: "gasztro",
    craft: "kézművesség",
    movement: "mozgás",
    adrenaline: "adrenalin",
    nature: "természet",
    social: "társas",
    mind: "elme",
  },
  en: {
    food: "food & drink",
    craft: "craft",
    movement: "movement",
    adrenaline: "adrenaline",
    nature: "nature",
    social: "social",
    mind: "mind",
  },
};

const hu = {
  meta: {
    title: "That's a First — csinálj valamit életedben először",
    description:
      "Gyűjtemény és mozgalom azokról a dolgokról, amiket az emberek életükben először próbálnak ki. Minden hónap utolsó szerdáján.",
  },
  nav: {
    collection: "Gyűjtemény",
    story: "A sztori",
    newsletter: "Hírlevél",
  },
  footer: {
    tagline:
      "that's a first — minden hónap utolsó szerdáján csinálj valamit, amit még soha.",
    collection: "Gyűjtemény",
    admin: "Admin",
  },
  hero: {
    chipNext: "következő alkalom:",
    chipWeeks: (weeks: number) => ` — még ${weeks} hét`,
    titlePre: "Csinálj valamit ",
    titleHl: "életedben először",
    titlePost: ".",
    sub: "A That's a First egy gyűjtemény és egy mozgalom: dolgok, amiket az emberek életükben először próbálnak ki — és egy ritmus, ami segít, hogy te is sorra kerülj.",
    ctaBrowse: "Böngészd a gyűjteményt",
    ctaPdf: "Az 50-es lista (PDF)",
    samples: [
      "üvegfúvás",
      "hajnali madárles",
      "vacsora a sötétben",
      "improszínház",
      "jégfürdő",
    ],
    samplesLabel: "Példák",
    andMore: "…és még 45 másik a gyűjteményben",
  },
  how: {
    eyebrow: "Így megy ez",
    steps: [
      {
        title: "Válassz valamit, amit még sosem csináltál",
        text: "A gyűjteményben ötven ötlet vár, a kombuchától a tandemugrásig. Az számít, hogy neked legyen első.",
      },
      {
        title: "Hívj el valakit",
        text: "Minden ötletnél találsz egy kész meghívó üzenetet — másold ki, küldd el, és máris ketten vagytok.",
      },
      {
        title: "A hónap utolsó szerdáján csináljátok meg",
        text: "Utána üljetek be valahova, és beszéljétek meg. Ez a rész legalább olyan fontos, mint maga az élmény.",
      },
    ],
  },
  story: {
    eyebrow: "Honnan jött ez az egész",
    titlePre: "Egy baráti társaság, húsz év, ",
    titleHl: "minden hónap utolsó szerdája",
    paragraphs: [
      "Lassan húsz éve, hogy egy baráti társaság — mi — elkezdett minden hónap utolsó szerdáján találkozni. A szabály egyszerű: mindig olyat csinálunk, amit korábban még soha. Voltunk már kovácsolni, lebegtünk sötét tartályban, énekeltünk kórusban úgy, hogy senki nem tud kottát olvasni.",
      "A szervezést felváltva visszük, így mindenkinek évente csak egyszer-kétszer kell kitalálnia valamit — cserébe minden hónapban történik velünk valami új. Az este második fele pedig mindig ugyanaz: beülünk valahova, és megbeszéljük, kivel mi történt az elmúlt hónapban.",
      "Ez a ritmus olyan jól működik, hogy úgy döntöttünk, tovább kell adni. Ez a That's a First: a gyűjtemény, a történetek azokról, akik épp most csinálnak valamit először — és a meghívás, hogy állj be te is.",
    ],
  },
  preview: {
    eyebrow: "A gyűjteményből",
    title: "Ezekkel sokan kezdik",
    all: "A teljes gyűjtemény →",
  },
  pdf: {
    eyebrow: "Ingyenes letöltés",
    title: "50 dolog, amit érdemes életedben először kipróbálni",
    sub: "A teljes gyűjtemény egyetlen szép listában — nyomtasd ki, tedd ki a hűtőre, és pipáld ki, ami már megvolt.",
    button: "Letöltöm a listát (PDF)",
    file: "/thats-a-first-50.hu.pdf",
  },
  newsletterSection: {
    eyebrow: "Hírlevél",
    titlePre: "Havonta egy levél, ",
    titleHl: "pont időben",
    sub: "A hónap első szerdáján küldjük, benne friss történetekkel azokról, akik épp valamit először csináltak, és ötletekkel a saját utolsó szerdádra. Pontosan annyi idővel előre, hogy még össze tudd szervezni.",
  },
  subscribe: {
    placeholder: "neved@example.com",
    submit: "Feliratkozom",
    saving: "Mentés…",
    emailLabel: "E-mail-cím",
    invalid: "Ez nem tűnik e-mail-címnek — nézd meg még egyszer.",
    saveError: "Nem sikerült menteni a feliratkozást.",
    success: "Megvan! A hónap első szerdáján jön az első leveled.",
  },
  collection: {
    eyebrow: "Gyűjtemény",
    titlePre: "Mit csinálsz ",
    titleHl: "először",
    titlePost: "?",
    sub: "Ötven kipróbált ötlet. Mindegyiknél találsz egy kész meghívó üzenetet is — mert kettesben minden első könnyebb.",
    allLabel: "mind",
    categoriesLabel: "Kategóriák",
    empty: "Ebben a kategóriában még nincs semmi — nézd meg a többit!",
  },
  detail: {
    back: "← Vissza a gyűjteményhez",
    inviteEyebrow: "Hívj el valakit",
    inviteTitle: "Küldd el ezt az üzenetet, és már ketten vagytok",
    nextWednesdayPre: "A következő utolsó szerda: ",
    nextWednesdayPost: " — épp elég idő megszervezni.",
    copyLabel: "Meghívó üzenet másolása",
    copied: "Kimásolva ✓",
    related: "Ha ez tetszik",
    notFound: "Nincs ilyen oldal — That's a First",
  },
};

const en: typeof hu = {
  meta: {
    title: "That's a First — do something for the first time",
    description:
      "A collection and a movement built on things people try for the first time in their lives. Every last Wednesday of the month.",
  },
  nav: {
    collection: "Collection",
    story: "The story",
    newsletter: "Newsletter",
  },
  footer: {
    tagline:
      "that's a first — on the last Wednesday of every month, do something you've never done.",
    collection: "Collection",
    admin: "Admin",
  },
  hero: {
    chipNext: "next one:",
    chipWeeks: (weeks: number) => ` — ${weeks} weeks to go`,
    titlePre: "Do something ",
    titleHl: "for the first time",
    titlePost: " in your life.",
    sub: "That's a First is a collection and a movement: things people try for the first time in their lives — and a rhythm that makes sure you get your turn too.",
    ctaBrowse: "Browse the collection",
    ctaPdf: "The list of 50 (PDF)",
    samples: [
      "glassblowing",
      "birdwatching at dawn",
      "dinner in the dark",
      "improv theatre",
      "ice bath",
    ],
    samplesLabel: "Examples",
    andMore: "…and 45 more in the collection",
  },
  how: {
    eyebrow: "How it works",
    steps: [
      {
        title: "Pick something you've never done",
        text: "Fifty ideas are waiting in the collection, from kombucha to a tandem skydive. All that matters is that it's a first for you.",
      },
      {
        title: "Invite someone",
        text: "Every idea comes with a ready-made invite message — copy it, send it, and now there are two of you.",
      },
      {
        title: "Do it on the last Wednesday of the month",
        text: "Then sit down somewhere and talk it over. That part matters at least as much as the experience itself.",
      },
    ],
  },
  story: {
    eyebrow: "Where this all comes from",
    titlePre: "A group of friends, twenty years, ",
    titleHl: "the last Wednesday of every month",
    paragraphs: [
      "For almost twenty years now, a group of friends — us — has been meeting on the last Wednesday of every month. The rule is simple: we always do something none of us has ever done before. We've forged iron, floated in a dark tank, sung in a choir without a single person who could read sheet music.",
      "We take turns organizing, so each of us only has to come up with something once or twice a year — and in exchange, something new happens to all of us every single month. The second half of the evening never changes: we sit down somewhere and catch up on what happened to everyone since last time.",
      "This rhythm works so well that we decided it had to be passed on. That's what That's a First is: the collection, the stories of people doing something for the first time right now — and the invitation for you to join in.",
    ],
  },
  preview: {
    eyebrow: "From the collection",
    title: "Popular first firsts",
    all: "The full collection →",
  },
  pdf: {
    eyebrow: "Free download",
    title: "50 things worth trying for the first time in your life",
    sub: "The whole collection in one beautiful list — print it, stick it on the fridge, and tick off what you've already done.",
    button: "Download the list (PDF)",
    file: "/thats-a-first-50.en.pdf",
  },
  newsletterSection: {
    eyebrow: "Newsletter",
    titlePre: "One letter a month, ",
    titleHl: "right on time",
    sub: "We send it on the first Wednesday of the month, with fresh stories of people who just did something for the first time and ideas for your own last Wednesday. Exactly enough lead time to get it organized.",
  },
  subscribe: {
    placeholder: "you@example.com",
    submit: "Subscribe",
    saving: "Saving…",
    emailLabel: "Email address",
    invalid: "That doesn't look like an email address — give it another look.",
    saveError: "We couldn't save your subscription.",
    success: "Done! Your first letter arrives on the first Wednesday of the month.",
  },
  collection: {
    eyebrow: "Collection",
    titlePre: "What will you do ",
    titleHl: "first",
    titlePost: "?",
    sub: "Fifty tried-and-tested ideas. Each one comes with a ready-made invite message — because every first is easier with company.",
    allLabel: "all",
    categoriesLabel: "Categories",
    empty: "Nothing in this category yet — check out the others!",
  },
  detail: {
    back: "← Back to the collection",
    inviteEyebrow: "Invite someone",
    inviteTitle: "Send this message and there are two of you",
    nextWednesdayPre: "The next last Wednesday: ",
    nextWednesdayPost: " — plenty of time to organize it.",
    copyLabel: "Copy invite message",
    copied: "Copied ✓",
    related: "If you like this one",
    notFound: "Page not found — That's a First",
  },
};

const dictionaries = { hu, en };

export type Dictionary = typeof hu;

export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale];
}
