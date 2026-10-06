// ─────────────────────────────────────────────────────────────
//  SITE CONTENT: edit here. Claudia's own words.
//  One object per entry, grouped into sections in ./sections.js
//  · title / org: what it was, and where
//  · line: the sentence shown before you open it
//  · stats: the figures that carry the page. The first can be marked big
//  · facts: strings are bullets; { list } nests under the line before it
//  · tags: a row of short labels (used by Education)
//  · img, photos, video, links
// ─────────────────────────────────────────────────────────────

export const ENTRIES = [
  /* ── Experience ─────────────────────────────────────────── */
  {
    key: 'iric',
    year: 2026,
    title: 'Research Intern',
    org: 'IRIC, Université de Montréal',
    date: 'Jun – Aug 2026',
    place: 'Montréal',
    line: 'Developed a machine learning pipeline to identify promising candidates for safer general anaesthetics from large-scale chemical libraries.',
    stats: [
      { v: '43.6B', k: 'molecules screened', big: true },
      { v: '1,000', k: 'candidates selected' },
      { v: '~100', k: 'advancing to synthesis' },
    ],
    facts: [
      'Trained a message-passing neural network on 47,348 compounds scored using zebrafish behavioural data, then screened 43.6 billion ZINC22 molecules on SLURM.',
      'Applied developability filters and Pareto optimisation to identify 1,000 candidates, with ~100 advancing to synthesis.',
      'First author of the resulting paper; invited to present the work at PandemicStop-AI at Mila. The project also led to a PhD offer.',
    ],
    links: [{ href: 'https://github.com/ClaudiaAgromayor/zebrafish-anesthetic-chemprop', label: 'GitHub' }],
    img: '/img/olivier_lab.jpg',
    photos: ['/img/montreal_office.jpg'],
  },
  {
    key: 'aws',
    year: 2025,
    title: 'Generative AI Engineer',
    org: 'Amazon Web Services',
    date: 'Jun – Aug 2025',
    place: 'Madrid',
    line: 'Built and deployed an end-to-end generative AI system for AWS Partner Network support tickets, processing 5,000+ tickets per month.',
    stats: [
      { v: '5,000+', k: 'tickets a month' },
      { v: '75 → 85%', k: 'accuracy' },
      { v: '4 min → 30 s', k: 'handling time' },
    ],
    facts: [
      'Improved accuracy from 75% to 85% and reduced average handling time from ~4 minutes to 30 seconds using Amazon Bedrock, Lambda and LangChain.',
      'Combined 30+ internal documents with 10,000+ historical tickets and implemented a human-in-the-loop validation step before responses reached partners.',
      'The system remained in active use after the internship.',
    ],
    img: '/img/aws.jpg',
    photos: ['/img/aws2.jpg'],
  },
  {
    key: 'altex',
    year: 2024,
    title: 'Quantitative Developer',
    org: 'Altex Asset Management',
    date: 'Jun – Aug 2024',
    place: 'Madrid',
    line: 'Developed machine learning and systematic investment strategies for financial time series, including asset rotation across commodities, indices and bonds using momentum, growth and value signals.',
    stats: [
      { v: '15%', k: 'annualised return' },
      { v: '10%', k: 'maximum drawdown' },
    ],
    facts: [
      'Backtests reached 15% annualised return with a 10% maximum drawdown, with a strong focus on robust backtesting and avoiding methodological artefacts.',
    ],
  },
  {
    key: 'forum',
    year: 2023,
    title: 'Treasurer',
    org: 'Forum CentraleSupélec',
    date: 'Nov 2023 – Jan 2025',
    place: 'Paris',
    line: 'Managed finances for France’s largest student forum, bringing together 200 companies and 3,500 students annually, as part of a 30-person team overseeing a €600K budget.',
    stats: [
      { v: '€600K', k: 'budget managed' },
      { v: '+7% → €1.3M', k: 'revenue' },
      { v: '+40%', k: 'net result' },
    ],
    facts: [
      'Initiatives increased revenue by 7% to €1.3M and improved net result by 40%.',
      'Rebuilt the invoicing process to comply with French legal requirements and migrated billing operations to Zoho Billing and CRM.',
    ],
    img: '/img/forum.jpg',
    photos: ['/img/forum2.jpg'],
  },
  {
    key: 'ices',
    year: 2020,
    quiet: true,
    title: 'Social Media & Content Manager',
    org: 'ICES',
    date: '2020 – 2023',
    place: 'Madrid',
    line: 'Joined at 17 as the organisation’s most junior member and proposed a TikTok strategy for Spanish students studying abroad directly to the directors.',
    facts: [
      'Launched and managed the account independently, reaching 1,000+ followers in the first month and growing it to 2,300+ followers and 38,000 likes.',
      'Continued the role for three years alongside school and engineering studies.',
    ],
    img: '/img/cuenta_ices.jpg',
    photos: ['/img/ices.jpg'],
  },

  /* ── Selected research & technical work ──────────────────── */
  {
    key: 'tooth',
    year: 2026,
    title: '3D Medical Imaging',
    org: 'Master’s Thesis, ICAI',
    date: 'Jan 2026 – Present',
    place: 'Madrid',
    line: 'Developing a deep learning pipeline to identify and analyse root canals from 3D dental scans, supporting endodontic treatment planning.',
    stats: [{ v: '<1%', k: 'of voxels are root canal' }],
    facts: [
      'The pipeline combines three stages: tooth localisation and cropping from CBCT scans, 3D root-canal segmentation, and anatomical reconstruction and measurement of diameter, curvature, length and cross-section.',
      'Implementing 3D U-Net and Attention U-Net architectures with Dice loss, in a highly imbalanced setting where root canals account for fewer than 1% of voxels.',
      'Supervised at ICAI in collaboration with endodontics specialists from Universidad Complutense de Madrid.',
    ],
  },
  {
    key: 'ibm',
    year: 2025,
    title: 'LLM Evaluation Under Business Constraints',
    org: 'IBM France Lab',
    date: 'Jan – Jun 2025',
    place: 'Paris',
    line: 'Investigated LLM architectures for complex business-rule policy compliance across 200+ client cases.',
    stats: [
      { v: '46 → 91%', k: 'exact match' },
      { v: '0.89', k: 'F1 on domain QA' },
    ],
    facts: [
      'Evaluated five approaches: batch processing, iterative reasoning, few-shot prompting, chain-of-thought and retrieval-augmented generation.',
      'Improved exact-match accuracy from 46% to 91%, achieving 0.89 F1 on domain-specific question answering.',
      'Combined dense embeddings with TF-IDF fallback and leakage-safe neighbour exclusion.',
      'Found that increasing context did not necessarily improve performance; pipeline structure and retrieval strategy were more important.',
    ],
  },
  {
    key: 'federated',
    year: 2025,
    title: 'Federated Learning for Industrial Systems',
    org: 'Bachelor’s Thesis',
    date: 'Jan – Aug 2025',
    place: 'Madrid',
    line: 'Designed and implemented a federated learning platform for heterogeneous industrial environments, enabling a shared model to be trained without centralising data.',
    stats: [
      { v: '+9%', k: 'accuracy with SCAFFOLD' },
      { v: '40%', k: 'faster convergence' },
    ],
    facts: [
      'Built a five-layer Python/FastAPI platform supporting 15 heterogeneous clients.',
      'SCAFFOLD improved accuracy by 9% and reduced convergence time by 40% compared with alternative approaches.',
      'Integrated differential privacy and analysed the distinction between model limitations and issues caused by heterogeneous data distributions.',
    ],
  },

  /* ── Selected projects ───────────────────────────────────── */
  {
    key: 'angryrobot',
    year: 2026,
    title: 'AngryRobot — AI Agent Safety',
    org: 'HackSpain 2026',
    date: 'Sep 2026',
    place: 'Madrid',
    line: 'Led a team developing an AI safety system to detect when autonomous agents should stop during the HappyRobot crisis challenge.',
    facts: [
      'Designed deterministic safety checks, loop detection, an independent LLM judge and an Agent Risk Index to classify whether an agent should continue, warn, request human intervention or shut down.',
      'Tested the system in an environment with deliberate failures including objective misinterpretation, constraint violations, scope expansion and false reporting.',
      'During testing, rogue agents made real phone calls, providing a concrete test of the safety system under unexpected behaviour.',
    ],
    video: 'eaWnMs7NiIE',
    links: [
      { href: 'https://github.com/Hugongra/HackSpainTeam', label: 'GitHub' },
      { href: 'https://youtu.be/eaWnMs7NiIE', label: 'Demo' },
    ],
    img: '/img/hacskapain.jpg',
    photos: ['/img/hackspain2.jpg'],
  },
  {
    key: 'caffy',
    year: 2025,
    title: 'CAFFY — AI for Railway Maintenance',
    org: 'Kearney × CAF Smart Industry Hackathon',
    date: 'Oct 2025',
    place: 'Madrid',
    line: 'Led a team developing an AI assistant to identify faulty railway components from free-text maintenance reports.',
    stats: [
      { v: '1st', k: 'place' },
      { v: '80%', k: 'top-3 accuracy' },
    ],
    facts: [
      'Used BERT embeddings and logistic regression to achieve 80% top-3 accuracy and added voice input for technicians.',
    ],
    img: '/img/hackathon_kearney.jpg',
    photos: ['/img/presentacion_hackathon.jpg', '/img/visita_caf.jpg'],
  },

  /* ── Education ───────────────────────────────────────────── */
  {
    key: 'master',
    year: 2025,
    title: 'Double Master’s Degree',
    org: 'ICAI',
    date: 'Sep 2025 – Jun 2027',
    place: 'Madrid',
    line: 'Industrial Engineering + Intelligent Industry.',
    tagsLabel: 'Relevant areas',
    tags: ['Machine Learning', 'Deep Learning', 'Statistics', 'Optimisation', 'Robotics', 'Cloud Computing'],
    facts: [],
  },
  {
    key: 'centrale',
    year: 2023,
    title: 'Double Degree Engineering',
    org: 'CentraleSupélec × ICAI',
    date: 'Sep 2023 – Jun 2025',
    place: 'Paris',
    line: 'One of two ICAI students selected for the double degree.',
    stats: [
      { v: '1 of 2', k: 'students selected' },
      { v: 'Top 10%', k: 'of the cohort' },
      { v: '9.2/10', k: 'final two years' },
    ],
    facts: [
      'Completed the programme in French after entering from Madrid without a French prépa.',
    ],
    tagsLabel: 'Relevant projects',
    tags: ['EDF electricity demand forecasting', 'Wind farm MPPT optimisation', 'Safran helicopter airflow modelling', 'BCG projects'],
  },
  {
    key: 'dauphine',
    year: 2024,
    title: 'Applied Economics',
    org: 'Paris Dauphine-PSL',
    date: 'Sep 2024 – Jun 2025',
    place: 'Paris',
    line: 'Completed Applied Economics alongside engineering studies.',
    stats: [{ v: '7 of ~1,500', k: 'on the Grande École track' }],
    facts: [],
    tagsLabel: 'Relevant areas',
    tags: ['Macroeconomics', 'Quantitative Economics', 'Decision-making under uncertainty'],
    img: '/img/dauphine.jpg',
  },

  /* ── Recognition ─────────────────────────────────────────── */
  {
    key: 'iberdrola',
    year: 2026,
    quiet: true,
    title: 'Iberdrola Master’s Scholarship',
    org: 'Iberdrola',
    date: '2026 – 2027',
    place: 'Spain',
    line: 'One of eight recipients selected in Spain through CV and academic screening, mathematics and logic assessments, English evaluation, presentation and interviews with senior executives.',
    facts: [],
  },

  /* ── Earlier experience and early achievements ───────────── */
  {
    key: 'camp',
    year: 2022,
    quiet: true,
    title: 'Camp Counsellor & Lifeguard',
    org: 'Camp Wapo, Wisconsin',
    date: 'Jun – Aug 2022',
    place: 'Wisconsin',
    line: 'Worked as a camp counsellor and Red Cross lifeguard at 19, independently managing groups of 12 girls aged 8–13, 7,000 km from home. Completed 10+ rescues and received the “You Rock” award.',
    facts: [],
    img: '/img/camp_counselor.jpg',
    photos: ['/img/camp_counselor2.jpg'],
  },
  {
    key: 'casvi',
    year: 2021,
    quiet: true,
    title: 'Academic Excellence',
    org: 'Eurocolegio Casvi',
    date: '2018 – 2021',
    place: 'Boadilla del Monte',
    line: 'Top student in year in technological sciences. Honourable Mention and Diploma of Excellence from the Community of Madrid; STEM programme at UC3M.',
    facts: [],
    img: '/img/premio_bachillerato.jpg',
  },
  {
    key: 'gymnastics',
    year: 2013,
    quiet: true,
    title: 'International Aesthetic Gymnastics',
    org: 'Boadilla junior team',
    date: '2013',
    place: 'Barcelona',
    line: '5th in the world with the Boadilla junior team. Trained six days per week for ten years.',
    facts: [],
    img: '/img/gimnasia-2013.jpg',
    links: [{ href: 'https://www.ayuntamientoboadilladelmonte.org/boadilla-actualidad/noticias/el-equipo-infantil-de-gimnasia-estetica-de-boadilla-obtiene-el-quinto', label: 'Read the news (Spanish)' }],
  },
  {
    key: 'maths',
    year: 2015,
    quiet: true,
    title: 'Mathematics Competitions',
    org: 'Boadilla Maths Gymkhana',
    date: '2015',
    place: 'Boadilla del Monte',
    line: 'First prize in the Boadilla Maths Gymkhana among 400 students. Participated regularly in mathematics and science competitions from 6th grade.',
    facts: [],
    img: '/img/gymkana-2015.jpg',
    links: [{ href: 'https://www.ayuntamientoboadilladelmonte.org/boadilla-actualidad/noticias/cuatrocientos-escolares-participan-en-la-ii-gymkana-matematica-de', label: 'Read the news (Spanish)' }],
  },
]

