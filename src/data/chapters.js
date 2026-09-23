// ─────────────────────────────────────────────────────────────
//  SITE CONTENT — edit here.
//  One object per chapter, in chronological order.
//  · area: 'sport' | 'edu' | 'industry' | 'research'  (see AREAS)
//  · facts: what you did (short lines, with numbers)
//  · took: what you took from it — DRAFT, rewrite it in your own voice
//  · img: path inside /public (optional)
// ─────────────────────────────────────────────────────────────

export const AREAS = {
  sport: { name: 'Sport', color: '#2F8C7E' },
  edu: { name: 'Education', color: '#6B5BD6' },
  industry: { name: 'Industry', color: '#C07F2A' },
  research: { name: 'Research', color: '#C8553F' },
}

export const CHAPTERS = [
  {
    area: 'sport', year: 2013, date: 'May 2013', place: 'Barcelona',
    title: 'Fifth in the world',
    line: 'With Boadilla’s junior aesthetic gymnastics team: fifth place worldwide with the routine “Las Pentagramas”.',
    facts: [
      'Twelve gymnasts aged 8 to 10, one routine.',
      'Fifth place at the international competition in Barcelona.',
    ],
    took: 'Precision is trained: hundreds of repetitions for one perfect minute.',
    img: '/img/gimnasia-2013.jpg',
    link: 'https://www.ayuntamientoboadilladelmonte.org/boadilla-actualidad/noticias/el-equipo-infantil-de-gimnasia-estetica-de-boadilla-obtiene-el-quinto',
  },
  {
    area: 'edu', year: 2015, date: 'April 2015', place: 'Boadilla del Monte',
    title: 'The maths gymkhana',
    line: 'First prize at Boadilla’s 2nd Maths Gymkhana, among four hundred students.',
    facts: [
      'A team competition between schools from Boadilla and nearby towns.',
      'First prize with my team.', // CHECK: confirm category and school
    ],
    took: 'Maths can be played, too.',
    img: '/img/gymkana-2015.jpg',
    link: 'https://www.ayuntamientoboadilladelmonte.org/boadilla-actualidad/noticias/cuatrocientos-escolares-participan-en-la-ii-gymkana-matematica-de',
  },
  {
    area: 'edu', year: 2021, date: 'Sep 2021 – Aug 2025', place: 'Madrid · Paris',
    title: 'Two countries, one degree',
    line: 'Double B.Sc. in Electrical Engineering between ICAI (Comillas) and CentraleSupélec.',
    facts: [
      'Top 5% of the cohort — 9.2/10 GPA over the last two years.',
      'Signal processing, linear algebra, power and electronic systems.',
    ],
    took: 'Changing country, language and way of learning without lowering the bar.',
  },
  {
    area: 'industry', year: 2024, date: 'Jun – Aug 2024', place: 'Madrid',
    title: 'Altex Asset Management',
    line: 'Quantitative Developer Intern: machine learning on financial time series.',
    facts: [
      'Designed and backtested a systematic strategy with 15% annualised returns and controlled drawdown.',
      'Built ML pipelines under strict latency and risk constraints.',
    ],
    took: 'A good backtest is not a promise: honest validation matters more than the number.',
  },
  {
    area: 'research', year: 2025, date: 'Jan – Jun 2025', place: 'IBM',
    title: 'LLMs that follow rules',
    line: 'Can an LLM be trusted to apply complex business rules? Five architectures to find out.',
    facts: [
      'Benchmarked batch, iterative, few-shot, chain-of-thought and RAG pipelines for policy-compliance decisions.',
      'Hybrid dense + TF-IDF retrieval with leakage-safe nearest-neighbour exclusion.',
      'Exact Match from 46% to 91%; 0.89 F1 on domain QA.',
    ],
    took: 'More context is not more reasoning: pipeline design matters more than the model.',
  },
  {
    area: 'research', year: 2025, date: 'Jan – Aug 2025', place: 'Bachelor thesis',
    title: 'Learning without sharing data',
    line: 'A federated learning platform, built from scratch.',
    facts: [
      '15 heterogeneous non-IID clients; FedAvg, FedProx and SCAFFOLD against client drift.',
      '+9% accuracy and 40% faster convergence than a centralised baseline.',
    ],
    took: 'Collaborating without giving up what is private is an engineering problem too.',
  },
  {
    area: 'industry', year: 2025, date: 'Jun – Aug 2025', place: 'Madrid',
    title: 'Amazon Web Services',
    line: 'GenAI Engineering Intern: an end-to-end generative-AI ticket-triage system.',
    facts: [
      '5,000+ tickets a month; first-attempt accuracy from 75% to 85%.',
      'From 4 minutes to 30 seconds per ticket with Bedrock, Lambda and LangChain — human in the loop.',
    ],
    took: 'Useful AI is the AI people choose to use every day.',
  },
  {
    area: 'edu', year: 2025, date: 'Sep 2025 – Jun 2027', place: 'Paris · Madrid',
    title: 'Double master’s & Dauphine',
    line: 'Computer Science & Engineering (CentraleSupélec + ICAI), with applied economics at Paris Dauphine–PSL.',
    facts: [
      'Machine learning, deep learning, statistics, optimisation and robotics.',
      'Decision-making under uncertainty and quantitative economics.',
    ],
    took: 'Engineering to build models; economics to decide when they are worth it.',
  },
  {
    area: 'research', year: 2025, date: 'October 2025', place: 'Kearney & CAF',
    title: 'First place in 48 hours',
    line: 'Smart Industry Hackathon: real-time diagnostics for railway maintenance.',
    facts: [
      'Led the team: BERT embeddings + logistic regression, 80% top-3 accuracy.',
      'Shipped a FastAPI backend and web UI in under 48 hours.',
    ],
    took: 'The most useful model won, not the most complex one.',
  },
  {
    area: 'research', year: 2026, date: 'Jan 2026 – now', place: 'Project',
    title: 'Seeing inside a tooth',
    line: '3D segmentation of root canals with U-Net and Attention U-Net.',
    facts: [
      'DICOM validation pipeline: automated vs expert annotations via volumetric Dice.',
      'Dice loss against extreme sparsity: fewer than 1% positive voxels.',
    ],
    took: 'With data this imbalanced, a comfortable metric can lie.',
  },
  {
    area: 'research', year: 2026, date: 'Jun – Aug 2026', place: 'Montréal, Canada',
    title: 'IRIC, Université de Montréal',
    line: 'Machine Learning Research Intern: virtual drug screening at the scale of billions.',
    facts: [
      'HPC pipeline on SLURM: from 47K to 4B+ compounds.',
      'Multi-task D-MPNNs for 26 ADMET endpoints, with 1,000-model ensembles for uncertainty.',
      '1.04M candidates identified in ZINC22. Manuscript in preparation.',
    ],
    took: 'Scaling up is a scientific problem, not just a compute problem.',
  },
]

export const PROFILE = {
  name: 'Claudia Agromayor',
  role: 'AI / ML Engineer',
  intro: 'Curious by nature.',
  introEm: 'Persistent by choice.',
  sub: 'A life in chapters — from the gymnastics mat to machine-learning research.',
  next: 'Seeking an AI research internship from March 2027.',
  email: 'clauuagromayor@gmail.com',
  linkedin: 'https://linkedin.com/in/claudia-agromayor',
  github: 'https://github.com/ClaudiaAgromayor',
}

// Once you have a 3D model, drop it in /public and set e.g. '/avatar.glb'.
// While null, the site uses the abstract pearl figure.
export const AVATAR_URL = null
