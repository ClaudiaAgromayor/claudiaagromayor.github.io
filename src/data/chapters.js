// ─────────────────────────────────────────────────────────────
//  SITE CONTENT — edit here.
//  One object per chapter, in chronological order.
//  Written from Claudia's CVs, cover letters, scholarship letters and
//  interview notes. Every number comes from those documents.
//  · area: 'sport' | 'adventure' | 'edu' | 'community' | 'research' | 'industry'  (see AREAS)
//  · facts: what you did (short lines, with numbers)
//  · took: what you took from it, in your own voice
//  · img: main photo, path inside /public (optional)
//  · photos: extra photos that float around it, e.g. ['/img/aws-1.jpg', '/img/aws-2.jpg'] (optional)
//  · hidden: true keeps a chapter off the site (e.g. until it is confirmed)
// ─────────────────────────────────────────────────────────────

// The categories, in the order they are listed on the site.
// shade: the three tones of the animated background while you read that chapter
// (deep, mid, highlight) — all whites and beiges, each with a faint tint of its own.
// A chapter can override it with its own `shade: [...]`.
export const AREAS = {
  sport: { name: 'Sport', shade: ['#D2D1C0', '#E7E5D6', '#FAF9F1'] },
  adventure: { name: 'Adventure', shade: ['#CDD3CF', '#E4E8E3', '#F8FAF6'] },
  edu: { name: 'Study', shade: ['#D5D0CA', '#E9E4DE', '#FAF8F5'] },
  community: { name: 'Community', shade: ['#D3CDD2', '#E8E2E7', '#FAF7F9'] },
  research: { name: 'Research', shade: ['#DACCC3', '#EDE1D9', '#FBF6F2'] },
  industry: { name: 'Work', shade: ['#DCCEBA', '#EEE3D1', '#FCF7EE'] },
}
// intro and outro
export const HOME_SHADE = ['#D9D1C2', '#ECE6DA', '#FBF9F4']

