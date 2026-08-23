import axios from 'axios';

async function main() {
  try {
    const res = await axios.get('http://localhost:5000/api/courses');
    const courses = res.data?.data?.courses || [];
    
    console.log(`Found ${courses.length} courses from API`);
    const python = courses.find((c: any) => c.slug === 'python-through-oops');
    if (!python) {
      console.log('Python course not found in API response!');
      process.exit(1);
    }
    
    console.log(`Python course ID: ${python.id}`);
    console.log(`Python course Title: ${python.title}`);
    console.log(`Python course status: ${python.status}`);
    
    const modules = python.modules || [];
    console.log(`Modules count: ${modules.length}`);
    if (modules.length > 0) {
      const m1 = modules[0];
      console.log(`Module 1 Title: ${m1.title}`);
      const t1 = m1.topics?.[0];
      console.log(`  Topic 1 Title: ${t1?.title}`);
      const u1 = t1?.learningUnits?.[0];
      console.log(`    Unit 1 Title: ${u1?.title}`);
      console.log(`    Unit keys: ${Object.keys(u1 || {})}`);
      console.log(`    Unit readingContent length: ${u1?.readingContent?.length}`);
    }
  } catch (err: any) {
    console.error('API request failed:', err.message);
  }
  process.exit(0);
}

main();
