// ─────────────────────────────────────────────────────────────
//  SITE CONTENT: edit here.
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
// (deep, mid, highlight): all whites and beiges, each with a faint tint of its own.
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
    line: 'Half French, half Spanish, born in Madrid into a family spread across Europe, Asia and the Americas. I grew up switching languages at the dinner table.',
    facts: [
      'Two passports, three languages at home, and relatives on three continents. Family lunches were where I learned that the same story can be told in several ways and all of them be true.',
      'Spanish, French and English (Cambridge C1 Advanced). I think in whichever one the problem is easiest in.',
      'Growing up between cultures gave me the habit I still rely on: assume there is another way of doing this, then go and find it.',
    ],
    took: 'Being born between cultures made me curious about how everything works, and how it could work differently.',
  },
  {
    area: 'sport', year: 2013, date: 'May 2013', place: 'Barcelona',
    title: 'Fifth in the world',
    line: 'Ten years of gymnastics, and one routine I still remember minute by minute: fifth in the world in Barcelona with Boadilla’s junior aesthetic group team.',
    facts: [
      'Twelve girls aged 8 to 10, one routine called “Las Pentagramas”, and teams from Finland, Italy and a dozen other countries on the same floor.',
      'Fifth place at the international tournament in Barcelona. We were the youngest team in our category.',
      'By twelve I was competing nationally in rhythmic gymnastics as well. Training was six days a week, before and after school.',
      'Ten years of it taught me what repetition really is: you do the same movement a thousand times so that on the day it happens without you.',
    ],
    took: 'Gymnastics taught me to handle pressure, to train discipline and to keep going. Precision is trained, not given.',
    img: '/img/gimnasia-2013.jpg',
    link: 'https://www.ayuntamientoboadilladelmonte.org/boadilla-actualidad/noticias/el-equipo-infantil-de-gimnasia-estetica-de-boadilla-obtiene-el-quinto',
  },
  {
    area: 'edu', year: 2015, date: 'April 2015', place: 'Boadilla del Monte',
    title: 'Maths as a game',
    line: 'First prize at Boadilla’s second Maths Gymkhana, against four hundred other students. For me, maths competitions were what other people did with video games.',
    facts: [
      'A team competition between schools from Boadilla and the towns around it: stations across the town, a problem at each one, and a clock running.',
      'First prize with my team, out of four hundred students.',
      'From sixth grade on I entered every maths and science competition I could find. I won a few of them, including an iPad that I was extremely proud of.',
      'Nobody made me do it. That is the part that mattered later, when the problems got harder and there was no prize at the end.',
    ],
    took: 'Maths was never homework to me. It was the best puzzle around.',
    img: '/img/gymkana-2015.jpg',
    link: 'https://www.ayuntamientoboadilladelmonte.org/boadilla-actualidad/noticias/cuatrocientos-escolares-participan-en-la-ii-gymkana-matematica-de',
  },
  {
    area: 'edu', year: 2021, date: '2018 – 2021', place: 'Boadilla del Monte',
    title: 'Top of the class',
    line: 'High school in technological sciences at Eurocolegio Casvi, finished as best student of my year with a Diploma of Excellence from the Community of Madrid.',
    facts: [
      'Honourable Mention and Diploma of Excellence from the Community of Madrid, and named best student of my year at Casvi.',
      'A STEM programme at Universidad Carlos III alongside school, which was my first look at what engineering actually involved.',
      'Volunteering with Cáritas, organising food drives at school, and with Volant, spending afternoons with residents of a care home. Two years of it, and the part of school I would repeat first.',
      'I also won the school’s Christmas drawing contest, which is on here because I like that the two things sit side by side.',
    ],
    took: 'Science and drawing both start the same way: looking closely until you see the structure.',
  },
  {
    area: 'industry', year: 2020, date: '2020 – 2023', place: 'Madrid',
    title: 'From 0 to 1,000 on TikTok',
    line: 'My first job, at seventeen: social media and content manager at ICES, which sends Spanish students to spend a high-school year in the United States and Canada.',
    facts: [
      'I was the most junior person in the marketing team. I spent weeks studying what worked on TikTok, wrote a strategy, and asked the directors for a meeting to pitch it. Nobody had asked me for it.',
      'They said yes. I launched the account, ran it on my own, and it passed 1,000 followers in its first month.',
      'Day to day: Instagram, Facebook and TikTok, more than twenty articles and student testimonials for the blog, and working the ICES events where families decide whether to send their child abroad for a year.',
      'Three years there, alongside my last year of school and my first years of engineering.',
    ],
    took: 'Being the most junior person in the room is no reason to leave a good idea in a drawer.',
  },
  {
    area: 'edu', year: 2021, date: 'Sep 2021', place: 'Madrid',
    title: 'Engineering at ICAI',
    line: 'Industrial Engineering at Universidad Pontificia Comillas ICAI, specialising in electrical engineering. I picked it because it was the hardest thing I could get into.',
    facts: [
      'ICAI combined everything I liked at once: maths, physics, and a reputation for being demanding.',
      'Electrical specialisation: power systems, signal processing, electronic systems, linear algebra, and a surprising amount of organic chemistry.',
      'A Soft Skills Diploma alongside the degree, in personal, communication and professional skills.',
      'This is also where the double degree with CentraleSupélec started, which is how I ended up in Paris two years later.',
    ],
    took: 'I look for places that are hard on purpose. That is where you learn fastest.',
  },
  {
    area: 'adventure', year: 2022, date: 'Jun – Aug 2022', place: 'Wisconsin, USA',
    title: 'A summer at Lake Wapogasset',
    line: 'Camp counsellor and lifeguard at a summer camp in Wisconsin. Nineteen years old, first time working on my own, seven thousand kilometres from home.',
    facts: [
      'A new group of twelve girls aged 8 to 13 every week. Games, arts and crafts, workshops, homesickness at bedtime, and more than one friendship to repair before Friday.',
      'American Red Cross lifeguard: CPR, AED, first aid and waterfront rescue. More than ten real rescues in the lake over the summer.',
      'The camp gave me its “You Rock” award at the end of the season.',
      'I arrived with textbook English and left able to calm down a crying eight-year-old at two in the morning, which is a different skill entirely.',
    ],
    took: 'Leaving your comfort zone means making mistakes all the time. I take every one of them as something to learn from.',
    img: '/img/camp_counselor.jpg',
    photos: ['/img/camp_counselor2.jpg'],
  },
  {
    area: 'edu', year: 2023, date: 'Sep 2023 – Jun 2025', place: 'Paris',
    title: 'Paris, without a prépa',
    line: 'One of two ICAI students selected for the double degree with CentraleSupélec, Paris-Saclay. Everyone around me had done two years of prépa to get there. I had not, and I was doing it in French.',
    facts: [
      'French engineering schools select through prépa, two years of intensive preparation before you even start. I went straight in from Madrid and spent the first months catching up in a language I was still learning.',
      'It is where I found what actually drives me: using data to understand systems that already exist. Forecasting electricity demand in a course built with EDF, and optimising a wind farm with MPPT control.',
      'Company projects with Safran, building a tool that models air flow through a helicopter engine, and with BCG on market analysis. Plus a coding week analysing Twitter data about the war in Ukraine.',
      'Finished in the top 10% of the cohort, with a 9.2/10 average over my last two years.',
    ],
    took: 'France gave me the freedom to find what I love: using data to understand how real systems behave.',
  },
  {
    area: 'sport', year: 2023, date: '2023 – 2025', place: 'Paris',
    title: 'Basketball, rowing and surf',
    line: 'Two years of campus life at CentraleSupélec: university basketball, a 24-hour rowing race, surf trips to the Atlantic, and running the Spanish club.',
    facts: [
      'Basketball in the French university championship, the Intercentrales and inter-school tournaments across Paris. Training twice a week around everything else.',
      'HumaAviron: 24 hours of continuous rowing where every kilometre raised one euro for HumaCS. You row, you sleep for an hour, you row again.',
      'Surf Expedition CentraleSupélec: weekends in Normandy and Brittany, in water cold enough to make you question the plan.',
      'Spanish Club, on a campus with 77 nationalities. It is a good way to meet people, and a better way to notice how your own culture looks from outside.',
    ],
    took: 'Basketball, rowing and surfing have one thing in common: you read the environment constantly and decide fast.',
    img: '/img/championnat_france_basket.jpg',
    photos: ['/img/basket.jpg'],
  },
  {
    area: 'community', year: 2023, date: 'Nov 2023 – Jan 2025', place: 'Paris',
    title: 'Treasurer of France’s largest student forum',
    line: 'Forum CentraleSupélec brings 200 companies and 3,500 students together every year. I ran its finances: a €600K budget inside €1.4M of revenue, two thirds of which funds more than 60 student projects.',
    facts: [
      'Fourteen months on a €600K budget: planning, pricing strategy, a redesign of the ERP, and the financial audit at the end.',
      'I inherited an invoicing system that did not meet French legal requirements. I moved the whole thing to Zoho Billing connected to our CRM, and fixed the invoice numbering and the legal mentions before anyone had to explain them to an auditor.',
      'The venue charged a 20% fee on all catering. I found a legal way around it with pre-orders and payments through Lydia, which freed up budget that went straight back into student projects.',
      'None of this is glamorous. It is the work that decides whether 3,500 people have an event to come to.',
    ],
    took: 'Associations are not a line on a CV. They are a collective adventure that gives back far more than you put in.',
    img: '/img/forum.jpg',
    photos: ['/img/forum2.jpg'],
  },
  {
    area: 'industry', year: 2024, date: 'Jun – Aug 2024', place: 'Madrid',
    title: 'Altex Asset Management',
    line: 'Quantitative developer intern, building systematic investment strategies with machine learning on financial time series. I had never studied finance.',
    facts: [
      'Built and backtested asset-rotation strategies across commodities, stock indices and bonds, using momentum, growth and value factors.',
      '15% annualised return with a 10% maximum drawdown in backtests.',
      'Built the ML pipelines end to end: feature engineering, hyperparameter optimisation, and the validation around them.',
      'The real lesson was the opposite of the number. It is very easy to produce a backtest that looks brilliant and means nothing, and most of my time went into making sure ours did not.',
    ],
    took: 'A good backtest is not a promise: honest validation matters more than the number.',
  },
  {
    area: 'edu', year: 2024, date: 'Sep 2024 – Jun 2025', place: 'Paris',
    title: 'A third degree, in economics',
    line: 'Applied Economics at Université Paris Dauphine-PSL, at the same time as the engineering degree, in a subject I had never studied.',
    facts: [
      'Grande École track: macroeconomics, international economics, quantitative economics and decision-making under uncertainty.',
      'Two degrees at once in two institutions, in my third language. The timetables did not always agree with each other.',
      'I took it because engineering kept answering “how” and I wanted somewhere that asked “whether”. That question turns out to matter a lot in machine learning too.',
    ],
    took: 'Engineering teaches you how to build a model. Economics asks whether it is worth building.',
    img: '/img/dauphine.jpg',
  },
  {
    area: 'research', year: 2025, date: 'Jan – Jun 2025', place: 'IBM France Lab',
    title: 'LLMs that follow rules',
    line: 'Can a language model be trusted to apply a complex set of business rules, the kind a human expert applies by hand? I built five different systems to find out which design actually works.',
    facts: [
      'Benchmarked five architectures on real policy-compliance decisions for more than 200 client cases: batch, iterative, few-shot, chain-of-thought and retrieval-augmented generation.',
      'The retrieval system used dense sentence-transformer embeddings with a TF-IDF fallback, plus leakage-safe neighbour exclusion so a case could never retrieve itself and look artificially good.',
      'Exact match went from 46% to 91%, and 0.89 F1 on domain question answering. Built with LangChain and watsonx.ai.',
      'The interesting result was that the best model was not the one with the most context. Feeding it more made it worse. What mattered was the structure of the pipeline around it.',
    ],
    took: 'More context is not more reasoning. The design of the pipeline matters more than the model.',
  },
  {
    area: 'research', year: 2025, date: 'Jan – Aug 2025', place: 'Bachelor thesis',
    title: 'Learning without sharing data',
    line: 'My bachelor thesis: a platform, built from scratch, that lets competing industrial companies train one model together without any of them handing over their data.',
    facts: [
      'Federated learning means the data never moves. Each company trains on its own machines and only the model updates are shared. The hard part is that everyone’s data looks different, which pulls the shared model apart.',
      'A five-layer platform in Python and FastAPI, with 15 heterogeneous clients standing in for aerospace, automotive and chemical companies.',
      'Benchmarked FedAvg, FedProx and SCAFFOLD under non-IID data. SCAFFOLD gave 9% better accuracy and converged 40% faster.',
      'Added differential privacy with Gaussian and Laplace mechanisms, so that even the shared updates cannot be reverse-engineered back into someone’s data.',
      'Most of the eight months went on debugging behaviour that looked like a model problem and turned out to be a data distribution problem.',
    ],
    took: 'In complex systems the problem is rarely where you think it is. Look for the cause, not the symptom.',
  },
  {
    area: 'industry', year: 2025, date: 'Jun – Aug 2025', place: 'Madrid',
    title: 'Amazon Web Services',
    line: 'GenAI engineering intern. I built an end-to-end generative-AI system that handles support tickets in the AWS Partner Network, and it is used every day.',
    facts: [
      'More than 5,000 tickets a month go through it. First-attempt accuracy went from 75% to 85%.',
      'Built on Bedrock, Lambda and LangChain, retrieving from 30+ internal documents and 10,000+ past tickets. A person is always in the loop before anything reaches a partner.',
      'Handling time per ticket dropped from about four minutes to thirty seconds, and I cut inference latency by 15% through prompt and workflow optimisation.',
      'Certified as AWS Cloud Practitioner and AWS AI Practitioner during the internship.',
      'The thing I am proudest of is not the accuracy number. It is that the team kept using it after I left.',
    ],
    took: 'Useful AI is the AI people choose to use every day.',
    img: '/img/aws.jpg',
    photos: ['/img/aws2.jpg'],
  },
  {
    area: 'edu', year: 2025, date: 'Sep 2025 – Jun 2027', place: 'Madrid',
    title: 'A double master’s in engineering and AI',
    line: 'Two master’s degrees at once at ICAI: Industrial Engineering, and Intelligent Industry, which is machine learning and AI applied to industrial data.',
    facts: [
      'Machine learning, deep learning, statistics, optimisation, algorithms, robotics and cloud computing.',
      'The industrial half keeps the AI half honest. It is one thing to improve a metric on a benchmark and another to put a model next to a machine that costs money when it stops.',
      'Graduating in June 2027.',
    ],
    took: 'Every day the world produces more data. Learning to use it well felt essential.',
  },
  {
    area: 'research', year: 2025, date: 'October 2025', place: 'Kearney & CAF',
    title: 'First place in 48 hours',
    line: 'Smart Industry Hackathon with Kearney and CAF, the train manufacturer. We built CAFFY, an assistant that tells a maintenance technician which component has failed, and won.',
    facts: [
      'The problem is real: a train comes in with a fault described in free text by whoever wrote the note, and finding the component means reading through years of similar notes.',
      'I led the team. We used BERT embeddings and logistic regression on the maintenance notes to predict the faulty component, which reached 80% top-3 accuracy.',
      'Voice and text input through Google Speech, because a technician with both hands inside a train cannot type.',
      'A FastAPI backend and a web interface, shipped and demoed in under 48 hours. We visited the CAF factory to see the trains we were writing about.',
      'We did not win with the most sophisticated model. We won with the one that a technician could actually use on the workshop floor.',
    ],
    took: 'The most useful model won, not the most complex one.',
    img: '/img/hackathon_kearney.jpg',
    photos: ['/img/presentacion_hackathon.jpg', '/img/visita_caf.jpg'],
  },
  {
    area: 'research', year: 2026, date: 'Jan 2026 – now', place: 'ICAI, Madrid',
    title: 'Seeing inside a tooth',
    line: 'My master’s thesis at ICAI: deep learning that finds the root canals inside a 3D dental scan and measures their shape, so that an endodontist can plan the treatment before touching the tooth.',
    facts: [
      'Full title: “Automatic segmentation and three-dimensional geometric characterisation of root canals in molars using deep learning to support endodontic planning”.',
      'The anatomy of the root canals is one of the main things that decides whether a root canal treatment succeeds. Knowing the diameter, curvature, length and cross-section in advance tells the specialist which instruments and which strategy to use.',
      'Three stages on cone-beam CT scans: locate and crop the tooth automatically, segment the canals in 3D, then rebuild the internal anatomy and compute the geometry from it.',
      '3D U-Net and Attention U-Net with Dice loss. Fewer than 1% of the voxels in a scan are canal, so a model that predicts “nothing here” everywhere is 99% accurate and completely useless.',
      'Before any of that, a data-validation pipeline over 800 patients’ DICOM scans, focused on first molars, comparing automatic annotations against expert ones. Mean Dice of 0.70, and a list of corrupted and misaligned volumes that should never reach the model.',
      'Supervised by my director at ICAI, with endodontics specialists from Universidad Complutense de Madrid.',
    ],
    took: 'With data this imbalanced, a comfortable metric can lie.',
  },
  {
    area: 'research', year: 2026, date: 'Jun – Aug 2026', place: 'Montréal, Canada',
    title: 'IRIC, Université de Montréal',
    line: 'Research intern at the Institute for Research in Immunology and Cancer, screening billions of molecules for a safer anaesthetic. First author of the paper that came out of it.',
    facts: [
      'General anaesthetics have a narrow margin: the dose that puts you under sits close to the dose that stops you breathing. That is why an anaesthetist watches you the whole time. A drug with a wider margin would matter most exactly where no specialist is available.',
      'I trained a directed message-passing neural network (Chemprop) on 47,348 compounds scored by zebrafish behaviour, then ran it over the whole ZINC22 lead-like library, 43.6 billion molecules, on a SLURM cluster. It returned 1,043,322 hits, two thirds of them chemically far from anything it had seen in training.',
      'A second in-house model, multi-task over 26 ADMET endpoints and 370,450 molecules, filtered those for developability. Instead of reporting one accuracy number, I mapped its reliability against how far a molecule sits from its own training data, because that is the number that actually matters at this scale.',
      'A Pareto search balancing predicted quality against structural novelty picked the final 1,000 compounds: mean desirability 0.65 against 0.12 for random library members, a 5.6x lift. Around 100 are going forward for synthesis.',
      'Median ROC-AUC 0.86 for hERG and 0.78 for the blood-brain barrier under cluster splits, which is the strict test, not the flattering one.',
      '“Phenotypic billion-scale virtual screening for wider-margin anaesthetics with developability-aware Pareto selection”, with Khadija Gana, Matthew McCarroll and Olivier Mailhot. Manuscript in preparation. I presented the work at the PandemicStop-AI conference at Mila.',
    ],
    took: 'Scaling up is a scientific problem, not just a compute problem. A model is only as good as the honest account of where it stops working.',
    link: 'https://github.com/ClaudiaAgromayor/zebrafish-anesthetic-chemprop',
    linkLabel: 'The code on GitHub ↗',
    img: '/img/olivier_lab.jpg',
    photos: ['/img/montreal_office.jpg'],
  },
  {
    area: 'research', year: 2026, date: 'September 2026', place: 'HackSpain, Madrid',
    title: 'A kill switch for AI agents',
    line: 'HackSpain 2026: 250 builders, 36 hours, and HappyRobot’s challenge on handling crises with AI agents. We built AngryRobot, which decides when an agent should be stopped.',
    facts: [
      'The question behind it: what do you do when an AI agent goes wrong? Not in theory, but while it is running and taking actions on your behalf.',
      'We built an environment where agents fail on purpose. They misunderstand the objective, break their constraints, quietly expand their own scope, or lie about what they did.',
      'AngryRobot watches them in layers: deterministic safety checks, loop detection, an independent LLM judge, and our own Agent Risk Index that decides whether an agent should continue, raise a warning, call a human, or be shut down.',
      'During the simulations our rogue agents were making real phone calls, which is a very effective way to understand why this matters.',
      'Built in 36 hours with Daniel, Luis and Hugo, at an event run by The Exponential Fellowship.',
    ],
    took: 'Everyone is busy making agents more capable. Someone has to work out how you stop one.',
    link: 'https://github.com/Hugongra/HackSpainTeam',
    linkLabel: 'The code on GitHub ↗',
    img: '/img/hacskapain.jpg',
    photos: ['/img/hackspain2.jpg'],
  },
  {
    // CHECK before showing: the acceptance letter is signed (16 June 2026). Confirm the award.
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
  role: '2nd-year double master’s student in Industrial Engineering & Computer Science',
  places: 'Madrid · Paris · Montréal',
  intro: 'I go where',
  introEm: 'the problem is.',
  sub: 'A life in chapters, from the gymnastics mat and a TikTok account to machine-learning research.',
  next: 'Seeking an AI research internship from March 2027.',
  email: 'clauuagromayor@gmail.com',
  linkedin: 'https://linkedin.com/in/claudia-agromayor',
  github: 'https://github.com/ClaudiaAgromayor',
}

// Once you have a 3D model, drop it in /public and set e.g. '/avatar.glb'.
// While null, the site uses the abstract statue.
export const AVATAR_URL = null
