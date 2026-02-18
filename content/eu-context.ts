export type EUContextItem = {
  id: string;
  title: string;
  source: string;
  year: number;
  summary: string;
  link: string;
  tag: "Employment" | "Equality" | "Discrimination" | "Labour Market";
};

export const euContextItems: EUContextItem[] = [
  {
    id: "age-discrimination",
    title: "Age Discrimination in Employment",
    source: "European Commission",
    year: 2023,
    tag: "Discrimination",
    link: "https://commission.europa.eu/strategy-and-policy/policies/justice-and-fundamental-rights/combatting-discrimination/age-discrimination_en",
    summary:
      "The EU identifies age discrimination as a persistent structural barrier in access to employment, career progression, and labour-market re-entry. Despite formal equal-opportunity commitments, older workers continue to face exclusion, highlighting the need for transparency and evidence-based enforcement.",
  },
  {
    id: "gender-equality-strategy",
    title: "Gender Equality Strategy 2020–2025",
    source: "European Commission",
    year: 2020,
    tag: "Equality",
    link: "https://commission.europa.eu/strategy-and-policy/policies/justice-and-fundamental-rights/gender-equality/gender-equality-strategy_en",
    summary:
      "The EU Gender Equality Strategy frames discrimination in employment as a systemic issue requiring accountability and measurable outcomes. It emphasizes intersectional risks where gender bias overlaps with age, caregiving responsibilities, or other factors during recruitment and advancement.",
  },
  {
    id: "better-regulation",
    title: "Better Regulation: Evidence-Based Policymaking",
    source: "European Commission",
    year: 2021,
    tag: "Labour Market",
    link: "https://commission.europa.eu/law/law-making-process/better-regulation_en",
    summary:
      "The Better Regulation framework requires EU policies to be informed by reliable data, stakeholder feedback, and real-world evidence. It promotes continuous evaluation to assess whether policies achieve their intended impact beyond formal compliance.",
  },
  {
    id: "anti-discrimination-policy",
    title: "EU Anti-Discrimination Policy Framework",
    source: "European Commission",
    year: 2022,
    tag: "Discrimination",
    link: "https://commission.europa.eu/strategy-and-policy/policies/justice-and-fundamental-rights/combatting-discrimination_en",
    summary:
      "EU anti-discrimination policy establishes obligations to prevent unequal treatment in employment while recognizing enforcement gaps between declared commitments and real practices. It encourages innovative mechanisms to improve detection and accountability.",
  },
  {
    id: "social-rights-pillar",
    title: "European Pillar of Social Rights – Equal Opportunities",
    source: "European Parliament",
    year: 2017,
    tag: "Employment",
    link: "https://www.europarl.europa.eu/thinktank/en/document/EPRS_BRI(2017)599346",
    summary:
      "Principle 3 of the European Pillar of Social Rights guarantees equal opportunities in access to employment and protection against discrimination. It serves as a strategic compass for EU labour and social policy initiatives.",
  },
];
