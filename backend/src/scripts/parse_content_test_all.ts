import { db } from '../firebase';

// Mimic the LmsCourseRenderer's block parser
function parseLmsBlocks(content: string, courseId: string) {
  const isK8s = courseId === 'kubernetes-complete-course-beginner-to-advanced';
  const isGit = courseId === 'git-github-mastery-course-id' || courseId === 'git-github-mastery';
  const isReact = (courseId || '').toLowerCase().includes('react');

  let cleanContent = content
    .replace(/\r/g, '')
    .trim();

  // Dynamically heal Python Module 1 to skip Page 5 Table of Contents (TOC) index page
  if (!isK8s && !isGit && !isReact && cleanContent.includes('Module') && cleanContent.includes('15:')) {
    const headingMatch = cleanContent.match(/(🐍\s*)?Module\s+1\s*:/i);
    if (headingMatch && headingMatch.index !== undefined) {
      cleanContent = cleanContent.slice(headingMatch.index);
    }
  }

  let lines = cleanContent.split('\n');

  const parsedBlocks: any[] = [];
  let currentCodeLines: string[] = [];
  let currentTextLines: string[] = [];
  let currentFlowchartLines: string[] = [];
  let currentTableLines: string[] = [];
  let currentQuestion: string = '';
  let currentAnswerLines: string[] = [];

  let inCodeBlock = false;
  let codeBuffer: string[] = [];
  let codeLang = '';

  const flushText = () => {
    if (currentTextLines.length > 0) {
      const collapsedText = currentTextLines.join(' ').replace(/\s+/g, ' ').trim();
      if (collapsedText) {
        parsedBlocks.push({ type: 'text', text: collapsedText });
      }
      currentTextLines = [];
    }
  };

  const flushCode = () => {
    if (currentCodeLines.length > 0) {
      parsedBlocks.push({ type: 'code', code: currentCodeLines.join('\n') });
      currentCodeLines = [];
    }
  };

  const flushFlowchart = () => {
    if (currentFlowchartLines.length > 0) {
      parsedBlocks.push({ type: 'flowchart', lines: [...currentFlowchartLines] });
      currentFlowchartLines = [];
    }
  };

  const flushTableBlock = () => {
    if (currentTableLines.length > 0) {
      parsedBlocks.push({ type: 'table', lines: [...currentTableLines] });
      currentTableLines = [];
    }
  };

  const flushQuestionBlock = () => {
    if (currentQuestion) {
      parsedBlocks.push({
        type: 'question',
        question: currentQuestion.trim(),
        answer: currentAnswerLines.join('\n').trim()
      });
      currentQuestion = '';
      currentAnswerLines = [];
    }
  };

  const flushAllAccumulators = () => {
    flushText();
    flushCode();
    flushFlowchart();
    flushTableBlock();
    flushQuestionBlock();
  };

  const isCodeLine = (line: string, isK8s: boolean, isGit: boolean, isReact: boolean = false): boolean => {
    const trimmed = line.trim();
    if (!trimmed) return false;
    
    if (trimmed.startsWith('```')) return false;
    if (trimmed.startsWith('●') || trimmed.startsWith('•') || trimmed.startsWith('- ') || trimmed.startsWith('* ')) return false;
    if (trimmed.startsWith('#')) return false;
    if (/^\d+\.\d+\s+/.test(trimmed)) return false;
    
    if (isReact) {
      const reactCodeSigs = [
        'import ', 'export ', 'const ', 'let ', 'var ', 'function ', 'class ', 'return ',
        'const [', 'useEffect', 'useState', 'useMemo', 'useCallback', '<div', '</div>', '/>',
        'expect(', 'describe(', 'test(', 'npm ', 'npx ', 'yarn ', 'pnpm ',
        '// ', '/*', '*/', 'dispatch(', 'reducer', 'store'
      ];
      if (reactCodeSigs.some(sig => trimmed.startsWith(sig))) return true;
      if (trimmed.includes('=>') && (trimmed.includes('{') || trimmed.includes('('))) return true;
      if (trimmed.includes('className=') || trimmed.includes('style=')) return true;
      return false;
    }
    
    if (isGit) {
      const gitSigs = [
        'git ', 'mkdir ', 'cd ', 'touch ', 'cat ', 'echo ', 'ls ', 'rm ', 'mv ', 'cp ',
        'ssh-keygen', 'chmod ', 'chown ', 'history', 'grep ', 'find ', 'curl ', 'wget ',
        'npm ', 'npx ', 'node ', 'python ', 'pip ', 'docker ', 'docker-compose',
        'kubectl ', 'helm ', 'aws ', 'gcloud ', 'firebase ', 'gh ',
        '// ', '# ', '$ ', '[sudo]', 'sudo '
      ];
      if (gitSigs.some(sig => trimmed.toLowerCase().startsWith(sig))) return true;
      if (trimmed.startsWith('$')) return true;
      return false;
    }
    
    if (isK8s) {
      if (trimmed.startsWith('apiVersion:') || trimmed.startsWith('kind:') || trimmed.startsWith('metadata:') || trimmed.startsWith('spec:') || trimmed.startsWith('containers:')) {
        return true;
      }
      if (trimmed.startsWith('- name:') || trimmed.startsWith('image:') || trimmed.startsWith('ports:') || trimmed.startsWith('selector:')) {
        return true;
      }
      if (trimmed.includes(':') && !trimmed.includes('http') && !trimmed.includes('//') && !trimmed.includes(' ') && trimmed.endsWith(':')) {
        return true;
      }
    }
    
    const generalSigs = [
      'def ', 'class ', 'import ', 'from ', 'print(', 'input(', 'int(', 'float(', 'str(',
      'if ', 'elif ', 'else:', 'for ', 'while ', 'with ', 'try:', 'except ', 'finally:',
      'return ', 'yield ', 'lambda ', 'pass', 'break', 'continue', 'global ', 'nonlocal ',
      'assert ', 'raise ', 'del ', 'in ', 'is ', 'and ', 'or ', 'not ',
      '# ', '// ', '/*', '*/',
      'a = ', 'b = ', 'c = ', 'x = ', 'y = ', 'z = ', 'i = ', 'j = '
    ];
    
    if (generalSigs.some(sig => trimmed.startsWith(sig))) return true;
    if (trimmed.includes('(') && trimmed.includes(')') && (trimmed.includes('def ') || trimmed.includes('print') || trimmed.includes('input') || trimmed.includes('.'))) return true;
    if (trimmed.includes('=') && (trimmed.includes('+') || trimmed.includes('-') || trimmed.includes('*') || trimmed.includes('/') || trimmed.includes('%') || trimmed.includes('**') || trimmed.includes('//'))) return true;
    
    return false;
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    if (trimmed.startsWith('```')) {
      if (inCodeBlock) {
        inCodeBlock = false;
        parsedBlocks.push({ type: 'code', code: codeBuffer.join('\n'), lang: codeLang });
        codeBuffer = [];
        codeLang = '';
      } else {
        inCodeBlock = true;
        codeLang = trimmed.replace('```', '').trim();
      }
      continue;
    }

    if (inCodeBlock) {
      codeBuffer.push(line);
      continue;
    }

    const hasFlowchartChar = /[│┌└─↓├┤┬┴┼┐┘╔╗╚╝═║╠╣╦╩╬▲▼◄►┌┐└┘├┤┬┴┼─]/.test(line);
    const isExplicitDiagram = trimmed.toLowerCase().startsWith('diagram') || trimmed.toLowerCase().startsWith('flowchart:');

    if (hasFlowchartChar || isExplicitDiagram) {
      flushText();
      flushCode();
      flushTableBlock();
      flushQuestionBlock();
      currentFlowchartLines.push(line);
      continue;
    }

    const hasTableChar = trimmed.startsWith('|') || (trimmed.includes('|') && trimmed.length > 5);
    if (hasTableChar && !hasFlowchartChar) {
      flushText();
      flushCode();
      flushFlowchart();
      flushQuestionBlock();
      currentTableLines.push(line);
      continue;
    }

    if (trimmed.toLowerCase().startsWith('answer:') || (currentQuestion && trimmed.toLowerCase().startsWith('ans.'))) {
      flushText();
      flushCode();
      flushFlowchart();
      flushTableBlock();
      currentAnswerLines.push(trimmed.replace(/^(?:answer|ans\.):\s*/i, ''));
      continue;
    }

    if (currentQuestion) {
      const isNextStructural = trimmed.startsWith('#') ||
        (trimmed.toLowerCase().includes('module ') && (trimmed.includes(':') || trimmed.includes('—'))) ||
        /^\d+\.\d+\s+/.test(trimmed) ||
        /^\s*Q\d+\.?\s+/.test(trimmed) ||
        (isK8s && /^\s*(\d+)\.\s+([A-Z].*\?)\s*$/.test(trimmed)) ||
        (isGit && /^\s*(\d+)\.\s+/.test(trimmed)) ||
        (isGit && /^\s*(Task\s+\d+|Scenario\s+\d+|Problem\s+\d+|Program\s+\d+|Step\s+\d+|Question\s+\d+|Q\d+)\b/i.test(trimmed)) ||
        (isGit && trimmed.startsWith('❌')) ||
        trimmed.startsWith('```') ||
        /↓|→|↙|↘/.test(trimmed) ||
        trimmed.includes('|') ||
        (trimmed.includes('│') && trimmed.length > 5) ||
        isCodeLine(trimmed, isK8s, isGit) ||
        trimmed.startsWith('●') || trimmed.startsWith('•') || trimmed.startsWith('- ') || trimmed.startsWith('* ') ||
        trimmed.includes('●') || trimmed.includes('•') ||
        trimmed.toLowerCase().startsWith('mistake ') || trimmed.toLowerCase().startsWith('warning:') || trimmed.toLowerCase().startsWith('note:');

      if (isNextStructural) {
        flushQuestionBlock();
      } else {
        if (currentAnswerLines.length > 0) {
          currentAnswerLines.push(line);
        } else {
          currentQuestion += ' ' + line;
        }
        continue;
      }
    }

    const isCode = isCodeLine(line, isK8s, isGit, isReact);
    if (isCode) {
      flushText();
      flushFlowchart();
      flushTableBlock();
      flushQuestionBlock();
      currentCodeLines.push(line);
      continue;
    }

    if (!trimmed) {
      if (currentQuestion) {
        currentAnswerLines.push('');
      } else {
        let nextNonEmptyLine = '';
        for (let j = i + 1; j < lines.length; j++) {
          const l = lines[j].trim();
          if (l) {
            nextNonEmptyLine = l;
            break;
          }
        }

        const isNextCode = nextNonEmptyLine && isCodeLine(nextNonEmptyLine, isK8s, isGit, isReact);
        
        if (currentCodeLines.length > 0 && isNextCode) {
          currentCodeLines.push('');
        } else {
          const isNextStructural = !nextNonEmptyLine ||
            nextNonEmptyLine.startsWith('#') ||
            (nextNonEmptyLine.toLowerCase().includes('module ') && (nextNonEmptyLine.includes(':') || nextNonEmptyLine.includes('—'))) ||
            /^\d+\.\d+\s+/.test(nextNonEmptyLine) ||
            /^\s*Q\d+\.?\s+/.test(nextNonEmptyLine) ||
            (isK8s && /^\s*(\d+)\.\s+([A-Z].*\?)\s*$/.test(nextNonEmptyLine)) ||
            (isGit && /^\s*(\d+)\.\s+/.test(nextNonEmptyLine)) ||
            (isGit && /^\s*(Task\s+\d+|Scenario\s+\d+|Problem\s+\d+|Program\s+\d+|Step\s+\d+|Question\s+\d+|Q\d+)\b/i.test(nextNonEmptyLine)) ||
            (isGit && nextNonEmptyLine.startsWith('❌')) ||
            nextNonEmptyLine.startsWith('```') ||
            /↓|→|↙|↘/.test(nextNonEmptyLine) ||
            nextNonEmptyLine.includes('|') ||
            (nextNonEmptyLine.includes('│') && nextNonEmptyLine.length > 5) ||
            isCodeLine(nextNonEmptyLine, isK8s, isGit) ||
            nextNonEmptyLine.startsWith('●') || nextNonEmptyLine.startsWith('•') || nextNonEmptyLine.startsWith('- ') || nextNonEmptyLine.startsWith('* ') ||
            nextNonEmptyLine.includes('●') || nextNonEmptyLine.includes('•') ||
            nextNonEmptyLine.toLowerCase().startsWith('mistake ') || nextNonEmptyLine.toLowerCase().startsWith('warning:') || nextNonEmptyLine.toLowerCase().startsWith('note:');

          if (isNextStructural) {
            flushAllAccumulators();
          } else {
            const accumulatedText = currentTextLines.join(' ').trim();
            const endsWithSentence = /[.!?]$/.test(accumulatedText);
            const nextStartsUpper = /^[A-Z]/.test(nextNonEmptyLine);
            
            if (endsWithSentence && nextStartsUpper) {
              flushText();
            }
          }
        }
      }
      continue;
    }

    const isHeading = trimmed.startsWith('#') || (trimmed.toLowerCase().includes('module ') && (trimmed.includes(':') || trimmed.includes('—'))) || (isReact && (trimmed.toLowerCase().startsWith('interview questions') || trimmed.toLowerCase().startsWith('practical exercise') || trimmed.toLowerCase().startsWith('practical lab') || trimmed.toLowerCase().startsWith('real-time scenario') || trimmed.toLowerCase().includes('common mistakes')));
    const isSubheading = /^\d+\.\d+\s+/.test(trimmed);
    const questionMatch = trimmed.match(/^\s*Q(\d+)\.?\s+(.+)$/i);
    const k8sQuestionMatch = isK8s ? trimmed.match(/^\s*(\d+)\.\s+([A-Z].*\?)\s*$/) : null;

    const isBullet = trimmed.startsWith('●') || trimmed.startsWith('•') || trimmed.startsWith('- ') || trimmed.startsWith('* ') || trimmed.startsWith('❌') || trimmed.includes('●') || trimmed.includes('•');

    if (isReact && currentFlowchartLines.length > 0 && trimmed !== '' && !isHeading && !isBullet) {
      currentFlowchartLines.push(line);
      continue;
    }

    let isGitQuestion = false;
    let gitQMatch: RegExpMatchArray | null = null;
    if ((isGit || isReact) && /^\s*(\d+)\.\s+/.test(trimmed)) {
      let hasAnswerLookahead = false;
      for (let look = i + 1; look <= Math.min(i + 3, lines.length - 1); look++) {
        if (lines[look].trim().toLowerCase().startsWith('answer')) {
          hasAnswerLookahead = true;
          break;
        }
      }
      if (hasAnswerLookahead) {
        isGitQuestion = true;
        gitQMatch = trimmed.match(/^\s*(\d+)\.\s+(.+)$/);
      }
    }

    const isGitOrDbmsOrK8s = isGit || isK8s || isReact || courseId === 'database-management-system' || courseId === 'c-programming-course-id';
    const isNumericList = (isGit || isReact) ? /^\s*\d+\.\s+/.test(trimmed) : (isGitOrDbmsOrK8s && /^\s*\d+\.\s+[A-Z\u00C0-\u00FF]/.test(trimmed));
    const isTaskLine = isGitOrDbmsOrK8s && /^\s*(Task\s+\d+|Scenario\s+\d+|Problem\s+\d+|Program\s+\d+|Step\s+\d+|Question\s+\d+|Q\d+)\b/i.test(trimmed);
    const isMistakeLine = (isGit || isReact) && trimmed.startsWith('❌');

    if (isGitOrDbmsOrK8s && (isNumericList || isTaskLine || isMistakeLine) && !isGitQuestion) {
      flushAllAccumulators();
      parsedBlocks.push({ type: 'text', text: trimmed });
      continue;
    }

    if (isHeading || isSubheading || questionMatch || k8sQuestionMatch || isGitQuestion) {
      flushAllAccumulators();

      if (isHeading) {
        const headerText = trimmed.replace(/^#+\s*/, '').replace(/\s*#+$/, '').trim();
        parsedBlocks.push({ type: 'heading', text: headerText, level: trimmed.startsWith('#') ? trimmed.match(/^#+/)?.[0].length || 1 : 1 });
      } else if (isSubheading) {
        parsedBlocks.push({ type: 'subheading', text: trimmed });
      } else if (questionMatch) {
        currentQuestion = questionMatch[2];
      } else if (k8sQuestionMatch) {
        currentQuestion = k8sQuestionMatch[2];
      } else if (isGitQuestion && gitQMatch) {
        currentQuestion = gitQMatch[2];
      }
      continue;
    }

    if (isBullet) {
      flushAllAccumulators();
      const isCross = trimmed.startsWith('❌');
      if (trimmed.includes('●') && !trimmed.startsWith('●')) {
        const items = trimmed.split('●').map(x => x.trim()).filter(Boolean);
        for (const item of items) {
          parsedBlocks.push({ type: 'bullet', text: item, isCross: false });
        }
      } else {
        parsedBlocks.push({ type: 'bullet', text: trimmed.replace(/^[-*•●❌]\s*/, ''), isCross });
      }
      continue;
    }

    const isNote = trimmed.toLowerCase().startsWith('note:') || trimmed.toLowerCase().startsWith('warning:') || trimmed.toLowerCase().startsWith('mistake:') || trimmed.toLowerCase().startsWith('important:');
    if (isNote) {
      flushAllAccumulators();
      parsedBlocks.push({ type: 'note', text: trimmed });
      continue;
    }

    const isExampleLabel = trimmed.toLowerCase().startsWith('example ') || trimmed.toLowerCase().startsWith('example:') || trimmed.toLowerCase().startsWith('program ') || trimmed.toLowerCase().startsWith('program:') || trimmed.toLowerCase().startsWith('coding problem:') || trimmed.toLowerCase().startsWith('output prediction:');
    if (isExampleLabel) {
      flushAllAccumulators();
      parsedBlocks.push({ type: 'example', text: trimmed });
      continue;
    }

    flushCode();
    flushFlowchart();
    flushTableBlock();
    flushQuestionBlock();
    currentTextLines.push(trimmed);
  }

  if (inCodeBlock && codeBuffer.length > 0) {
    parsedBlocks.push({ type: 'code', code: codeBuffer.join('\n'), lang: codeLang });
  }
  flushAllAccumulators();

  const groupedBlocks: any[] = [];
  let currentExampleBlock: any = null;

  for (const block of parsedBlocks) {
    if (block.type === 'example') {
      currentExampleBlock = {
        ...block,
        children: []
      };
      groupedBlocks.push(currentExampleBlock);
    } else if (currentExampleBlock) {
      const isBoundary = block.type === 'heading' || block.type === 'subheading' || block.type === 'question';
      if (isBoundary) {
        currentExampleBlock = null;
        groupedBlocks.push(block);
      } else {
        currentExampleBlock.children.push(block);
      }
    } else {
      groupedBlocks.push(block);
    }
  }

  return groupedBlocks;
}

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
  const modules = data?.modules || [];
  
  console.log(`Diagnosing all ${modules.length} modules for Python course...`);
  
  for (let idx = 0; idx < modules.length; idx++) {
    const mod = modules[idx];
    const unit = mod.topics?.[0]?.learningUnits?.[0];
    const content = unit?.readingContent || '';
    
    const { objectives, concept, flowchart } = parseContent(content);
    const blocks = parseLmsBlocks(concept, courseId);
    
    console.log(`Module ${idx+1}: "${mod.title}" -> Concept Len: ${concept.length}, Flowchart Len: ${flowchart.length}, parsed blocks count: ${blocks.length}`);
  }
  
  process.exit(0);
}

main();
