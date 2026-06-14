export type ProjectCategory = 'ecommerce' | 'realestate' | 'ai';

export interface Project {
  id: number;
  title: string;
  titleJa: string;
  category: ProjectCategory;
  description: string;
  descriptionJa: string;
  url: string;
  github: string;
  tech: string[];
  color: string;
  accent: string;
  /** Path under /public used for the project screenshot (added in Sprint 10). */
  image?: string;
}

export const PROJECTS: Project[] = [
  {
    id: 1,
    title: 'Gau Bhoomi Naturals',
    titleJa: 'ガウ・ブーミ・ナチュラルズ',
    category: 'ecommerce',
    description:
      'Premium organic e-commerce store for A2 Gir Cow Ghee, cold-pressed oils, rice, masalas, and superfoods. Custom React frontend connected to WooCommerce backend.',
    descriptionJa:
      'A2ギール牛ギー、コールドプレスオイル、米、マサラ、スーパーフードのプレミアムオーガニックEコマースストア。ReactフロントエンドとWooCommerceバックエンドを統合。',
    url: 'https://mediumseagreen-salamander-686387.hostingersite.com/',
    github: '',
    tech: ['React', 'WooCommerce', 'Tailwind CSS', 'GSAP', 'Framer Motion'],
    color: '#142A1D',
    accent: '#C9A84C',
    image: '/projects/gau-bhoomi.png',
  },
  {
    id: 2,
    title: 'Ayurvedic Wellness Store',
    titleJa: 'アーユルヴェーダ・ウェルネスストア',
    category: 'ecommerce',
    description:
      'Full-stack Ayurvedic medicine e-commerce platform with local cart system, product filtering, and WooCommerce checkout integration.',
    descriptionJa:
      'ローカルカートシステム、商品フィルタリング、WooCommerceチェックアウト統合を備えたアーユルヴェーダ医薬品Eコマースプラットフォーム。',
    url: 'https://olivedrab-wildcat-394337.hostingersite.com/',
    github: '',
    tech: ['React', 'WooCommerce', 'React Router', 'Context API'],
    color: '#2D5A4F',
    accent: '#6B9E7F',
    image: '/projects/ayurvedic-wellness.png',
  },
  {
    id: 3,
    title: 'HomeNexus',
    titleJa: 'ホームネクサス',
    category: 'realestate',
    description:
      'Real estate services website with property listings, project showcases, and lead generation for farm plots and residential properties.',
    descriptionJa:
      '農地・住宅物件のリスティング、プロジェクト紹介、リード獲得機能を備えた不動産サービスウェブサイト。',
    url: 'https://homenexus.in/',
    github: '',
    tech: ['WordPress', 'Elementor', 'PHP', 'MySQL'],
    color: '#1a3a5c',
    accent: '#4a90d9',
    image: '/projects/homenexus.png',
  },
  {
    id: 4,
    title: 'SaalAnKruta Jewellery',
    titleJa: 'サーランクルタ・ジュエリー',
    category: 'ecommerce',
    description:
      'Premium jewellery e-commerce store featuring traditional Indian necklaces, earrings, and accessories with a dark luxury aesthetic.',
    descriptionJa:
      '伝統的なインドのネックレス、イヤリング、アクセサリーを取り揃えたプレミアムジュエリーEコマースストア。ダークラグジュアリーな美学。',
    url: 'https://saalankruta.com/',
    github: '',
    tech: ['WooCommerce', 'WordPress', 'Custom CSS'],
    color: '#1a0a2e',
    accent: '#c9a84c',
    image: '/projects/saalankruta.png',
  },
  {
    id: 5,
    title: 'RERA Mysore',
    titleJa: 'RERAマイソール',
    category: 'realestate',
    description:
      'Real estate regulatory compliance and consulting website for RERA registrations in Mysore, Karnataka — serving builders and property buyers.',
    descriptionJa:
      'カルナータカ州マイソールのRERA登録・規制コンプライアンス・コンサルティングウェブサイト。建設業者や不動産購入者向け。',
    url: 'https://www.reramysore.com/',
    github: '',
    tech: ['WordPress', 'Elementor Pro', 'PHP'],
    color: '#0f2d1f',
    accent: '#2ecc71',
    image: '/projects/rera-mysore.png',
  },
  {
    id: 6,
    title: 'ChocoRush',
    titleJa: 'チョコラッシュ',
    category: 'ecommerce',
    description:
      'Custom artisan chocolate e-commerce store with gift collections, custom order management, and a rich dark-luxury brand aesthetic.',
    descriptionJa:
      'ギフトコレクション、カスタムオーダー管理、リッチなダークラグジュアリーブランド美学を持つ手作りチョコレートEコマースストア。',
    url: 'https://cocoaluxe-builder-09ixoa4lw2rzl4pn.hostingersite.com/',
    github: '',
    tech: ['WooCommerce', 'WordPress', 'Custom Theme'],
    color: '#1a0a00',
    accent: '#8b4513',
    image: '/projects/chocorush.png',
  },
  {
    id: 7,
    title: 'MAPA Properties',
    titleJa: 'MAPAプロパティーズ',
    category: 'realestate',
    description:
      'Luxury real estate and properties marketing website with project showcases, media coverage section, and professional brand identity.',
    descriptionJa:
      'プロジェクト紹介、メディア掲載セクション、プロフェッショナルなブランドアイデンティティを備えたラグジュアリー不動産マーケティングサイト。',
    url: 'https://hotpink-opossum-864380.hostingersite.com/',
    github: '',
    tech: ['WordPress', 'Elementor', 'Custom CSS'],
    color: '#0a0a0a',
    accent: '#ffffff',
    image: '/projects/mapa-properties.png',
  },
  {
    id: 8,
    title: 'AI Budget Tracker',
    titleJa: 'AIバジェットトラッカー',
    category: 'ai',
    description:
      'Mobile-first AI-powered expense tracking app with Gemini API receipt scanning. Snap a receipt and expenses are automatically entered — Daily, Weekly, and Monthly views with analytics.',
    descriptionJa:
      'Gemini APIのレシートスキャン機能を持つモバイルファーストのAI支出追跡アプリ。レシートを撮影するだけで自動入力——日次・週次・月次ビューと分析機能付き。',
    url: 'https://startling-starship-4b900b.netlify.app/',
    github: '',
    tech: ['React', 'Gemini API', 'Netlify', 'Chart.js', 'PWA'],
    color: '#1a0d00',
    accent: '#00bcd4',
    image: '/projects/budget-tracker.png',
  },
  {
    id: 9,
    title: 'Rent Agreement Generator',
    titleJa: '賃貸契約書ジェネレーター',
    category: 'ai',
    description:
      'Legal document automation tool — generates professionally formatted, legally valid 11-month rent agreements in India. 4-step multi-form flow with PDF output.',
    descriptionJa:
      '法的文書自動化ツール——インドで法的に有効な11ヶ月間の賃貸借契約書を専門的な形式で生成。4ステップのマルチフォームとPDF出力付き。',
    url: 'https://rent-agreement-generator-nine.vercel.app/',
    github: 'https://github.com/shashanksbharadwaj161/Rent-agreement-generator',
    tech: ['React', 'Vercel', 'PDF Generation', 'Multi-step Forms'],
    color: '#0a0a1a',
    accent: '#d4a574',
    image: '/projects/rent-agreement.png',
  },
  {
    id: 10,
    title: 'Visual Search App',
    titleJa: 'ビジュアル検索アプリ',
    category: 'ai',
    description:
      "RAKATHON'23 hackathon project — web application enabling visual product search using image recognition and AI-powered similarity matching.",
    descriptionJa:
      "RAKATHON'23ハッカソンプロジェクト——画像認識とAI類似マッチングを使ったビジュアル商品検索ウェブアプリケーション。",
    url: '',
    github: 'https://github.com/shashanksbharadwaj161',
    tech: ['Python', 'Computer Vision', 'Flask', 'TensorFlow'],
    color: '#0d1a00',
    accent: '#ff6b35',
    image: '/projects/visual-search.png',
  },
];

