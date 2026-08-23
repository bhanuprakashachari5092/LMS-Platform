import { db } from '../firebase';

function parseContent(content: string) {
  if (!content) return { objectives: '', concept: '', flowchart: '' };

  const lines = content.split('\n');
  const objectivesLines: string[] = [];
  const flowchartLines: string[] = [];
  const conceptLines: string[] = [];

  let inObjectives = false;
  // A box drawing or arrow character or lines containing explicit "diagram" keyword
  const flowchartChars = /[│┌└─↓├┤┬┴┼┐┘╔╗╚╝═║╠╣╦╩╬▲▼◄►┌┐└┘├┤┬┴┼─]/;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    // Check if it's a flowchart line first
    const hasFlowchartChar = flowchartChars.test(line);
    const isExplicitDiagram = trimmed.toLowerCase().startsWith('diagram');

    if (hasFlowchartChar || isExplicitDiagram) {
      flowchartLines.push(line);
      continue;
    }

    // Detect Objectives block start
    const isObjectivesStart = /learning\s+objective/i.test(trimmed);
    if (isObjectivesStart) {
      inObjectives = true;
      objectivesLines.push(line);
      continue;
    }

    if (inObjectives) {
      // Objectives end when we see a new section heading, e.g. "1.1 Introduction" or "#### 1.2"
      const isNewHeading = trimmed.startsWith('#') || /^\d+\.\d+\s+/.test(trimmed) || /^\d+\.\d+\s*:/.test(trimmed);
      if (isNewHeading) {
        inObjectives = false;
        conceptLines.push(line);
      } else {
        objectivesLines.push(line);
      }
    } else {
      conceptLines.push(line);
    }
  }

  const finalObjectives = objectivesLines.join('\n').trim();
  let finalConcept = conceptLines.join('\n').trim();
  const finalFlowchart = flowchartLines.join('\n').trim();

  if (!finalObjectives && !finalConcept && content.trim()) {
    finalConcept = content.trim();
  }

  return {
    objectives: finalObjectives,
    concept: finalConcept,
    flowchart: finalFlowchart
  };
}

async function main() {
  const courseId = 'python-through-oops-course-id';
  const doc = await db.collection('courses').doc(courseId).get();
  const data = doc.data();
  const m1 = data?.modules?.[0];
  const u1 = m1?.topics?.[0]?.learningUnits?.[0];
  const content = u1?.readingContent || '';

  const { objectives, concept, flowchart } = parseContent(content);
  console.log(`Objectives length: ${objectives.length}`);
  console.log(`Concept length: ${concept.length}`);
  console.log(`Flowchart length: ${flowchart.length}`);
  
  console.log('\n--- Objectives sample ---');
  console.log(objectives.slice(0, 300));
  
  console.log('\n--- Concept sample ---');
  console.log(concept.slice(0, 300));
  
  console.log('\n--- Flowchart sample ---');
  console.log(flowchart.slice(0, 300));
  
  process.exit(0);
}

main();
