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
    start: 2026.42,
    year: 2026,
    title: 'Research Intern',
    org: 'IRIC, Université de Montréal',
    date: 'Jun – Aug 2026',
    place: 'Montréal',
    line: 'Built a machine learning pipeline to discover safer general anaesthetic candidates from large-scale chemical libraries.',
    stats: [
      { v: '96B', k: 'molecules screened' },
      { v: '1,000', k: 'candidates selected' },
      { v: '~100', k: 'advancing to synthesis' },
    ],
    facts: [
      'Trained a message-passing neural network on compounds scored using zebrafish behavioural data, then scaled it out on SLURM across 96 billion molecules from the ZINC22 library.',
      'Applied developability filters and Pareto optimisation to narrow the search to 1,000 candidates, with ~100 advancing to experimental synthesis.',
      'Led the resulting work as first author, presented the research at PandemicStop-AI at Mila, and received a PhD offer following the project.',
      'A paper on this work is going to be published. The code and a fuller account of the project will follow on GitHub.',
    ],
    links: [{ href: 'https://github.com/ClaudiaAgromayor/zebrafish-anesthetic-chemprop', label: 'GitHub' }],
    img: '/img/olivier_lab.jpg',
    photos: ['/img/montreal_office.jpg'],
  },
  {
    key: 'aws',
    start: 2025.42,
    year: 2025,
    title: 'Generative AI Engineer',
    org: 'Amazon Web Services',
    date: 'Jun – Aug 2025',
    place: 'Madrid',
    line: 'Built and deployed an end-to-end generative AI system for the AWS Partner Network, processing 5,000+ support tickets per month.',
    stats: [
      { v: '5,000+', k: 'tickets a month' },
      { v: '75 → 85%', k: 'accuracy' },
      { v: '4 min → 30 s', k: 'handling time' },
    ],
    facts: [
      'Combined 30+ internal documents with 10,000+ historical tickets using Amazon Bedrock, Lambda and LangChain.',
      'Improved accuracy from 75% to 85% while reducing average handling time from ~4 minutes to 30 seconds.',
      'Added a human-in-the-loop validation layer before responses reached partners; the system remained in active use after the internship.',
      'Certified as AWS Cloud Practitioner and AWS AI Practitioner.',
    ],
    img: '/img/aws.jpg',
    photos: ['/img/aws2.jpg'],
  },
  {
    key: 'altex',
    start: 2024.42,
    year: 2024,
    title: 'Quantitative Developer',
    org: 'Altex Asset Management',
    date: 'Jun – Aug 2024',
    place: 'Madrid',
    line: 'Developed machine learning and systematic investment strategies for financial time series across commodities, indices and bonds.',
    stats: [
      { v: '15%', k: 'annualised backtest return' },
      { v: '10%', k: 'maximum drawdown' },
    ],
    facts: [
      'Designed and evaluated asset-rotation strategies combining momentum, growth and value signals.',
      'Built robust backtesting workflows, with the focus on avoiding methodological artefacts and overestimating what a strategy can do.',
    ],
  },
  {
    key: 'forum',
    start: 2023.85,
    year: 2023,
    title: 'Treasurer',
    org: 'Forum CentraleSupélec',
    date: 'Nov 2023 – Jan 2025',
    place: 'Paris',
    line: 'Managed finances for France’s largest student forum as part of a 30-person team overseeing a €600K budget, 200 companies and 3,500 students annually.',
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
    start: 2020.6,
    year: 2020,
    quiet: true,
    title: 'Social Media & Content Manager',
    org: 'ICES',
    date: '2020 – 2023',
    place: 'Madrid',
    line: 'Joined ICES at 17 as its most junior team member and proposed a TikTok strategy for Spanish students studying abroad directly to the directors.',
    stats: [
      { v: '1,000+', k: 'followers in month one' },
      { v: '38,000', k: 'likes' },
    ],
    facts: [
      'Launched and managed the account independently, reaching 1,000+ followers in the first month and growing it to 2,300+ followers and 38,000 likes.',
      'Continued the role for three years, alongside the end of school and the start of my engineering studies.',
    ],
    img: '/img/cuenta_ices.jpg',
    photos: ['/img/ices.jpg'],
  },

  /* ── Selected research & technical work ──────────────────── */
  {
    key: 'tooth',
    start: 2026.0,
    year: 2026,
    title: '3D Medical Imaging',
    org: 'Master’s Thesis, ICAI',
    date: 'Jan 2026 – Present',
    place: 'Madrid',
    line: 'Building a deep learning pipeline to identify and analyse root canals from 3D dental scans, supporting endodontic treatment planning.',
    stats: [{ v: '<1%', k: 'of voxels are root canal' }],
    facts: [
      'Developing a three-stage pipeline: tooth localisation and cropping from CBCT scans, 3D root-canal segmentation, and anatomical reconstruction of diameter, curvature, length and cross-section.',
      'Implementing 3D U-Net and Attention U-Net architectures with Dice loss in a highly imbalanced segmentation setting.',
      'Working with endodontics specialists from Universidad Complutense de Madrid, under supervision at ICAI.',
    ],
  },
  {
    key: 'ibm',
    start: 2025.0,
    year: 2025,
    title: 'LLM Evaluation for Business-Rule Compliance',
    org: 'IBM France Lab',
    date: 'Jan – Jun 2025',
    place: 'Paris',
    line: 'Evaluated LLM-based approaches for complex policy compliance across 200+ client cases.',
    stats: [
      { v: '46 → 91%', k: 'exact match' },
      { v: '0.89', k: 'F1 on domain QA' },
    ],
    facts: [
      'Compared batch processing, iterative reasoning, few-shot prompting, chain-of-thought and retrieval-augmented generation.',
      'Combined dense embeddings with a TF-IDF fallback and leakage-safe neighbour exclusion to improve retrieval reliability.',
      'Found that increasing context did not necessarily improve performance; pipeline structure and retrieval strategy had a larger effect on accuracy.',
    ],
  },
  {
    key: 'federated',
    start: 2025.0,
    year: 2025,
    title: 'Federated Learning for Industrial Systems',
    org: 'Bachelor’s Thesis',
    date: 'Jan – Aug 2025',
    place: 'Madrid',
    line: 'Designed and implemented a federated learning platform for heterogeneous industrial environments, enabling a shared model to be trained without centralising data.',
    stats: [
      { v: '+9%', k: 'accuracy with SCAFFOLD' },
      { v: '40%', k: 'faster convergence' },
      { v: '15', k: 'heterogeneous clients' },
    ],
    facts: [
      'Built a five-layer Python/FastAPI platform supporting 15 heterogeneous clients.',
      'Evaluated federated optimisation under non-IID data and found that SCAFFOLD improved accuracy by 9% and reduced convergence time by 40%.',
      'Integrated differential privacy and separated the limitations caused by the learning algorithm from those caused by heterogeneous data distributions.',
    ],
  },

  /* ── Selected projects ───────────────────────────────────── */
  {
    key: 'angryrobot',
    start: 2026.7,
    year: 2026,
    title: 'AngryRobot: AI Agent Safety',
    org: 'HackSpain 2026',
    date: 'Sep 2026',
    place: 'Madrid',
    line: 'Led a team building a safety layer for autonomous AI agents during the HappyRobot crisis challenge.',
    facts: [
      'Designed deterministic safety checks, loop detection, an independent LLM judge and an Agent Risk Index to classify whether an agent should continue, warn, request human intervention or shut down.',
      'Tested the system against deliberate failure modes including objective misinterpretation, constraint violations, scope expansion and false reporting.',
      'During testing, rogue agents made real phone calls, exposing how autonomous systems can behave outside their intended scope.',
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
    start: 2025.78,
    year: 2025,
    title: 'CAFFY: AI for Railway Maintenance',
    org: 'Kearney × CAF Smart Industry Hackathon',
    date: 'Oct 2025',
    place: 'Madrid',
    line: 'Led a team developing an AI assistant to identify faulty railway components from free-text maintenance reports.',
    stats: [
      { v: '1st', k: 'place' },
      { v: '80%', k: 'top-3 accuracy' },
    ],
    facts: [
      'Combined BERT embeddings with logistic regression to classify faulty components, and added voice input for technicians.',
    ],
    img: '/img/hackathon_kearney.jpg',
    photos: ['/img/presentacion_hackathon.jpg', '/img/visita_caf.jpg'],
  },

  /* ── Education ───────────────────────────────────────────── */
  {
    key: 'master',
    start: 2025.7,
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
    start: 2023.7,
    year: 2023,
    title: 'Double Degree Engineering',
    org: 'CentraleSupélec × ICAI',
    date: 'Sep 2023 – Jun 2025',
    place: 'Paris',
    line: 'One of two ICAI students selected for the double degree with CentraleSupélec.',
    stats: [
      { v: '1 of 2', k: 'students selected' },
      { v: 'Top 10%', k: 'of the cohort' },
      { v: '9.2/10', k: 'final two years' },
    ],
    facts: [
      'Completed the programme in French, entering directly from Madrid without the two years of French prépa that the route normally requires.',
      'Graduated in the top 10% of the cohort, with a 9.2/10 average over the final two years.',
    ],
    tagsLabel: 'Relevant projects',
    tags: ['EDF electricity demand forecasting', 'Wind farm MPPT optimisation', 'Safran helicopter airflow modelling', 'BCG projects'],
  },
  {
    key: 'dauphine',
    start: 2024.7,
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
    start: 2026.45,
    year: 2026,
    quiet: true,
    title: 'Iberdrola Master’s Scholarship',
    org: 'Iberdrola',
    date: '2026 – 2027',
    place: 'Spain',
    line: 'One of eight recipients selected in Spain.',
    stats: [{ v: '8', k: 'recipients in Spain' }],
    facts: [
      'Selected through CV and academic screening, mathematics and logic assessments, an English evaluation, a presentation, and interviews with senior executives.',
    ],
  },

  /* ── Earlier experience and early achievements ───────────── */
  {
    key: 'camp',
    start: 2022.42,
    year: 2022,
    quiet: true,
    title: 'Camp Counsellor & Lifeguard',
    org: 'Camp Wapo, Wisconsin',
    date: 'Jun – Aug 2022',
    place: 'Wisconsin',
    line: 'Worked as a camp counsellor and Red Cross lifeguard at 19, 7,000 km from home.',
    facts: [
      'Managed a new group of twelve girls aged 8 to 13 every week: activities, workshops and the group dynamics that come with them.',
      'Completed 10+ rescues in the lake over the summer and received the camp’s “You Rock” award.',
    ],
    img: '/img/camp_counselor.jpg',
    photos: ['/img/camp_counselor2.jpg'],
  },
  {
    key: 'casvi',
    start: 2018.7,
    year: 2021,
    quiet: true,
    title: 'Academic Excellence',
    org: 'Eurocolegio Casvi',
    date: '2018 – 2021',
    place: 'Boadilla del Monte',
    line: 'Top student of my year in the technological sciences track.',
    facts: [
      'Honourable Mention and Diploma of Excellence from the Community of Madrid.',
      'Took part in a STEM programme at Universidad Carlos III alongside school.',
    ],
    img: '/img/premio_bachillerato.jpg',
  },
  {
    key: 'gymnastics',
    start: 2013.3,
    year: 2013,
    quiet: true,
    title: 'International Aesthetic Gymnastics',
    org: 'Boadilla junior team',
    date: '2013',
    place: 'Barcelona',
    line: '5th in the world in Barcelona with the Boadilla junior team.',
    stats: [{ v: '5th', k: 'in the world' }],
    facts: [
      'Trained six days a week for ten years, competing internationally from a young age.',
    ],
    img: '/img/gimnasia-2013.jpg',
    links: [{ href: 'https://www.ayuntamientoboadilladelmonte.org/boadilla-actualidad/noticias/el-equipo-infantil-de-gimnasia-estetica-de-boadilla-obtiene-el-quinto', label: 'Read the news (Spanish)' }],
  },
  {
    key: 'maths',
    start: 2015.25,
    year: 2015,
    quiet: true,
    title: 'Mathematics Competitions',
    org: 'Boadilla Maths Gymkhana',
    date: '2015',
    place: 'Boadilla del Monte',
    line: 'First prize in the Boadilla Maths Gymkhana, among 400 students.',
    facts: [
      'Took part regularly in mathematics and science competitions from sixth grade onwards.',
    ],
    img: '/img/gymkana-2015.jpg',
    links: [{ href: 'https://www.ayuntamientoboadilladelmonte.org/boadilla-actualidad/noticias/cuatrocientos-escolares-participan-en-la-ii-gymkana-matematica-de', label: 'Read the news (Spanish)' }],
  },
]