const ALL = [
  {
    area: 'adventure', year: 2003, date: '2003', place: 'Madrid',
    title: 'Born between two cultures',
    line: 'Half French, half Spanish, raised in Madrid in a family that stretches across Europe, Asia and the Americas.',
    facts: [
      'Growing up between languages taught me that the best ideas appear where different perspectives meet.',
      'Spanish, French and English (Cambridge C1 Advanced) — and a habit of asking how things work.',
    ],
    took: 'Being born between cultures made me curious about how everything works — and how it could work differently.',
  },
  {
    area: 'sport', year: 2013, date: 'May 2013', place: 'Barcelona',
    title: 'Fifth in the world',
    line: 'With Boadilla’s junior aesthetic group gymnastics team: fifth place worldwide at the international tournament in Barcelona, with the routine “Las Pentagramas”.',
    facts: [
      'More than ten years of gymnastics: by the age of twelve I was competing nationally in rhythmic gymnastics.',
      'Twelve gymnasts aged 8 to 10 and one routine, up against teams from countries such as Finland and Italy.',
      'Fifth place at the international tournament in Barcelona.',
    ],
    took: 'Gymnastics taught me to handle pressure, to train discipline and to keep going. Precision is trained, not given.',
    img: '/img/gimnasia-2013.jpg',
    link: 'https://www.ayuntamientoboadilladelmonte.org/boadilla-actualidad/noticias/el-equipo-infantil-de-gimnasia-estetica-de-boadilla-obtiene-el-quinto',
  },
  {
    area: 'edu', year: 2015, date: 'April 2015', place: 'Boadilla del Monte',
    title: 'Maths as a game',
    line: 'First prize at Boadilla’s 2nd Maths Gymkhana, among four hundred students — one of several maths and science competitions I entered from primary school on.',
    facts: [
      'From sixth grade I entered maths and science competitions, and won a few of them (once, an iPad).',
      'The Gymkhana: a team competition between schools from Boadilla and nearby towns. First prize with my team.',
    ],
    took: 'Maths was never homework to me. It was the best puzzle around.',
    img: '/img/gymkana-2015.jpg',
    link: 'https://www.ayuntamientoboadilladelmonte.org/boadilla-actualidad/noticias/cuatrocientos-escolares-participan-en-la-ii-gymkana-matematica-de',
  },
  {
    area: 'industry', year: 2020, date: '2020 – 2023', place: 'Madrid',
    title: 'From 0 to 1,000 on TikTok',
    line: 'Social media & content manager at ICES, a company that helps Spanish students spend a high-school year in the US and Canada.',
    facts: [
      'I was the most junior person in marketing. I studied TikTok, built a strategy and asked for a meeting with the directors to pitch it.',
      'They said yes. I launched the account, ran it, and reached 1,000 followers in its first month.',
      'Managed Instagram, Facebook and TikTok, wrote 20+ articles and student testimonials for the blog and helped at ICES events.',
    ],
    took: 'Being the most junior person in the room is no reason to leave a good idea in a drawer.',
  },
  {
    area: 'edu', year: 2021, date: '2018 – 2021', place: 'Boadilla del Monte',
    title: 'Top of the class',
    line: 'High school in technological sciences at Eurocolegio Casvi, finished with a Diploma of Excellence from the Community of Madrid.',
    facts: [
      'Honourable Mention and Diploma of Excellence from the Community of Madrid.',
      'Named best student of my year at Casvi.',
      'STEM programme at Universidad Carlos III — and winner of the school’s Christmas drawing contest.',
    ],
    took: 'Science and drawing both start the same way: looking closely until you see the structure.',
  },
  {
    area: 'edu', year: 2021, date: 'Sep 2021', place: 'Madrid',
    title: 'Engineering at ICAI',
    line: 'Industrial Engineering at Universidad Pontificia Comillas ICAI, specialising in electrical engineering.',
    facts: [
      'I chose ICAI because it combined everything I liked: maths, physics, difficulty and rigour.',
      'Soft Skills Diploma in personal, communication and professional skills.',
      'Volunteering with Cáritas (school food drives) and Volant (time with residents of a care home).',
    ],
    took: 'I look for places that are hard on purpose. That is where you learn fastest.',
  },
  {
    area: 'adventure', year: 2022, date: 'Jun – Aug 2022', place: 'Wisconsin, USA',
    title: 'A summer at Lake Wapogasset',
    line: 'Camp counsellor and lifeguard at a summer camp in Wisconsin — my first summer working on my own, far from home.',
    facts: [
      'A new group of twelve girls aged 8 to 13 every week: games, arts and crafts, workshops — and more than one friendship to mend.',
      'American Red Cross lifeguard (CPR/AED, first aid, waterfront). More than ten water rescues in the lake.',
      'Received the camp’s “You Rock” award.',
    ],
    took: 'Leaving your comfort zone means making mistakes all the time. I take every one of them as something to learn from.',
  },
  {
    area: 'edu', year: 2023, date: 'Sep 2023 – Jun 2025', place: 'Paris',
    title: 'Paris, without a prépa',
    line: 'One of two ICAI students selected for the double degree with CentraleSupélec, Université Paris-Saclay.',
    facts: [
      'Joined one of France’s most demanding engineering schools without the usual two years of prépa, and studied in a new language.',
      'Found what really drives me: using data to understand real systems — forecasting electricity demand in a course built with EDF, optimising a wind farm with MPPT.',
      'Company projects with Safran (a tool modelling air flow through a helicopter engine) and BCG (market analysis), plus a coding week analysing Twitter data on the war in Ukraine.',
      'Top 10% of the cohort, 9.2/10 GPA over my last two years.',
    ],
    took: 'France gave me the freedom to find what I love: using data to understand how real systems behave.',
  },
  {
    area: 'sport', year: 2023, date: '2023 – 2025', place: 'Paris',
    title: 'Basketball, rowing and surf',
    line: 'Campus life at CentraleSupélec: university basketball, rowing, surf trips and the Spanish club.',
    facts: [
      'Basketball in the French university championship, the Intercentrales and inter-school tournaments in Paris.',
      'Rowing — including HumaAviron, 24 hours on the water where every kilometre raised €1 for HumaCS.',
      'Surf Expedition CentraleSupélec: surf weekends in Normandy and Brittany.',
      'Spanish Club: sharing my culture on a campus with 77 nationalities.',
    ],
    took: 'Basketball, rowing and surfing have one thing in common: you read the environment constantly and decide fast.',
  },
  {
    area: 'community', year: 2023, date: 'Nov 2023 – Jan 2025', place: 'Paris',
    title: 'Treasurer of France’s largest student forum',
    line: 'Forum CentraleSupélec: 3,500 students, 200 companies and €1.4M in revenue, two thirds of which funds 60+ student projects.',
    facts: [
      'Managed a €600K budget: planning, pricing strategy, ERP redesign and financial audit.',
      'Inherited invoicing that broke French legal rules; moved it to Zoho Billing connected to our CRM and fixed numbering and legal mentions.',
      'Found a way around the venue’s 20% fee on catering: pre-orders and payments through Lydia.',
    ],
    took: 'Associations are not a line on a CV. They are a collective adventure that gives back far more than you put in.',
  },
  {
    area: 'industry', year: 2024, date: 'Jun – Aug 2024', place: 'Madrid',
    title: 'Altex Asset Management',
    line: 'Quantitative developer intern: systematic investment strategies built with machine learning on financial time series.',
    facts: [
      'Developed and backtested asset-rotation strategies across commodities, stock indices and bonds, using momentum, growth and value factors.',
      '15% annualised returns with a 10% maximum drawdown in backtests.',
      'Built ML pipelines with feature engineering and hyperparameter optimisation — in a field that was completely new to me.',
    ],
    took: 'A good backtest is not a promise: honest validation matters more than the number.',
  },
  {
    area: 'edu', year: 2024, date: 'Sep 2024 – Jun 2025', place: 'Paris',
    title: 'A third degree, in economics',
    line: 'Applied Economics at Université Paris Dauphine–PSL, alongside engineering — a field I had never studied before.',
    facts: [
      'Macroeconomics, international economics and data analysis.',
      'Grande École track: decision-making under uncertainty and quantitative economics.',
    ],
    took: 'Engineering teaches you how to build a model. Economics asks whether it is worth building.',
  },
  {
    area: 'research', year: 2025, date: 'Jan – Jun 2025', place: 'IBM France Lab',
    title: 'LLMs that follow rules',
    line: 'Can an LLM be trusted to apply complex business rules? Five architectures to find out.',
    facts: [
      'Benchmarked batch, iterative, few-shot, chain-of-thought and RAG pipelines on policy-compliance decisions for 200+ client cases.',
      'Hybrid retrieval: dense sentence-transformer embeddings with a TF-IDF fallback and leakage-safe neighbour exclusion.',
      'Exact Match from 46% to 91%; 0.89 F1 on domain QA.',
    ],
    took: 'More context is not more reasoning. The design of the pipeline matters more than the model.',
  },
  {
    area: 'research', year: 2025, date: 'Jan – Aug 2025', place: 'Bachelor thesis',
    title: 'Learning without sharing data',
    line: 'A federated learning platform, built from scratch, where industrial companies train AI together without sharing their data.',
    facts: [
      'Five-layer platform in Python and FastAPI with 15 heterogeneous clients from aerospace, automotive and chemical industries.',
      'Benchmarked FedAvg, FedProx and SCAFFOLD under non-IID data; with SCAFFOLD, +9% accuracy and 40% faster convergence.',
      'Differential privacy (Gaussian and Laplace mechanisms) to keep every participant’s data confidential.',
    ],
    took: 'In complex systems the problem is rarely where you think it is. Look for the cause, not the symptom.',
  },
  {
    area: 'industry', year: 2025, date: 'Jun – Aug 2025', place: 'Madrid',
    title: 'Amazon Web Services',
    line: 'GenAI engineering intern: an end-to-end generative-AI system for support tickets in the AWS Partner Network.',
    facts: [
      '5,000+ tickets a month; first-attempt accuracy from 75% to 85%.',
      'Bedrock, Lambda and LangChain, retrieving from 30+ documents and 10K+ past tickets — with a person always in the loop.',
      'Handling time per ticket from about four minutes to thirty seconds; 15% lower inference latency.',
      'AWS Certified Cloud Practitioner and AI Practitioner.',
    ],
    took: 'Useful AI is the AI people choose to use every day.',
  },
  {
    area: 'edu', year: 2025, date: 'Sep 2025 – Jun 2027', place: 'Madrid',
    title: 'A double master’s in engineering and AI',
    line: 'Master’s in Industrial Engineering and Master’s in Intelligent Industry at ICAI — machine learning, deep learning and AI for industrial data.',
    facts: [
      'Machine learning, deep learning, statistics, optimisation, robotics and cloud computing.',
      'Learning to handle huge amounts of industrial data with AI to solve real problems.',
    ],
    took: 'Every day the world produces more data. Learning to use it well felt essential.',
  },
  {
    area: 'research', year: 2025, date: 'October 2025', place: 'Kearney & CAF',
    title: 'First place in 48 hours',
    line: 'Smart Industry Hackathon: CAFFY, an AI assistant for real-time train maintenance diagnostics.',
    facts: [
      'Led the team: BERT embeddings and logistic regression to predict the faulty component from maintenance notes.',
      'Voice and text input through Google Speech, so technicians can ask hands-free.',
      '80% top-3 accuracy; FastAPI backend and web interface shipped in under 48 hours.',
    ],
    took: 'The most useful model won, not the most complex one.',
  },
  {
    area: 'research', year: 2025, date: 'Dec 2025', place: 'DataHack 3.0',
    title: 'Predicting drug effects',
    line: 'Multimodal machine learning to predict how drugs act on biological targets — the moment biology caught me.',
    facts: [
      'Ensembles of random forests, gradient boosting and SVMs on chemical and biological data.',
      'Feature engineering bridging both modalities; outperformed the competition baselines.',
    ],
    took: 'Optimising a portfolio is interesting. Optimising for human health is something else entirely.',
  },
  {
    area: 'research', year: 2026, date: 'Jan 2026 – now', place: 'Madrid',
    title: 'Seeing inside a tooth',
    line: '3D segmentation of root canals in dental scans, with endodontics experts from Universidad Complutense de Madrid.',
    facts: [
      'Data-validation pipeline for 800 patients’ 3D DICOM scans, focused on first molars.',
      'Dice-based comparison of automatic (Pulpy3D) and expert annotations: mean Dice 0.70, with corrupted and misaligned volumes flagged.',
      'Developing 3D U-Net and Attention U-Net models with Dice loss, where fewer than 1% of voxels are positive.',
    ],
    took: 'With data this imbalanced, a comfortable metric can lie.',
  },
  {
    area: 'research', year: 2026, date: 'Jun – Aug 2026', place: 'Montréal, Canada',
    title: 'IRIC, Université de Montréal',
    line: 'Machine learning research intern at the Institute for Research in Immunology and Cancer: virtual drug screening at the scale of billions.',
    facts: [
      'HPC pipeline on SLURM: a model trained on 47K experimental compounds, used to screen billions of make-on-demand molecules in ZINC22 — about 1.04M candidates.',
      'Multi-task D-MPNNs trained on 370K molecules for 26 ADMET endpoints: median ROC-AUC 0.86 (hERG) and 0.78 (blood–brain barrier) on cluster splits.',
      'Out-of-distribution evaluation and uncertainty with leave-one-cluster-out validation and 1,000-model ensembles.',
      'First-author manuscript in preparation.',
    ],
    took: 'Scaling up is a scientific problem, not just a compute problem.',
  },
  {
    // CHECK before showing: the acceptance letter is signed (16 June 2026) — confirm the award.
    hidden: true,
    area: 'edu', year: 2026, date: '2026 – 2027', place: 'Madrid',
    title: 'Iberdrola Master’s Scholarship',
    line: 'Selected for the Iberdrola España Master’s Scholarship for 2026–2027.',
    facts: [
      'Recommended by professors from CentraleSupélec and ICAI.',
      'Energy, data and AI: the sector where engineering has the most real-world weight.',
    ],
    took: 'The energy transition is a data problem as much as an engineering one.',
  },
]

export const CHAPTERS = ALL.filter((c) => !c.hidden)

export const PROFILE = {
  name: 'Claudia Agromayor',
  born: 2003,
  role: '2nd-year double master’s student — Industrial Engineering & Computer Science',
  places: 'Madrid · Paris · Montréal',
  intro: 'Curious by nature.',
  introEm: 'Persistent by choice.',
  sub: 'A life in chapters — from the gymnastics mat and a TikTok account to machine-learning research.',
  next: 'Seeking an AI research internship from March 2027.',
  email: 'clauuagromayor@gmail.com',
  linkedin: 'https://linkedin.com/in/claudia-agromayor',
  github: 'https://github.com/ClaudiaAgromayor',
}

// Once you have a 3D model, drop it in /public and set e.g. '/avatar.glb'.
// While null, the site uses the abstract statue.
export const AVATAR_URL = null
