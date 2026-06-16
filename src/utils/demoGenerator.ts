import type { Experiment } from '../types';

type DemoExperiment = Omit<Experiment, 'id' | 'createdAt' | 'updatedAt'>;

const scenarios = [
  { tool: 'ChatGPT', cat: 'Correspondentie', task: 'Schrijven van een wervende vacaturetekst voor een nieuwe projectleider HVAC.', tV: 60, tM: 15, qual: 4, corr: true },
  { tool: 'Claude', cat: 'Offerte', task: 'Samenvatten van een 50-pagina tellend lastenboek voor een openbare aanbesteding.', tV: 240, tM: 30, qual: 5, corr: false },
  { tool: 'Copilot', cat: 'Calculatie', task: 'Python script schrijven voor automatische extractie van meetstaten uit Excel.', tV: 180, tM: 45, qual: 4, corr: true },
  { tool: 'Gemini', cat: 'Rapportage', task: 'Analyseren van veiligheidsincidenten van het kwartaal om ongeval-trends te spotten.', tV: 120, tM: 40, qual: 3, corr: true },
  { tool: 'Claude', cat: 'Vertaling NL/FR', task: 'Vertalen van VCA-veiligheidsvoorschriften van NL naar FR en EN voor de werf.', tV: 90, tM: 15, qual: 5, corr: false },
  { tool: 'ChatGPT', cat: 'Planning', task: 'Bedenken van alternatieve funderingstechnieken voor slappe ondergrond in de stad.', tV: 45, tM: 15, qual: 4, corr: false },
  { tool: 'Copilot', cat: 'Werfverslag', task: 'Opstellen van de maandelijkse project-voortgangsrapportage voor de bouwheer.', tV: 120, tM: 60, qual: 4, corr: true },
  { tool: 'Gemini', cat: 'Andere', task: 'Genereren van conceptuele sfeerbeelden voor het kantoorontwerp pitch.', tV: 60, tM: 80, qual: 4, corr: true },
  { tool: 'Claude', cat: 'Veiligheidsdocument', task: 'Vergelijken van twee versies van een contractbijlage op verborgen juridische risico\'s.', tV: 180, tM: 40, qual: 5, corr: false },
  { tool: 'Gemini', cat: 'Werfverslag', task: 'Notulen maken op basis van de transcriptie van de wekelijkse werfvergadering.', tV: 60, tM: 15, qual: 4, corr: true },
  { tool: 'ChatGPT', cat: 'Calculatie', task: 'Excel macro (VBA) schrijven om facturen automatisch te matchen met bestelbonnen.', tV: 240, tM: 60, qual: 5, corr: false },
  { tool: 'Copilot', cat: 'Rapportage', task: 'Structuur en slides opzetten voor de kick-off meeting van het ziekenhuisproject.', tV: 120, tM: 45, qual: 3, corr: true },
  { tool: 'Claude', cat: 'Vertaling NL/FR', task: 'Snel vertalen van een complexe e-mail van een onderaannemer uit Polen.', tV: 15, tM: 2, qual: 5, corr: false },
  { tool: 'ChatGPT', cat: 'Correspondentie', task: 'Draften van een formele ingebrekestelling naar een leverancier wegens vertraging.', tV: 45, tM: 10, qual: 4, corr: true },
  { tool: 'Claude', cat: 'Veiligheidsdocument', task: 'Synthese maken van de nieuwe ISO 14001 milieu-eisen voor interne communicatie.', tV: 120, tM: 30, qual: 5, corr: false },
  { tool: 'Gemini', cat: 'Andere', task: 'Ideeën bedenken voor een teambuilding activiteit voor 50 ingenieurs.', tV: 30, tM: 10, qual: 4, corr: false },
  { tool: 'Copilot', cat: 'Planning', task: 'SQL query optimaliseren voor het sneller laden van het ERP dashboard.', tV: 90, tM: 20, qual: 4, corr: true },
  { tool: 'Gemini', cat: 'Andere', task: 'Visualisatie maken van een gevel met gerecycleerde materialen.', tV: 45, tM: 50, qual: 3, corr: true },
  { tool: 'ChatGPT', cat: 'Correspondentie', task: 'Uithalen van de belangrijkste actiepunten uit een 20-tal e-mails van de bouwheer.', tV: 90, tM: 15, qual: 4, corr: true },
  { tool: 'Claude', cat: 'Correspondentie', task: 'Schrijven van een blogpost voor LinkedIn over onze duurzaamheidsdoelen.', tV: 60, tM: 20, qual: 5, corr: false }
];

const entiteiten = ['CFE', 'VMA', 'Mobix', 'MBG', 'Van Laere', 'BPC', 'BPI', 'Wood Shapers'];
const voornamen = ['Jan', 'Marie', 'Pieter', 'Sophie', 'Tom', 'Laura', 'Kevin', 'An', 'Wouter', 'Sarah', 'Klaas', 'Emma', 'Lukas', 'Julie', 'Bart'];
const achternamen = ['Peeters', 'Janssens', 'Maes', 'Jacobs', 'Mertens', 'Willems', 'Claes', 'Goossens', 'Wouters', 'De Smet'];

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomChoice<T>(arr: T[]): T {
  return arr[randomInt(0, arr.length - 1)];
}

export function generateDemoData(count: number = 50): DemoExperiment[] {
  const result: DemoExperiment[] = [];
  
  for (let i = 0; i < count; i++) {
    const sc = randomChoice(scenarios);
    const medewerker = `${randomChoice(voornamen)} ${randomChoice(achternamen)}`;
    const entiteit = randomChoice(entiteiten);
    
    const variationVoor = randomInt(-10, 20);
    let tV = Math.max(5, sc.tV + variationVoor);
    
    const variationMet = randomInt(-5, 10);
    let tM = Math.max(1, sc.tM + variationMet);

    let freq = randomInt(1, 5);
    let freqEenheid: 'dag' | 'week' | 'maand' = 'week';
    if (tV > 120) {
      freqEenheid = 'maand';
      freq = randomInt(1, 3);
    } else if (tV < 30) {
      freqEenheid = 'dag';
      freq = randomInt(1, 4);
    } else {
      freqEenheid = randomChoice(['week', 'maand']);
    }

    result.push({
      medewerker,
      entiteit,
      aiTool: sc.tool,
      taakomschrijving: sc.task,
      taakcategorie: sc.cat,
      kwaliteitScore: sc.qual,
      correctieNodig: sc.corr,
      verderGebruiken: sc.qual >= 4,
      vertrouwen: sc.qual,
      frequentie: freq,
      frequentieEenheid: freqEenheid,
      tijdVoor: tV,
      tijdMet: tM,
      minderFouten: sc.qual >= 4,
      nieuwWerkMogelijk: Math.random() > 0.6,
      meertijdVoorAnalyse: Math.random() > 0.4,
      gewonnenTijdTekst: '',
      besteprompt: '',
      gevoeligeData: Math.random() > 0.8,
    });
  }
  
  return result;
}