export const PROFILE = {
  name: 'Claudia Agromayor',
  title: 'AI & Machine Learning Engineer · Researcher',
  field: 'Industrial Engineering & Computer Science',
  places: 'Madrid · Paris · Montréal',
  // the opening block. **like this** comes out bold
  claim: 'I build AI systems where research meets real-world constraints.',
  // the hero positions; the work below it is the evidence, so no figures up here
  status: 'Final-year MII + MIINT student at ICAI, combining Industrial Engineering with Computer Science, graduating June 2027.',
  blurb: [
    'I deliberately seek steep learning curves. I have moved across countries, disciplines and environments, repeatedly starting from unfamiliar ground and learning fast enough to contribute. I am comfortable with difficult problems, high expectations and not having all the answers at the start.',
    'Currently in the final year of a double master’s at ICAI, combining Industrial Engineering with Computer Science and AI, graduating June 2027.',
  ],
  next: 'I am looking forward to the next chapter: learning from people who push me, taking on problems that stretch me, and giving everything I have to the work.',
  linkedin: 'https://linkedin.com/in/claudia-agromayor',
  github: 'https://github.com/ClaudiaAgromayor',
}

export const BEYOND = {
  title: 'Beyond Engineering',
  paragraphs: [
    'Outside engineering, I compete in sport and contribute to international student communities. At CentraleSupélec, I took part in basketball, rowing, surf expeditions and the Spanish Club on a campus representing 77 nationalities.',
    'I have also volunteered with Cáritas, Volant and AREMACS, including work focused on reducing the environmental footprint of large events.',
    'I work in Spanish, English and French. Sport, international environments and moving between countries have been a constant part of my education alongside engineering.',
  ],
  photos: ['/img/championnat_france_basket.jpg', '/img/basket.jpg'],
}

export const CONTACT = {
  tags: 'AI research · Machine learning · Applied computational science',
  text: 'I am looking forward to the next chapter: learning from people who push me, taking on problems that stretch me, and giving everything I have to the work.',
}
