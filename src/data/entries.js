// ─────────────────────────────────────────────────────────────
//  SITE CONTENT: edit here. Claudia's own words.
//  One object per entry, grouped into sections in ./sections.js
//  · role: the position and the organisation
//  · line: the one sentence shown before you open it
//  · facts: what you did. A string is a bullet; { list: [...] } is a nested list
//  · img, photos: pictures, shown as a row inside the entry when you open it
//  · video: a YouTube id, shown as a still that plays when clicked
//  · links: [{ href, label }]
// ─────────────────────────────────────────────────────────────

export const ENTRIES = [
  {
    key: 'iric',
    year: 2026,
    title: 'Computational Drug Discovery',
    role: 'Research Intern · Institute for Research in Immunology and Cancer (IRIC), Université de Montréal',
    date: 'June – August 2026',
    place: 'Montréal, Canada',
    line: 'Developed a machine learning pipeline to identify potential safer general anaesthetic compounds from large-scale chemical libraries.',
    facts: [
      'Trained a message-passing neural network on 47,348 compounds scored using zebrafish behavioural data.',
      'Screened 43.6 billion molecules from the ZINC22 library on a SLURM cluster.',
      'Applied developability filters and Pareto optimisation to identify 1,000 candidate compounds balancing quality and novelty.',
      'Approximately 100 compounds are now moving forward for synthesis.',
      'First author of the resulting paper; invited to present the work at the PandemicStop-AI conference at Mila.',
      'The project also led to a PhD offer.',
    ],
    links: [{ href: 'https://github.com/ClaudiaAgromayor/zebrafish-anesthetic-chemprop', label: 'GitHub' }],
    img: '/img/olivier_lab.jpg',
    photos: ['/img/montreal_office.jpg'],
  },
  {
    key: 'aws',
    year: 2025,
    title: 'Generative AI for Enterprise Support',
    role: 'GenAI Engineering Intern · Amazon Web Services',
    date: 'June – August 2025',
    place: 'Madrid',
    line: 'Built and deployed an end-to-end generative AI system for support tickets within the AWS Partner Network.',
    facts: [
      'Processed 5,000+ support tickets per month.',
      'Improved first-attempt accuracy from 75% to 85%.',
      'Reduced average handling time from approximately 4 minutes to 30 seconds.',
      'Combined Amazon Bedrock, Lambda and LangChain to retrieve information from 30+ internal documents and more than 10,000 historical tickets.',
      'Designed the system with a human-in-the-loop workflow before responses reached partners.',
      'The system continued to be used by the team after my internship ended.',
    ],
    img: '/img/aws.jpg',
    photos: ['/img/aws2.jpg'],
  },
  {
    key: 'tooth',
    year: 2026,
    title: '3D Medical Imaging',
    role: 'Master’s Thesis · ICAI',
    date: 'January 2026 – present',
    place: 'Madrid',
    line: 'Developing a deep learning pipeline to automatically identify and analyse root canals from 3D dental scans, supporting endodontic treatment planning.',
    facts: [
      'The pipeline combines three stages:',
      { ordered: true, list: [
        'Tooth localisation and cropping from cone-beam CT scans.',
        '3D segmentation of the root canals.',
        'Anatomical reconstruction and measurement of diameter, curvature, length and cross-section.',
      ] },
      'Implemented and evaluated 3D U-Net and Attention U-Net architectures with Dice loss, addressing the severe class imbalance inherent to the problem: fewer than 1% of voxels correspond to the canals.',
      'The research is supervised at ICAI in collaboration with endodontics specialists from Universidad Complutense de Madrid.',
    ],
  },
  {
    key: 'ibm',
    year: 2025,
    title: 'Evaluating LLMs Under Business Constraints',
    role: 'Research Intern · IBM France Lab',
    date: 'January – June 2025',
    place: 'Paris',
    line: 'Investigated how different LLM architectures perform when applying complex business rules to real policy-compliance decisions.',
    facts: [
      'Built and benchmarked five approaches across 200+ client cases, including:',
      { list: [
        'batch processing;',
        'iterative reasoning;',
        'few-shot prompting;',
        'chain-of-thought;',
        'retrieval-augmented generation.',
      ] },
      'The final system improved exact-match accuracy from 46% to 91%, achieving 0.89 F1 on domain-specific question answering.',
      'The architecture combined dense embeddings with a TF-IDF fallback and leakage-safe neighbour exclusion.',
      'The main finding was that increasing context did not necessarily improve performance: pipeline structure mattered more than simply providing the model with more information.',
    ],
  },
  {
    key: 'federated',
    year: 2025,
    title: 'Federated Learning for Industrial Systems',
    role: 'Bachelor’s Thesis',
    date: 'January – August 2025',
    place: 'Madrid',
    line: 'Designed and implemented a platform for federated learning in heterogeneous industrial environments, enabling multiple organisations to train a shared model without centralising their data.',
    facts: [
      'Built a five-layer Python/FastAPI platform supporting 15 heterogeneous clients.',
      'The system evaluated federated optimisation strategies under non-identically distributed data. SCAFFOLD achieved 9% higher accuracy and 40% faster convergence than the alternatives evaluated.',
      'Differential privacy was also integrated into the platform.',
      'The project focused on a central challenge in industrial federated learning: distinguishing genuine model limitations from problems caused by heterogeneous data distributions.',
    ],
  },

  {
    key: 'altex',
    year: 2024,
    title: 'Quantitative Developer',
    role: 'Altex Asset Management',
    date: 'June – August 2024',
    place: 'Madrid',
    line: 'Developed systematic investment strategies using machine learning and financial time-series data.',
    facts: [
      'Built asset-rotation strategies across commodities, indices and bonds using momentum, growth and value factors.',
      'Backtests achieved 15% annualised return with a 10% maximum drawdown.',
      'A major focus of the work was validating the robustness of the backtests and avoiding strategies that appeared strong due to methodological artefacts.',
    ],
  },
  {
    key: 'forum',
    year: 2023,
    title: 'Treasurer',
    role: 'Forum CentraleSupélec',
    date: 'November 2023 – January 2025',
    place: 'Paris',
    line: 'Managed the finances of Forum CentraleSupélec, France’s largest student forum, bringing together 200 companies and 3,500 students annually.',
    facts: [
      'Managed a €600K budget within a 30-person team.',
      'Led initiatives that increased revenue by 7% to €1.3M.',
      'Improved the organisation’s net result by 40%.',
      'Rebuilt the invoicing workflow to comply with French legal requirements.',
      'Migrated billing operations to Zoho Billing, integrating the system with the organisation’s CRM.',
    ],
    img: '/img/forum.jpg',
    photos: ['/img/forum2.jpg'],
  },
  {
    key: 'ices',
    year: 2020,
    title: 'Social Media & Content Manager',
    role: 'ICES',
    date: '2020 – 2023',
    place: 'Madrid',
    line: 'Joined ICES at 17 as the most junior member of the team and developed a TikTok strategy to expand the organisation’s reach among Spanish students interested in studying abroad.',
    facts: [
      'Proposed the strategy directly to the directors, launched and managed the account independently, and grew it to 1,000+ followers within the first month.',
      'The account has since grown beyond 2,300 followers and 38,000 likes.',
      'I continued the role for three years alongside my final years of school and the beginning of my engineering studies.',
    ],
    img: '/img/cuenta_ices.jpg',
    photos: ['/img/ices.jpg'],
  },

  {
    key: 'master',
    year: 2025,
    title: 'Double Master’s Degree',
    role: 'Universidad Pontificia Comillas ICAI',
    date: 'September 2025 – June 2027',
    place: 'Madrid',
    line: 'Currently completing two master’s degrees: Industrial Engineering, and Intelligent Industry.',
    facts: [
      'The programme combines engineering with machine learning applied to industrial systems, covering machine learning, deep learning, statistics, optimisation, robotics and cloud computing.',
    ],
  },
  {
    key: 'centrale',
    year: 2023,
    title: 'Double Degree in Engineering',
    role: 'CentraleSupélec × Universidad Pontificia Comillas ICAI',
    date: 'September 2023 – June 2025',
    place: 'Paris',
    line: 'Selected as one of two ICAI students for the double-degree programme with CentraleSupélec.',
    facts: [
      'Completed the programme in French, entering directly from Madrid without the traditional French prépa pathway.',
      'Graduated in the top 10% of the cohort, with a 9.2/10 average over the final two years.',
      'The programme combined electrical and industrial engineering with applied data and systems work, including:',
      { list: [
        'electricity demand forecasting in collaboration with EDF;',
        'wind-farm optimisation using MPPT control;',
        'airflow modelling for a helicopter engine with Safran;',
        'engineering projects with BCG.',
      ] },
    ],
  },
  {
    key: 'dauphine',
    year: 2024,
    title: 'Applied Economics',
    role: 'Université Paris Dauphine-PSL',
    date: 'September 2024 – June 2025',
    place: 'Paris',
    line: 'Completed an Applied Economics degree alongside the engineering programme.',
    facts: [
      'Selected for the Grande École track, with 7 students selected from approximately 1,500 students in the year.',
      'Focused on macroeconomics, quantitative economics and decision-making under uncertainty.',
    ],
    img: '/img/dauphine.jpg',
  },

  {
    key: 'angryrobot',
    year: 2026,
    title: 'AngryRobot — AI Agent Safety',
    role: 'HackSpain 2026',
    date: 'September 2026',
    place: 'Madrid',
    line: 'Led a team of builders during HackSpain 2026 to develop AngryRobot, an AI safety system designed to detect when autonomous agents should be stopped.',
    facts: [
      'The project was developed for HappyRobot’s challenge on handling crises with AI agents.',
      'We built an environment where agents deliberately fail through objective misinterpretation, constraint violations, scope expansion and false reporting.',
      'AngryRobot combines:',
      { list: ['deterministic safety checks;', 'loop detection;', 'an independent LLM judge;', 'an Agent Risk Index.'] },
      'The system determines whether an agent should continue, raise a warning, involve a human or be shut down.',
      'During testing, rogue agents were able to make real phone calls, providing a realistic environment for evaluating agent safety.',
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
    role: 'Smart Industry Hackathon · Kearney × CAF',
    date: 'October 2025',
    place: 'Madrid',
    line: 'Led a team developing CAFFY, an AI assistant designed to help railway maintenance technicians identify faulty components from free-text maintenance reports.',
    facts: [
      'Used BERT embeddings and logistic regression to classify maintenance notes, achieving 80% top-3 accuracy.',
      'The system also incorporated voice input, allowing technicians to interact with it while working on trains.',
      '1st place, Smart Industry Hackathon.',
    ],
    img: '/img/hackathon_kearney.jpg',
    photos: ['/img/presentacion_hackathon.jpg', '/img/visita_caf.jpg'],
  },

  {
    key: 'iberdrola',
    year: 2026,
    title: 'Iberdrola Master’s Scholarship',
    role: 'Iberdrola',
    date: '2026 – 2027',
    place: 'Madrid',
    line: 'Selected as one of eight recipients in Spain for the Iberdrola Master’s Scholarship.',
    facts: [
      'The selection process included academic and CV screening, mathematics and logic assessments, an English evaluation, a presentation and interviews with senior executives.',
    ],
  },

  {
    key: 'camp',
    year: 2022,
    title: 'Camp Counsellor & Lifeguard',
    role: 'Camp Wapo',
    date: 'June – August 2022',
    place: 'Wisconsin, USA',
    line: 'Worked as a camp counsellor and American Red Cross lifeguard at 19, leading groups of twelve girls aged 8–13 throughout the summer.',
    facts: [
      'Managed weekly activities, workshops and group dynamics while working independently more than 7,000 kilometres from home.',
      'Performed 10+ real rescues in the lake and received the camp’s “You Rock” award.',
    ],
    img: '/img/camp_counselor.jpg',
    photos: ['/img/camp_counselor2.jpg'],
  },

  {
    key: 'casvi',
    year: 2021,
    title: 'Academic Excellence',
    role: 'Eurocolegio Casvi',
    date: '2018 – 2021',
    place: 'Boadilla del Monte',
    line: 'Graduated as the top student in my year in the technological sciences track.',
    facts: [
      'Received an Honourable Mention and Diploma of Excellence from the Community of Madrid and participated in a STEM programme at Universidad Carlos III.',
    ],
    img: '/img/premio_bachillerato.jpg',
  },
  {
    key: 'gymnastics',
    year: 2013,
    title: 'International Aesthetic Gymnastics',
    role: 'Boadilla del Monte junior team',
    date: '2013',
    place: 'Barcelona',
    line: 'Competed internationally in aesthetic group gymnastics and finished 5th in the world with Boadilla’s junior team.',
    facts: [
      'Trained six days a week for ten years, competing internationally from a young age.',
    ],
    img: '/img/gimnasia-2013.jpg',
    links: [{ href: 'https://www.ayuntamientoboadilladelmonte.org/boadilla-actualidad/noticias/el-equipo-infantil-de-gimnasia-estetica-de-boadilla-obtiene-el-quinto', label: 'Read the news (Spanish)' }],
  },
  {
    key: 'maths',
    year: 2015,
    title: 'Mathematics Competitions',
    role: 'Mathematics Gymkhana',
    date: '2015',
    place: 'Boadilla del Monte',
    line: 'Won first prize in Boadilla del Monte’s Mathematics Gymkhana against 400 students.',
    facts: [
      'Participated regularly in mathematics and science competitions from sixth grade onwards.',
    ],
    img: '/img/gymkana-2015.jpg',
    links: [{ href: 'https://www.ayuntamientoboadilladelmonte.org/boadilla-actualidad/noticias/cuatrocientos-escolares-participan-en-la-ii-gymkana-matematica-de', label: 'Read the news (Spanish)' }],
  },
]

export const PROFILE = {
  name: 'Claudia Agromayor',
  title: 'AI & Machine Learning Engineer | Researcher',
  field: 'Industrial Engineering & Computer Science',
  places: 'Madrid · Paris · Montréal',
  intro: 'I build and research AI systems for real-world problems, from industrial machine learning and generative AI to medical imaging and computational drug discovery.',
  now: 'Currently pursuing a double master’s degree in Industrial Engineering and Intelligent Industry at ICAI, with research experience across AI, machine learning and applied computational science.',
  next: 'Seeking an AI research internship from March 2027.',
  email: 'clauuagromayor@gmail.com',
  linkedin: 'https://linkedin.com/in/claudia-agromayor',
  github: 'https://github.com/ClaudiaAgromayor',
}

/* The two closing sections, in her words. */
export const BEYOND = {
  title: 'Beyond Engineering',
  paragraphs: [
    'Outside research and engineering, I have been involved in competitive sport, student organisations and international communities.',
    'At CentraleSupélec, I played basketball in the French university championship and Intercentrales, participated in a 24-hour rowing event for charity, organised surf trips on the French Atlantic coast and helped run the Spanish Club on a campus representing 77 nationalities.',
    'These activities have been a constant alongside my academic work, from competitive gymnastics during childhood to university-level sport and student leadership.',
  ],
  photos: ['/img/championnat_france_basket.jpg', '/img/basket.jpg'],
}

export const CURRENTLY = {
  title: 'Currently',
  tags: 'AI research · Machine learning · Applied computational science',
  paragraphs: [
    'Currently based between Madrid, Paris and Montréal, and seeking an AI research internship from March 2027.',
    'I am particularly interested in problems where machine learning has to work beyond the benchmark: heterogeneous data, large-scale inference, scientific discovery, medical applications and systems that need to operate reliably in the real world.',
  ],
}
