// ─────────────────────────────────────────────────────────────
//  SITE CONTENT: edit here.
//  One object per chapter, in chronological order.
//  Written from Claudia's CVs, cover letters, scholarship letters and
//  interview notes. Every number comes from those documents.
//  · area: 'sport' | 'adventure' | 'edu' | 'community' | 'research' | 'industry'  (see AREAS)
//  · facts: what you did (short lines, with numbers)
//  · img, photos: the pictures, shown as a row inside the chapter when you open it
//  · video: a YouTube id, shown as a still that plays when clicked
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
      'Two passports, three languages at home, relatives on three continents. Family lunches taught me that the same story can be told several ways and all of them be true.',
      'Spanish, French and English (Cambridge C1). I think in whichever one the problem is easiest in.',
    ],
  },
  {
    area: 'sport', year: 2013, date: 'May 2013', place: 'Barcelona',
    title: 'Fifth in the world',
    line: 'Ten years of gymnastics, and one routine I still remember minute by minute: fifth in the world in Barcelona with Boadilla’s junior aesthetic group team.',
    facts: [
      'Twelve girls aged 8 to 10, one routine, and teams from Finland, Italy and a dozen other countries on the same floor. We were the youngest in our category.',
      'Training six days a week, before and after school, for ten years. You repeat a movement a thousand times so that on the day it happens without you.',
    ],
    img: '/img/gimnasia-2013.jpg',
    link: 'https://www.ayuntamientoboadilladelmonte.org/boadilla-actualidad/noticias/el-equipo-infantil-de-gimnasia-estetica-de-boadilla-obtiene-el-quinto',
  },
  {
    area: 'edu', year: 2015, date: 'April 2015', place: 'Boadilla del Monte',
    title: 'Maths as a game',
    line: 'First prize at Boadilla’s Maths Gymkhana, against four hundred other students. Maths competitions were what other people did with video games.',
    facts: [
      'Stations across the town, a problem at each one, a clock running, and four hundred students. First prize with my team.',
      'From sixth grade I entered every maths and science competition I could find. Nobody made me. That is the part that mattered later, when the problems got harder and there was no prize at the end.',
    ],
    img: '/img/gymkana-2015.jpg',
    link: 'https://www.ayuntamientoboadilladelmonte.org/boadilla-actualidad/noticias/cuatrocientos-escolares-participan-en-la-ii-gymkana-matematica-de',
  },
  {
    area: 'edu', year: 2021, date: '2018 – 2021', place: 'Boadilla del Monte',
    title: 'Top of the class',
    line: 'High school in technological sciences at Eurocolegio Casvi, finished as best student of my year with a Diploma of Excellence from the Community of Madrid.',
    facts: [
      'Honourable Mention and Diploma of Excellence from the Community of Madrid, and a STEM programme at Universidad Carlos III alongside school.',
      'Two years volunteering: food drives with Cáritas, and afternoons with the residents of a care home through Volant. The part of school I would repeat first.',
    ],
    img: '/img/premio_bachillerato.jpg',
  },
  {
    area: 'industry', year: 2020, date: '2020 – 2023', place: 'Madrid',
    title: 'From 0 to 1,000 on TikTok',
    line: 'My first job, at seventeen: social media and content manager at ICES, which sends Spanish students to spend a high-school year in the United States and Canada.',
    facts: [
      'I was the most junior person in the team. I studied what worked on TikTok, wrote a strategy, and asked the directors for a meeting to pitch it. Nobody had asked me for it.',
      'They said yes. I launched the account, ran it alone, and it passed 1,000 followers in its first month. It is still running, now past 2,300 followers and 38,000 likes.',
      'Three years there, alongside my last year of school and my first years of engineering.',
    ],
    img: '/img/cuenta_ices.jpg',
    photos: ['/img/ices.jpg'],
  },
  {
    area: 'edu', year: 2021, date: 'Sep 2021', place: 'Madrid',
    title: 'Engineering at ICAI',
    line: 'Industrial Engineering at Universidad Pontificia Comillas ICAI, specialising in electrical engineering. I picked it because it was the hardest thing I could get into.',
    facts: [
      'Power systems, signal processing, electronic systems, linear algebra and a surprising amount of organic chemistry.',
      'This is where the double degree with CentraleSupélec started, which is how I ended up in Paris two years later.',
    ],
  },
  {
    area: 'adventure', year: 2022, date: 'Jun – Aug 2022', place: 'Wisconsin, USA',
    title: 'A summer at Lake Wapogasset',
    line: 'Camp counsellor and lifeguard in Wisconsin. Nineteen years old, first time working on my own, seven thousand kilometres from home.',
    facts: [
      'A new group of twelve girls aged 8 to 13 every week. Games, workshops, homesickness at bedtime, and more than one friendship to repair before Friday.',
      'American Red Cross lifeguard. More than ten real rescues in the lake over the summer, and the camp’s “You Rock” award at the end of it.',
      'I arrived with textbook English and left able to calm down a crying eight-year-old at two in the morning, which is a different skill entirely.',
    ],
    img: '/img/camp_counselor.jpg',
    photos: ['/img/camp_counselor2.jpg'],
  },
  {
    area: 'edu', year: 2023, date: 'Sep 2023 – Jun 2025', place: 'Paris',
    title: 'Paris, without a prépa',
    line: 'One of two ICAI students selected for the double degree with CentraleSupélec. Everyone around me had done two years of prépa to get there. I had not, and I was doing it in French.',
    facts: [
      'French engineering schools select through prépa, two years of preparation before you even start. I went straight in from Madrid and spent the first months catching up in a language I was still learning.',
      'It is where I found what drives me: using data to understand systems that already exist. Forecasting electricity demand in a course built with EDF, optimising a wind farm with MPPT control.',
      'Company projects with Safran, modelling air flow through a helicopter engine, and with BCG. Top 10% of the cohort, 9.2/10 over my last two years.',
    ],
  },
  {
    area: 'sport', year: 2023, date: '2023 – 2025', place: 'Paris',
    title: 'Basketball, rowing and surf',
    line: 'Two years of campus life at CentraleSupélec: the French university basketball championship, a 24-hour rowing race, and surf trips to the Atlantic.',
    facts: [
      'Basketball in the French university championship and the Intercentrales, training twice a week around everything else.',
      'HumaAviron: 24 hours of continuous rowing where every kilometre raised one euro for charity. You row, you sleep for an hour, you row again.',
      'Surf weekends in Normandy and Brittany, and running the Spanish club on a campus with 77 nationalities.',
    ],
    img: '/img/championnat_france_basket.jpg',
    photos: ['/img/basket.jpg'],
  },
  {
    area: 'community', year: 2023, date: 'Nov 2023 – Jan 2025', place: 'Paris',
    title: 'Treasurer of France’s largest student forum',
    line: 'Forum CentraleSupélec brings 200 companies and 3,500 students together every year. I ran its finances for fifteen months, in French, my third language.',
    facts: [
      'A €600K budget in a team of 30 students. I led initiatives that grew revenue by 7% to €1.3M and improved the net result by 40%.',
      'I inherited invoicing that did not meet French legal requirements and moved the whole thing to Zoho Billing connected to our CRM, before anyone had to explain it to an auditor.',
      'None of this is glamorous. It is the work that decides whether 3,500 people have an event to come to.',
    ],
    img: '/img/forum.jpg',
    photos: ['/img/forum2.jpg'],
  },
  {
    area: 'industry', year: 2024, date: 'Jun – Aug 2024', place: 'Madrid',
    title: 'Altex Asset Management',
    line: 'Quantitative developer intern, building systematic investment strategies with machine learning on financial time series. I had never studied finance.',
    facts: [
      'Asset-rotation strategies across commodities, indices and bonds using momentum, growth and value factors: 15% annualised return with a 10% maximum drawdown in backtests.',
      'It is very easy to produce a backtest that looks brilliant and means nothing. Most of my summer went into making sure ours did not.',
    ],
  },
  {
    area: 'edu', year: 2024, date: 'Sep 2024 – Jun 2025', place: 'Paris',
    title: 'A third degree, in economics',
    line: 'Applied Economics at Université Paris Dauphine-PSL, at the same time as the engineering degree, in a subject I had never studied.',
    facts: [
      'Selected for the Grande École track: 7 students out of 1,500 in my year. Macroeconomics, quantitative economics and decision-making under uncertainty.',
      'I took it because engineering kept answering “how” and I wanted somewhere that asked “whether”. That question turns out to matter a lot in machine learning too.',
    ],
    img: '/img/dauphine.jpg',
  },
  {
    area: 'research', year: 2025, date: 'Jan – Jun 2025', place: 'IBM France Lab',
    title: 'LLMs that follow rules',
    line: 'Can a language model be trusted to apply a complex set of business rules, the kind a human expert applies by hand? I built five different systems to find out which design actually works.',
    facts: [
      'Five architectures benchmarked on real policy-compliance decisions for 200+ client cases: batch, iterative, few-shot, chain-of-thought and retrieval-augmented generation.',
      'Exact match went from 46% to 91%, with 0.89 F1 on domain question answering, using dense embeddings with a TF-IDF fallback and leakage-safe neighbour exclusion.',
      'The interesting result: the best system was not the one with the most context. Feeding it more made it worse. The structure of the pipeline mattered more than the model.',
    ],
  },
  {
    area: 'research', year: 2025, date: 'Jan – Aug 2025', place: 'Bachelor thesis',
    title: 'Learning without sharing data',
    line: 'My bachelor thesis: a platform that lets competing industrial companies train one model together without any of them handing over their data.',
    facts: [
      'In federated learning the data never moves. Each company trains on its own machines and only the model updates are shared. The hard part is that everyone’s data looks different, which pulls the shared model apart.',
      'A five-layer platform in Python and FastAPI with 15 heterogeneous clients. SCAFFOLD gave 9% better accuracy and converged 40% faster than the alternatives, with differential privacy on top.',
      'Most of the eight months went on debugging behaviour that looked like a model problem and turned out to be a data distribution problem.',
    ],
  },
  {
    area: 'industry', year: 2025, date: 'Jun – Aug 2025', place: 'Madrid',
    title: 'Amazon Web Services',
    line: 'GenAI engineering intern. I built an end-to-end generative-AI system for support tickets in the AWS Partner Network, and it is used every day.',
    facts: [
      'More than 5,000 tickets a month. First-attempt accuracy from 75% to 85%, handling time from about four minutes to thirty seconds.',
      'Bedrock, Lambda and LangChain, retrieving from 30+ internal documents and 10,000+ past tickets, with a person always in the loop before anything reaches a partner.',
      'What I am proudest of is not the accuracy. It is that the team kept using it after I left.',
    ],
    img: '/img/aws.jpg',
    photos: ['/img/aws2.jpg'],
  },
  {
    area: 'edu', year: 2025, date: 'Sep 2025 – Jun 2027', place: 'Madrid',
    title: 'A double master’s in engineering and AI',
    line: 'Two master’s degrees at once at ICAI: Industrial Engineering, and Intelligent Industry, which is machine learning applied to industrial data.',
    facts: [
      'Machine learning, deep learning, statistics, optimisation, robotics and cloud computing.',
      'The industrial half keeps the AI half honest. Improving a metric on a benchmark is one thing. Putting a model next to a machine that costs money when it stops is another.',
    ],
  },
  {
    area: 'research', year: 2025, date: 'October 2025', place: 'Kearney & CAF',
    title: 'First place in 48 hours',
    line: 'Smart Industry Hackathon with Kearney and CAF, the train manufacturer. We built CAFFY, an assistant that tells a maintenance technician which component has failed. We won.',
    facts: [
      'A train comes in with a fault described in free text by whoever wrote the note. Finding the component means reading years of similar notes.',
      'I led the team. BERT embeddings and logistic regression on the maintenance notes reached 80% top-3 accuracy, with voice input because a technician with both hands inside a train cannot type.',
      'We did not win with the most sophisticated model. We won with the one a technician could use on the workshop floor.',
    ],
    img: '/img/hackathon_kearney.jpg',
    photos: ['/img/presentacion_hackathon.jpg', '/img/visita_caf.jpg'],
  },
  {
    area: 'research', year: 2026, date: 'Jan 2026 – now', place: 'ICAI, Madrid',
    title: 'Seeing inside a tooth',
    line: 'My master’s thesis at ICAI: deep learning that finds the root canals inside a 3D dental scan and measures their shape, so an endodontist can plan the treatment before touching the tooth.',
    facts: [
      'Three stages on cone-beam CT scans: locate and crop the tooth, segment the canals in 3D, then rebuild the anatomy and measure its diameter, curvature, length and cross-section.',
      '3D U-Net and Attention U-Net with Dice loss. Fewer than 1% of the voxels in a scan are canal, so a model that predicts “nothing here” everywhere is 99% accurate and completely useless.',
      'Supervised by my director at ICAI, with endodontics specialists from Universidad Complutense de Madrid.',
    ],
  },
  {
    area: 'edu', year: 2026, date: 'June 2026', place: 'Madrid',
    title: 'One of eight in Spain',
    line: 'The Iberdrola Master’s Scholarship for 2026 and 2027. Thousands of people applied. Eight of us were chosen.',
    facts: [
      'Months of selection: CV and academic screening, mathematics and logic tests, an English assessment, a presentation, and interviews in front of twenty senior executives.',
      'It did not only test marks. It tested how you think out loud, and how you hold up when someone keeps asking why.',
    ],
  },
  {
    area: 'research', year: 2026, date: 'Jun – Aug 2026', place: 'Montréal, Canada',
    title: 'IRIC, Université de Montréal',
    line: 'Research intern at the Institute for Research in Immunology and Cancer, screening billions of molecules for a safer anaesthetic. First author of the paper that came out of it.',
    facts: [
      'General anaesthetics have a narrow margin: the dose that puts you under sits close to the dose that stops you breathing. That is why an anaesthetist watches you the whole time. A wider margin would matter most where no specialist is available.',
      'I trained a message-passing neural network on 47,348 compounds scored by zebrafish behaviour, ran it over all 43.6 billion molecules of the ZINC22 library on a SLURM cluster, then filtered for developability and picked 1,000 compounds with a Pareto search on quality and novelty. About 100 are going forward for synthesis.',
      'I arrived with a background in neural networks and very little in biology, and had two months to learn the science, pose the problem and come out with molecules a lab could order. My supervisor asked me to present it at the PandemicStop-AI conference at Mila. It led to a PhD offer.',
    ],
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
      'The brief was “how could agents help during a crisis?”. I turned it around: what if the agent escapes its environment and causes the crisis?',
      'We built an environment where agents fail on purpose. They misunderstand the objective, break their constraints, quietly expand their scope, or lie about what they did.',
      'AngryRobot watches them in layers: deterministic safety checks, loop detection, an independent LLM judge, and our Agent Risk Index, which decides whether an agent continues, raises a warning, calls a human, or is shut down. During the simulations our rogue agents were making real phone calls.',
    ],
    video: 'eaWnMs7NiIE',
    link: 'https://github.com/Hugongra/HackSpainTeam',
    linkLabel: 'The code on GitHub ↗',
    img: '/img/hacskapain.jpg',
    photos: ['/img/hackspain2.jpg'],
  },
]

export const CHAPTERS = ALL.filter((c) => !c.hidden)

export const PROFILE = {
  name: 'Claudia Agromayor',
  born: 2003,
  role: '2nd-year double master’s student in Industrial Engineering & Computer Science',
  places: 'Madrid · Paris · Montréal',
  intro: 'I never optimise',
  introEm: 'for the easy path.',
  sub: 'A life in chapters, from the gymnastics mat and a TikTok account to machine-learning research.',
  next: 'Seeking an AI research internship from March 2027.',
  email: 'clauuagromayor@gmail.com',
  linkedin: 'https://linkedin.com/in/claudia-agromayor',
  github: 'https://github.com/ClaudiaAgromayor',
}

// Once you have a 3D model, drop it in /public and set e.g. '/avatar.glb'.
// While null, the site uses the abstract statue.
export const AVATAR_URL = null
