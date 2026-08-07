export type Activity = {
  id: number;
  slug: string;
  title: string;
  description: string;
  category: string;
  tags: string[];
  featured: boolean;
};

export type DiscoveryStatus =
  | "new"
  | "selected"
  | "contacted"
  | "featured"
  | "skipped";

export type Discovery = {
  id: number;
  platform: "Instagram" | "TikTok";
  url: string;
  creator: string;
  text: string;
  likes: number;
  comments: number;
  posted_at: string;
  image_url: string;
  activity_label: string;
  activity_label_en: string; // üres, ha a crawler (még) nem adott angol címkét
  status: DiscoveryStatus;
  outreach_message: string;
};

export type NewsletterIssue = {
  id: number;
  month: string; // YYYY-MM
  locale: "hu" | "en";
  subject: string;
  intro: string;
  activity_ids: number[];
  discovery_ids: number[];
  status: "draft" | "exported";
};

export const STATUS_LABELS: Record<DiscoveryStatus, string> = {
  new: "új",
  selected: "kiválasztva",
  contacted: "megkeresve",
  featured: "kirakva",
  skipped: "kihagyva",
};