export interface Hackathon {
  name: string;
  org: string;
  project: string;
  year: string;
}

export const HACKATHONS: Hackathon[] = [
  { name: "RAKATHON'23", org: 'Rakuten India', project: 'Visual Search Web Application', year: '2023' },
  { name: 'NEO APAC Hackathon', org: 'NEO', project: 'Blockchain Innovation', year: '2023' },
  { name: "SymbIOT'23", org: 'VVCE', project: 'IoT Smart Systems', year: '2023' },
  { name: 'Amazon ML Challenge', org: 'HackerEarth', project: 'Machine Learning Track', year: '2023' },
  { name: "ETHIndia'22", org: 'Devfolio', project: 'Web3 DApp', year: '2022' },
];

export interface Certification {
  name: string;
  issuer: string;
  year: string;
}

export const CERTIFICATIONS: Certification[] = [
  { name: 'Complete Data Science Bootcamp 2024', issuer: 'Udemy', year: '2024' },
  { name: 'Deep Learning with PyTorch: Image Segmentation', issuer: 'Coursera', year: '2024' },
  { name: '100 Days of Code: Python Pro Bootcamp', issuer: 'Udemy', year: '2023' },
  { name: 'AI and Machine Learning Bootcamp', issuer: 'IBM SkillsBuild', year: '2023' },
  { name: 'Supervised Machine Learning: Regression & Classification', issuer: 'Coursera (Stanford)', year: '2022' },
  { name: 'Create a Superhero Name Generator with TensorFlow', issuer: 'Coursera', year: '2022' },
];

export interface Experience {
  role: string;
  roleJa: string;
  company: string;
  period: string;
  periodJa: string;
  location: string;
  description: string;
}

export const EXPERIENCE: Experience[] = [
  {
    role: 'Software Developer (Part Time)',
    roleJa: 'ソフトウェアエンジニア（アルバイト）',
    company: 'Eyes, JAPAN',
    period: 'May 2025 – Present',
    periodJa: '2025年5月 – 現在',
    location: 'Aizuwakamatsu, Japan',
    description:
      'Developing VR and AI-powered applications using JavaScript. Working with industry professionals on cutting-edge visual technology projects.',
  },
  {
    role: 'WordPress Developer (Freelance)',
    roleJa: 'WordPressデベロッパー（フリーランス）',
    company: 'Advaita Technology Solutions',
    period: 'Feb 2024 – Feb 2025',
    periodJa: '2024年2月 – 2025年2月',
    location: 'Bengaluru, India',
    description:
      'Designed and developed custom WordPress themes and WooCommerce stores for 7+ clients across various industries.',
  },
  {
    role: 'Full Stack Engineer Intern',
    roleJa: 'フルスタックエンジニアインターン',
    company: 'L&T Technology Services',
    period: 'Oct 2023 – Dec 2023',
    periodJa: '2023年10月 – 2023年12月',
    location: 'Mysuru, India',
    description: 'Worked on enterprise-grade web applications using modern full-stack technologies.',
  },
];
