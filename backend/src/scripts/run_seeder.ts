import { CourseService } from '../services/course/CourseService';

async function run() {
  console.log('Starting manual database seeding...');
  const courseService = new CourseService();
  try {
    await courseService.seedSampleCourses();
    console.log('Manual seeding completed successfully!');
    process.exit(0);
  } catch (err) {
    console.error('Error during manual seeding:', err);
    process.exit(1);
  }
}

run();