export const PROFILE = {
  name: 'Claudia Agromayor',
  title: 'AI & Machine Learning Engineer | Researcher',
  field: 'Industrial Engineering & Computer Science',
  places: 'Madrid · Paris · Montréal',
  // the opening block. **like this** comes out bold
  blurb: [
    'Currently pursuing a double master’s degree in Industrial Engineering and Intelligent Industry at ICAI, I work on AI and machine learning for complex real-world problems.',
    'My experience spans **large-scale drug discovery, generative AI at AWS, industrial machine learning and quantitative finance**, from screening **43.6 billion molecules** to deploying AI systems processing **5,000+ support tickets per month**.',
    'I am particularly interested in **AI research beyond benchmarks**, especially scientific discovery, heterogeneous data and reliable systems deployed in the real world.',
  ],
  next: 'Seeking an AI research internship for summer or September 2027.',
  email: 'clauuagromayor@gmail.com',
  linkedin: 'https://linkedin.com/in/claudia-agromayor',
  github: 'https://github.com/ClaudiaAgromayor',
}

export const BEYOND = {
  title: 'Beyond Engineering',
  text: 'Outside engineering, I compete in sport and contribute to international student communities. At CentraleSupélec, I have been involved in basketball, rowing, surf expeditions and the Spanish Club within a campus representing 77 nationalities.',
  photos: ['/img/championnat_france_basket.jpg', '/img/basket.jpg'],
}

export const CONTACT = {
  tags: 'AI research · Machine learning · Applied computational science',
  text: 'Based between Madrid, Paris and Montréal. Seeking an AI research internship for summer or September 2027.',
}
