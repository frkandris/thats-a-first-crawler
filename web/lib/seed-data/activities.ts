// Az induló gyűjtemény: 50 dolog, amit érdemes életedben először kipróbálni.
// Kétnyelvű (hu/en); a kategória semleges kulcs, a címkéit a szótár adja
// (lib/i18n/dictionaries.ts → CATEGORY_LABELS). Ebből épül a DB-seed és a PDF is.
// Konvenció (a digest szabályaival egyezően): tevékenység-először címek,
// sosem "Először..." / "For the first time..." kezdettel.

export type SeedActivityContent = {
  title: string;
  description: string;
  tags: string[];
};

export type SeedActivity = {
  slug: string;
  category: "food" | "craft" | "movement" | "adrenaline" | "nature" | "social" | "mind";
  hu: SeedActivityContent;
  en: SeedActivityContent;
};

export const seedActivities: SeedActivity[] = [
  // ——— Gasztro / Food & drink ———
  {
    slug: "thai-fozotanfolyam",
    category: "food",
    hu: {
      title: "Thai főzőtanfolyam",
      description:
        "Egy este alatt megtanulsz pad thai-t és curryt főzni, és közben kiderül, mennyi mindent lehet elrontani egy wokban. A végén megeszitek, amit főztetek.",
      tags: ["főzés", "csoportos", "este"],
    },
    en: {
      title: "Thai cooking class",
      description:
        "In one evening you learn to cook pad thai and curry, discovering along the way just how much can go wrong in a wok. At the end, you eat what you made.",
      tags: ["cooking", "group", "evening"],
    },
  },
  {
    slug: "kovaszos-kenyersutes",
    category: "food",
    hu: {
      title: "Kovászos kenyérsütés",
      description:
        "Kovászt nevelni olyan, mint háziállatot tartani, csak lassabb. Az első saját kenyér illatát viszont nem felejted el.",
      tags: ["otthon", "türelemjáték", "hétvége"],
    },
    en: {
      title: "Sourdough bread baking",
      description:
        "Raising a sourdough starter is like keeping a pet, only slower. But you'll never forget the smell of your first own loaf.",
      tags: ["at home", "slow burn", "weekend"],
    },
  },
  {
    slug: "vak-borkostolo",
    category: "food",
    hu: {
      title: "Vakborkóstoló",
      description:
        "Címke nélkül minden bor másmilyen. Kiderül, hogy tényleg a vörösbort szereted-e, vagy csak a vörösbor gondolatát.",
      tags: ["kóstoló", "csoportos", "este"],
    },
    en: {
      title: "Blind wine tasting",
      description:
        "Without the label, every wine is a different wine. You find out whether you actually like red — or just the idea of it.",
      tags: ["tasting", "group", "evening"],
    },
  },
  {
    slug: "sajtkeszites",
    category: "food",
    hu: {
      title: "Sajtkészítés",
      description:
        "Tejből sajt lesz a szemed előtt, és hazaviszed, amit gyúrtál. Az első saját mozzarella formátlan lesz és tökéletes.",
      tags: ["műhely", "kézzel", "hétvége"],
    },
    en: {
      title: "Cheesemaking",
      description:
        "Milk turns into cheese before your eyes, and you take home what you kneaded. Your first mozzarella will be shapeless and perfect.",
      tags: ["workshop", "hands-on", "weekend"],
    },
  },
  {
    slug: "kombucha-inditas",
    category: "food",
    hu: {
      title: "Kombucha indítása",
      description:
        "Egy üveg, egy gombakultúra és két hét várakozás. A konyhapultod laborrá változik, és onnantól mindenkinek erről fogsz mesélni.",
      tags: ["otthon", "fermentálás", "türelemjáték"],
    },
    en: {
      title: "Starting a kombucha",
      description:
        "One jar, one culture, two weeks of waiting. Your kitchen counter becomes a lab, and from then on it's all you talk about.",
      tags: ["at home", "fermentation", "slow burn"],
    },
  },
  {
    slug: "rovarkostolo",
    category: "food",
    hu: {
      title: "Rovarkóstoló",
      description:
        "Sült tücsök, lisztkukac-snack. A legnehezebb az első falat, utána már csak ropogtatsz — és életed végéig megvan a sztori.",
      tags: ["bátorságpróba", "kóstoló"],
    },
    en: {
      title: "Insect tasting",
      description:
        "Roasted crickets, mealworm snacks. The first bite is the hardest, after that you're just crunching — and you've got the story for life.",
      tags: ["dare", "tasting"],
    },
  },
  {
    slug: "vacsora-a-sotetben",
    category: "food",
    hu: {
      title: "Vacsora a sötétben",
      description:
        "Teljes sötétségben szolgálják fel a menüt, gyakran látássérült felszolgálók segítségével. Az ízek felerősödnek, a beszélgetés lelassul.",
      tags: ["érzékek", "páros", "este"],
    },
    en: {
      title: "Dinner in the dark",
      description:
        "The menu is served in total darkness, often by visually impaired waiters. Flavors sharpen, conversation slows down.",
      tags: ["senses", "with a partner", "evening"],
    },
  },
  {
    slug: "egyedul-etterembe",
    category: "food",
    hu: {
      title: "Egyedül vacsorázni egy jó étteremben",
      description:
        "Asztal egy főre, telefon a táskában. Elsőre kényelmetlen, aztán kiderül, hogy a saját társaságod egész jó társaság.",
      tags: ["egyedül", "komfortzóna", "este"],
    },
    en: {
      title: "Dining alone at a good restaurant",
      description:
        "A table for one, phone in your bag. Awkward at first — then it turns out your own company is pretty good company.",
      tags: ["solo", "comfort zone", "evening"],
    },
  },

  // ——— Kézművesség / Craft ———
  {
    slug: "fazekaskorongozas",
    category: "craft",
    hu: {
      title: "Fazekaskorongozás",
      description:
        "Az agyag pontosan azt csinálja, amit akar, nem azt, amit te. Az első bögréd ferde lesz, és pont ezért fogod a legjobban szeretni.",
      tags: ["műhely", "kézzel", "csoportos"],
    },
    en: {
      title: "Pottery wheel throwing",
      description:
        "The clay does exactly what it wants, not what you want. Your first mug will be crooked, and that's exactly why you'll love it most.",
      tags: ["workshop", "hands-on", "group"],
    },
  },
  {
    slug: "uvegfuvas",
    category: "craft",
    hu: {
      title: "Üvegfúvás",
      description:
        "Ezerkétszáz fokos, izzó anyagba fújsz levegőt, és gömb lesz belőle. Az egyik leglátványosabb dolog, amit egy délután meg lehet tanulni elkezdeni.",
      tags: ["műhely", "látványos", "oktatós"],
    },
    en: {
      title: "Glassblowing",
      description:
        "You blow air into glowing matter at 1,200 degrees and it becomes a sphere. One of the most spectacular things you can start learning in an afternoon.",
      tags: ["workshop", "spectacular", "with instructor"],
    },
  },
  {
    slug: "linometszes",
    category: "craft",
    hu: {
      title: "Linómetszés",
      description:
        "Vésel, festékezel, nyomtatsz — és minden lenyomat kicsit más. A tükörírásba mindenki belezavarodik elsőre.",
      tags: ["műhely", "nyomtatás", "otthon is"],
    },
    en: {
      title: "Linocut printing",
      description:
        "You carve, ink, print — and every impression comes out slightly different. Everyone gets tangled up in mirror writing the first time.",
      tags: ["workshop", "printing", "at home too"],
    },
  },
  {
    slug: "kovacsolas",
    category: "craft",
    hu: {
      title: "Kovácsolás",
      description:
        "Izzó vasat kalapálsz egy igazi üllőn, és a végén hazaviszel egy kampót vagy kést, amit te formáltál. Meglepően meditatív, amikor nem épp hangos.",
      tags: ["műhely", "erős", "oktatós"],
    },
    en: {
      title: "Blacksmithing",
      description:
        "You hammer glowing iron on a real anvil and take home a hook or a knife you shaped yourself. Surprisingly meditative, when it isn't loud.",
      tags: ["workshop", "strength", "with instructor"],
    },
  },
  {
    slug: "gyertyaontes",
    category: "craft",
    hu: {
      title: "Gyertyaöntés",
      description:
        "Viasz, illóolaj, kanóc — fél nap alatt megvan a technika. Karácsony előtt hirtelen mindenki ajándékát megoldottad.",
      tags: ["műhely", "otthon is", "ajándék"],
    },
    en: {
      title: "Candle making",
      description:
        "Wax, essential oil, a wick — half a day and you've got the technique. Right before Christmas, everyone's gift is suddenly sorted.",
      tags: ["workshop", "at home too", "gift"],
    },
  },
  {
    slug: "konyvkotes",
    category: "craft",
    hu: {
      title: "Könyvkötés",
      description:
        "Papírívekből, tűvel-cérnával varrsz saját füzetet. Amibe aztán például felírhatod, mi mindent akarsz még először csinálni.",
      tags: ["műhely", "aprólékos", "kézzel"],
    },
    en: {
      title: "Bookbinding",
      description:
        "You sew your own notebook from paper sheets with needle and thread. Then use it, say, to list everything else you want to do for the first time.",
      tags: ["workshop", "detail work", "hands-on"],
    },
  },
  {
    slug: "urban-sketching",
    category: "craft",
    hu: {
      title: "Urban sketching",
      description:
        "Leülsz egy térre füzettel és pár ceruzával, és lerajzolod, amit látsz. Nem az a cél, hogy szép legyen, hanem hogy ott voltál és megnézted igazán.",
      tags: ["szabadban", "egyedül is", "rajz"],
    },
    en: {
      title: "Urban sketching",
      description:
        "You sit down on a square with a notebook and a few pencils and draw what you see. The point isn't to make it pretty — it's that you were there and truly looked.",
      tags: ["outdoors", "solo-friendly", "drawing"],
    },
  },

  // ——— Mozgás / Movement ———
  {
    slug: "jegfurdo",
    category: "movement",
    hu: {
      title: "Jégfürdő",
      description:
        "Két perc jeges vízben, vezetett légzéssel. A tested tiltakozik, aztán átvált valami egészen más üzemmódba — utána egész nap ragyogsz.",
      tags: ["hideg", "bátorságpróba", "oktatós"],
    },
    en: {
      title: "Ice bath",
      description:
        "Two minutes in icy water with guided breathing. Your body protests, then switches into an entirely different mode — you glow for the rest of the day.",
      tags: ["cold", "dare", "with instructor"],
    },
  },
  {
    slug: "teremfalmaszas",
    category: "movement",
    hu: {
      title: "Falmászás",
      description:
        "A földről minden út könnyűnek tűnik. Négy méter magasan derül ki, hogy a mászás fejben dől el — és hogy a beülő tényleg megtart.",
      tags: ["terem", "páros", "erős"],
    },
    en: {
      title: "Indoor climbing",
      description:
        "From the ground, every route looks easy. Four meters up you learn that climbing is decided in your head — and that the harness really does hold.",
      tags: ["indoor", "with a partner", "strength"],
    },
  },
  {
    slug: "sup-tura",
    category: "movement",
    hu: {
      title: "SUP-túra",
      description:
        "Állva evezel a vízen, és tíz perc után már nem az egyensúlyra figyelsz, hanem a tájra. Naplementekor a legjobb.",
      tags: ["víz", "szabadban", "nyár"],
    },
    en: {
      title: "SUP tour",
      description:
        "You paddle standing on the water, and after ten minutes you stop watching your balance and start watching the landscape. Best at sunset.",
      tags: ["water", "outdoors", "summer"],
    },
  },
  {
    slug: "nyiltvizi-uszas",
    category: "movement",
    hu: {
      title: "Nyíltvízi úszás",
      description:
        "Medence helyett tó: nincs csempe, nincs fal, csak víz és horizont. Bójával, társsal biztonságos — és teljesen más érzés, mint bármelyik uszoda.",
      tags: ["víz", "szabadban", "nyár"],
    },
    en: {
      title: "Open water swimming",
      description:
        "A lake instead of a pool: no tiles, no walls, just water and horizon. Safe with a buoy and a buddy — and nothing like any swimming pool.",
      tags: ["water", "outdoors", "summer"],
    },
  },
  {
    slug: "gorkorizas",
    category: "movement",
    hu: {
      title: "Görkorizás",
      description:
        "Felnőttként újratanulni esni is művészet. Egy üres parkoló, védőfelszerelés és fél óra múlva már gurulsz — nevetve, óvatosan.",
      tags: ["szabadban", "játékos", "olcsó"],
    },
    en: {
      title: "Rollerblading",
      description:
        "Relearning how to fall as an adult is an art in itself. An empty parking lot, some pads, and half an hour later you're rolling — laughing, carefully.",
      tags: ["outdoors", "playful", "cheap"],
    },
  },
  {
    slug: "rudsport",
    category: "movement",
    hu: {
      title: "Rúdsport óra",
      description:
        "Az első órán kiderül, hogy ez nem show, hanem az egyik legkeményebb erőedzés. Másnap olyan izmaid fájnak, amikről nem is tudtál.",
      tags: ["terem", "erős", "oktatós"],
    },
    en: {
      title: "Pole fitness class",
      description:
        "The first class reveals this isn't a show — it's one of the hardest strength workouts there is. The next day, muscles you didn't know you had are sore.",
      tags: ["indoor", "strength", "with instructor"],
    },
  },
  {
    slug: "capoeira",
    category: "movement",
    hu: {
      title: "Capoeira edzés",
      description:
        "Harcművészet, tánc és zene egyszerre, kör közepén. Kezdőként is azonnal beveszünk a rodába — a ritmus viszi a lábad.",
      tags: ["csoportos", "zene", "játékos"],
    },
    en: {
      title: "Capoeira training",
      description:
        "Martial art, dance and music at once, in the middle of a circle. Even as a beginner you're welcomed into the roda right away — the rhythm carries your feet.",
      tags: ["group", "music", "playful"],
    },
  },
  {
    slug: "tango-ora",
    category: "movement",
    hu: {
      title: "Argentin tangó óra",
      description:
        "Az első órán főleg sétálni tanulsz — ölelésben, zenére. Nem kell partner, és senki nem várja, hogy tudj táncolni.",
      tags: ["tánc", "páros", "este"],
    },
    en: {
      title: "Argentine tango class",
      description:
        "In the first class you mostly learn to walk — in an embrace, to music. No partner needed, and nobody expects you to know how to dance.",
      tags: ["dance", "with a partner", "evening"],
    },
  },
  {
    slug: "trambulinpark",
    category: "movement",
    hu: {
      title: "Trambulinpark",
      description:
        "Egy óra ugrálás, szivacsgödör, dodgeball. Felnőttként belépni kicsit ciki, kijönni csak úgy lehet, hogy mikor jövünk megint.",
      tags: ["játékos", "csoportos", "terem"],
    },
    en: {
      title: "Trampoline park",
      description:
        "An hour of bouncing, foam pits, dodgeball. Walking in as an adult feels a bit silly; walking out only happens with 'when are we coming back?'",
      tags: ["playful", "group", "indoor"],
    },
  },

  // ——— Adrenalin / Adrenaline ———
  {
    slug: "tandemugras",
    category: "adrenaline",
    hu: {
      title: "Tandem ejtőernyős ugrás",
      description:
        "Négyezer méter, nyitott ajtó, és egy döntés, amit a tested nem akar meghozni. A szabadesés egy percig tart, az érzés hetekig.",
      tags: ["magasság", "bátorságpróba", "bakancslista"],
    },
    en: {
      title: "Tandem skydive",
      description:
        "Four thousand meters, an open door, and a decision your body refuses to make. The freefall lasts a minute; the feeling lasts weeks.",
      tags: ["heights", "dare", "bucket list"],
    },
  },
  {
    slug: "via-ferrata",
    category: "adrenaline",
    hu: {
      title: "Via ferrata",
      description:
        "Sziklafalba épített létrák és drótkötelek — hegymászás azoknak, akik még sosem másztak hegyet. Végig be vagy biztosítva, mégis kaland.",
      tags: ["magasság", "szabadban", "túra"],
    },
    en: {
      title: "Via ferrata",
      description:
        "Ladders and steel cables built into the rock face — mountaineering for people who've never climbed a mountain. You're clipped in the whole way, and it's still an adventure.",
      tags: ["heights", "outdoors", "hike"],
    },
  },
  {
    slug: "vitorlazorepules",
    category: "adrenaline",
    hu: {
      title: "Vitorlázórepülés",
      description:
        "Motor nélkül, csak a termikeket lovagolva körözni a táj felett. A csend odafent olyan, amilyet a földön nem hallani.",
      tags: ["magasság", "csendes", "bakancslista"],
    },
    en: {
      title: "Glider flight",
      description:
        "Circling above the landscape with no engine, riding thermals. The silence up there is one you never hear on the ground.",
      tags: ["heights", "quiet", "bucket list"],
    },
  },
  {
    slug: "gokartozas",
    category: "adrenaline",
    hu: {
      title: "Gokartozás",
      description:
        "Tíz centire az aszfalttól minden kanyar kétszer olyan gyorsnak tűnik. Az első köridőd rossz lesz, az utolsó már versenyszellemből születik.",
      tags: ["sebesség", "csoportos", "verseny"],
    },
    en: {
      title: "Go-karting",
      description:
        "Ten centimeters off the asphalt, every corner feels twice as fast. Your first lap time will be bad; your last one is born of pure racing spirit.",
      tags: ["speed", "group", "racing"],
    },
  },
  {
    slug: "canyoning",
    category: "adrenaline",
    hu: {
      title: "Canyoning",
      description:
        "Szurdokban ereszkedsz: csúszol, ugrasz, úszol, kötélen lógsz. Egy nap alatt annyi elemmel találkozol, mint máskor egy év alatt.",
      tags: ["víz", "szabadban", "túravezetős"],
    },
    en: {
      title: "Canyoning",
      description:
        "You descend a gorge: sliding, jumping, swimming, hanging off ropes. In one day you meet more elements than you usually do in a year.",
      tags: ["water", "outdoors", "guided"],
    },
  },
  {
    slug: "bobpalya",
    category: "adrenaline",
    hu: {
      title: "Bobpálya",
      description:
        "Lehúzod a féket ott, ahol eddig mindig behúztad. Két perc az egész, és garantáltan visítasz — jó értelemben.",
      tags: ["sebesség", "olcsó", "családi"],
    },
    en: {
      title: "Alpine coaster",
      description:
        "You let go of the brake exactly where you always used to pull it. It's two minutes, and you will scream — in the good way.",
      tags: ["speed", "cheap", "family"],
    },
  },

  // ——— Természet / Nature ———
  {
    slug: "ejszakai-tura",
    category: "nature",
    hu: {
      title: "Éjszakai túra fejlámpával",
      description:
        "Ugyanaz az erdő, amit nappal ismersz, éjjel egy másik bolygó. A fejlámpa fénykörén túl minden hang kétszer akkora.",
      tags: ["túra", "éjszaka", "csoportos"],
    },
    en: {
      title: "Night hike with a headlamp",
      description:
        "The same forest you know by day is another planet at night. Beyond the circle of your headlamp, every sound is twice as loud.",
      tags: ["hike", "night", "group"],
    },
  },
  {
    slug: "hajnali-madarles",
    category: "nature",
    hu: {
      title: "Hajnali madárles",
      description:
        "Fél öt, távcső, termosz. Amikor megszólal a hajnali kórus, megérted, miért kelnek fel ezért emberek önként.",
      tags: ["hajnal", "csendes", "vezetett"],
    },
    en: {
      title: "Birdwatching at dawn",
      description:
        "Half past four, binoculars, a thermos. When the dawn chorus starts, you understand why people get up for this voluntarily.",
      tags: ["dawn", "quiet", "guided"],
    },
  },
  {
    slug: "vadkemping",
    category: "nature",
    hu: {
      title: "Vadkemping",
      description:
        "Se recepció, se mosdó — csak sátor, csillagok és reggeli harmat. Egy éjszaka elég, hogy másképp nézz a saját ágyadra és az erdőre is.",
      tags: ["éjszaka", "szabadban", "kaland"],
    },
    en: {
      title: "Wild camping",
      description:
        "No reception desk, no bathroom — just a tent, stars and morning dew. One night is enough to change how you see both your own bed and the forest.",
      tags: ["night", "outdoors", "adventure"],
    },
  },
  {
    slug: "barlangaszat",
    category: "nature",
    hu: {
      title: "Barlangászat",
      description:
        "Overál, sisak, sár és kúszás oda, ahova turista nem jut el. A föld alatt kiderül, mekkora luxus a napfény.",
      tags: ["föld alatt", "túravezetős", "bátorságpróba"],
    },
    en: {
      title: "Caving",
      description:
        "Overalls, helmet, mud, and crawling to places tourists never reach. Underground, you learn what a luxury daylight is.",
      tags: ["underground", "guided", "dare"],
    },
  },
  {
    slug: "lovaglas",
    category: "nature",
    hu: {
      title: "Lovaglás",
      description:
        "Az első órán főleg ismerkedsz: a ló hangulatával, a saját egyensúlyoddal, a magassággal. Egy félton múlva már együtt mozogtok.",
      tags: ["állatok", "oktatós", "szabadban"],
    },
    en: {
      title: "Horseback riding",
      description:
        "The first lesson is mostly introductions: to the horse's mood, your own balance, the height. Half an hour later, you're moving together.",
      tags: ["animals", "with instructor", "outdoors"],
    },
  },
  {
    slug: "meheszkedes",
    category: "nature",
    hu: {
      title: "Egy nap a méhésszel",
      description:
        "Védőruhában kinyitni egy kaptárt, amiben ötvenezer méh dolgozik. A zümmögés félelmetesből fél óra alatt megnyugtatóvá válik.",
      tags: ["állatok", "vezetett", "vidék"],
    },
    en: {
      title: "A day with a beekeeper",
      description:
        "Opening a hive of fifty thousand working bees in a protective suit. Within half an hour the buzzing turns from terrifying to soothing.",
      tags: ["animals", "guided", "countryside"],
    },
  },
  {
    slug: "csillagles",
    category: "nature",
    hu: {
      title: "Csillagles távcsővel",
      description:
        "A Szaturnusz gyűrűit először meglátni a saját szemeddel — erre nincs felkészítő fotó. Fényszennyezéstől távol, csillagásszal az igazi.",
      tags: ["éjszaka", "csendes", "vezetett"],
    },
    en: {
      title: "Stargazing with a telescope",
      description:
        "Seeing Saturn's rings with your own eyes — no photo prepares you for it. Best far from light pollution, with an astronomer.",
      tags: ["night", "quiet", "guided"],
    },
  },
  {
    slug: "gombasztura",
    category: "nature",
    hu: {
      title: "Gombásztúra szakértővel",
      description:
        "Az erdő tele van kaviárral, csak eddig nem láttad. Gombaszakértővel járni az avart olyan, mint kincskeresés — vacsorával a végén.",
      tags: ["túra", "ősz", "vezetett"],
    },
    en: {
      title: "Mushroom foraging with an expert",
      description:
        "The forest is full of caviar; you just never saw it. Walking the leaf litter with a mushroom expert is a treasure hunt — with dinner at the end.",
      tags: ["hike", "autumn", "guided"],
    },
  },

  // ——— Társas / Social ———
  {
    slug: "veradas",
    category: "social",
    hu: {
      title: "Véradás",
      description:
        "Negyven perc az életedből, ami valaki másnak szó szerint az élete. Az első alkalom izgulós, a keksz és a hősérzet viszont jár.",
      tags: ["jótett", "olcsó", "gyors"],
    },
    en: {
      title: "Donating blood",
      description:
        "Forty minutes of your life that is literally someone else's life. The first time comes with nerves — the biscuit and the hero feeling come free.",
      tags: ["good deed", "cheap", "quick"],
    },
  },
  {
    slug: "menhelyi-onkenteskedes",
    category: "social",
    hu: {
      title: "Önkénteskedés állatmenhelyen",
      description:
        "Kutyát sétáltatsz, aki hetek óta erre a fél órára vár. Nehéz szívvel jössz el, és már tudod, mikor mész vissza.",
      tags: ["jótett", "állatok", "hétvége"],
    },
    en: {
      title: "Volunteering at an animal shelter",
      description:
        "You walk a dog that has been waiting weeks for that half hour. You leave with a heavy heart, already knowing when you'll be back.",
      tags: ["good deed", "animals", "weekend"],
    },
  },
  {
    slug: "tarsasvacsora-idegenekkel",
    category: "social",
    hu: {
      title: "Társasvacsora idegenekkel",
      description:
        "Hat ember, akik nem ismerik egymást, egy asztal, egy este. A kínos első tíz perc után olyan beszélgetések jönnek, amilyenek régi barátokkal már ritkán.",
      tags: ["ismerkedés", "este", "komfortzóna"],
    },
    en: {
      title: "Dinner with strangers",
      description:
        "Six people who don't know each other, one table, one evening. After ten awkward minutes come the kinds of conversations old friends rarely have anymore.",
      tags: ["meeting people", "evening", "comfort zone"],
    },
  },
  {
    slug: "nyelvcsere-est",
    category: "social",
    hu: {
      title: "Nyelvcsere-est",
      description:
        "Fél órát beszélsz a nyelven, amit tanulsz, fél órát a sajátodon segítesz valakinek. Hibázni itt nemhogy szabad — ez a műfaj lényege.",
      tags: ["nyelv", "ismerkedés", "este"],
    },
    en: {
      title: "Language exchange night",
      description:
        "Half an hour speaking the language you're learning, half an hour helping someone with yours. Making mistakes isn't just allowed here — it's the whole point.",
      tags: ["language", "meeting people", "evening"],
    },
  },
  {
    slug: "utcazeneles",
    category: "social",
    hu: {
      title: "Utcazenélés",
      description:
        "Kiállni egy aluljáróba vagy sétálóutcára három akkorddal és nyitott tokkal. Az első odadobott érme többet ér, mint bármilyen taps.",
      tags: ["zene", "bátorságpróba", "szabadban"],
    },
    en: {
      title: "Busking",
      description:
        "Standing in an underpass or a pedestrian street with three chords and an open case. The first coin tossed in is worth more than any applause.",
      tags: ["music", "dare", "outdoors"],
    },
  },
  {
    slug: "improszinhaz",
    category: "social",
    hu: {
      title: "Improszínház workshop",
      description:
        "Nincs forgatókönyv, nincs jó válasz, csak az »igen, és«. Két óra alatt többet nevetsz, mint egy átlagos hónapban.",
      tags: ["játékos", "csoportos", "komfortzóna"],
    },
    en: {
      title: "Improv theatre workshop",
      description:
        "No script, no right answer, just 'yes, and'. You laugh more in two hours than in an average month.",
      tags: ["playful", "group", "comfort zone"],
    },
  },
  {
    slug: "korusproba",
    category: "social",
    hu: {
      title: "Kóruspróba",
      description:
        "Egyedül a zuhany alatt énekelni és negyven emberrel együtt szólamban — két külön világ. A legtöbb kórus nyílt próbával vár, kottaolvasás nélkül is.",
      tags: ["zene", "csoportos", "hetente"],
    },
    en: {
      title: "Choir rehearsal",
      description:
        "Singing alone in the shower and singing in harmony with forty people are two different worlds. Most choirs hold open rehearsals — no sheet music skills required.",
      tags: ["music", "group", "weekly"],
    },
  },
  {
    slug: "standup-openmic",
    category: "social",
    hu: {
      title: "Stand-up open mic",
      description:
        "Öt perc színpadidő, egy mikrofon és a saját sztorijaid. Ha egyetlen poén ül, megérted, miért csinálja ezt bárki önként.",
      tags: ["színpad", "bátorságpróba", "este"],
    },
    en: {
      title: "Stand-up open mic",
      description:
        "Five minutes of stage time, one microphone, and your own stories. If a single joke lands, you understand why anyone does this voluntarily.",
      tags: ["stage", "dare", "evening"],
    },
  },

  // ——— Elme / Mind ———
  {
    slug: "floating",
    category: "mind",
    hu: {
      title: "Lebegéstartály",
      description:
        "Egy óra testhőmérsékletű sós vízben, hang és fény nélkül. Az agyad először pánikol a semmitől, aztán olyan mélyre enged, ahova ritkán jutsz.",
      tags: ["csendes", "egyedül", "feltöltődés"],
    },
    en: {
      title: "Float tank",
      description:
        "An hour in body-temperature salt water with no sound or light. Your brain first panics at the nothingness, then lets you somewhere you rarely get to go.",
      tags: ["quiet", "solo", "recharge"],
    },
  },
  {
    slug: "csendmeditacio",
    category: "mind",
    hu: {
      title: "Egynapos csendmeditáció",
      description:
        "Reggeltől estig egyetlen szó nélkül, vezetett elvonuláson. A legfurcsább nem a csend lesz, hanem hogy mennyire hangos belül minden.",
      tags: ["csendes", "egésznapos", "vezetett"],
    },
    en: {
      title: "One-day silent meditation",
      description:
        "Morning to evening without a single word, on a guided retreat. The strangest part won't be the silence — it's how loud everything is inside.",
      tags: ["quiet", "full day", "guided"],
    },
  },
  {
    slug: "jelnyelv-alapok",
    category: "mind",
    hu: {
      title: "Jelnyelv alapok",
      description:
        "Egy workshopnyi idő alatt megtanulsz bemutatkozni és köszönni jelnyelven. Onnantól másképp látod a hangtalan beszélgetéseket a villamoson.",
      tags: ["nyelv", "oktatós", "szemléletváltó"],
    },
    en: {
      title: "Sign language basics",
      description:
        "In a single workshop you learn to introduce yourself and say hello in sign language. From then on, you see the silent conversations on the tram differently.",
      tags: ["language", "with instructor", "eye-opening"],
    },
  },
  {
    slug: "nap-telefon-nelkul",
    category: "mind",
    hu: {
      title: "Egy nap telefon nélkül",
      description:
        "Ébredéstől lefekvésig kikapcsolva. A zsebed felé nyúlsz majd vagy negyvenszer — és estére eszedbe jut, milyen hosszú tud lenni egy nap.",
      tags: ["otthon", "olcsó", "komfortzóna"],
    },
    en: {
      title: "A day without your phone",
      description:
        "Switched off from waking up to going to bed. You'll reach for your pocket about forty times — and by evening you'll remember how long a day can be.",
      tags: ["at home", "cheap", "comfort zone"],
    },
  },
];
