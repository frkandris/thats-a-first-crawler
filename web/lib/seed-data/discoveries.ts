// Minta felfedezések fejlesztéshez — ugyanaz az adatforma, amit az n8n crawler
// termel (platform, url, text, likes, comments, date, image), plusz a Claude által
// adott tevékenység-címke (activity_label). Élesben ezeket a pipeline tölti majd be.

export type SeedDiscovery = {
  platform: "Instagram" | "TikTok";
  url: string;
  creator: string;
  text: string;
  likes: number;
  comments: number;
  posted_at: string; // YYYY-MM-DD
  image_url: string;
  activity_label: string;
  activity_label_en: string;
};

export const seedDiscoveries: SeedDiscovery[] = [
  {
    platform: "Instagram",
    url: "https://www.instagram.com/p/SAMPLE001",
    creator: "keramia.kata",
    text: "Első alkalom a korongnál!! 🏺 Sosem gondoltam, hogy ilyen nehéz középre tenni az agyagot 😅 #thatsafirst #pottery #tryingnewthings",
    likes: 342,
    comments: 28,
    posted_at: "2026-07-18",
    image_url: "https://example.com/sample/pottery.jpg",
    activity_label: "Fazekaskorongozás életében először",
    activity_label_en: "Pottery wheel throwing for the first time",
  },
  {
    platform: "TikTok",
    url: "https://www.tiktok.com/@sample/video/SAMPLE002",
    creator: "adrenalin.adam",
    text: "POV: 4000 méteren ülsz egy nyitott ajtónál és azt mondtad erre igent 🪂 #tandemjump #newexperience #thatsafirst",
    likes: 12400,
    comments: 213,
    posted_at: "2026-07-20",
    image_url: "https://example.com/sample/skydive.jpg",
    activity_label: "Tandem ejtőernyős ugrás életében először",
    activity_label_en: "Tandem skydive for the first time",
  },
  {
    platform: "Instagram",
    url: "https://www.instagram.com/p/SAMPLE003",
    creator: "futoklub.fanni",
    text: "Ma hajnalban életemben először úsztam nyílt vízben 🌊 A Balaton 6:30-kor mindenkié. #nyiltvizi #tryingsomethingnew",
    likes: 891,
    comments: 45,
    posted_at: "2026-07-21",
    image_url: "https://example.com/sample/openwater.jpg",
    activity_label: "Nyíltvízi úszás hajnalban, életében először",
    activity_label_en: "Open water swimming at dawn, for the first time",
  },
  {
    platform: "TikTok",
    url: "https://www.tiktok.com/@sample/video/SAMPLE004",
    creator: "gasztro.gergo",
    text: "Rovarkóstoló volt ma 🦗 az első falat volt a legnehezebb, utána ropi. Sose mondd, hogy soha! #rovar #newexperiences #foodchallenge",
    likes: 5600,
    comments: 178,
    posted_at: "2026-07-19",
    image_url: "https://example.com/sample/insects.jpg",
    activity_label: "Rovarkóstoló életében először",
    activity_label_en: "Insect tasting for the first time",
  },
  {
    platform: "Instagram",
    url: "https://www.instagram.com/p/SAMPLE005",
    creator: "csendes.csilla",
    text: "10 nap után először: egynapos csendmeditáció ✨ A leghangosabb dolog a saját fejem volt. #silentretreat #thatsafirst #mindfulness",
    likes: 156,
    comments: 12,
    posted_at: "2026-07-22",
    image_url: "https://example.com/sample/retreat.jpg",
    activity_label: "Egynapos csendmeditáció életében először",
    activity_label_en: "One-day silent meditation for the first time",
  },
  {
    platform: "TikTok",
    url: "https://www.tiktok.com/@sample/video/SAMPLE006",
    creator: "improcsapat",
    text: "Bedobtuk a mélyvízbe: első improóra, nulla tapasztalat, rengeteg nevetés 🎭 gyertek ti is! #impro #tryingnewthings #budapest",
    likes: 2300,
    comments: 89,
    posted_at: "2026-07-23",
    image_url: "https://example.com/sample/impro.jpg",
    activity_label: "Improszínház workshop életében először",
    activity_label_en: "Improv theatre workshop for the first time",
  },
];
