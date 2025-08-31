import { PrismaClient } from '../src/generated/prisma';

const prisma = new PrismaClient();

async function main() {
  // Xóa dữ liệu cũ để đảm bảo seed sạch
  await prisma.candidate.deleteMany();
  await prisma.job.deleteMany();

  // Seed 3 Jobs
  await prisma.job.createMany({
    data: [
      {
        title: 'Frontend Developer',
        description: 'Develop and maintain web applications using modern JavaScript frameworks.',
        requirements: '3+ years experience with JavaScript, TypeScript, React, or Vue.js; Familiarity with REST APIs and GraphQL; Strong understanding of responsive design.',
      },
      {
        title: 'Data Scientist',
        description: 'Analyze large datasets to provide actionable insights for business growth.',
        requirements: '2+ years experience with Python, R, SQL; Knowledge of machine learning algorithms; Experience with data visualization tools like Tableau or Power BI.',
      },
      {
        title: 'DevOps Engineer',
        description: 'Manage CI/CD pipelines and cloud infrastructure for scalable applications.',
        requirements: '3+ years experience with AWS/GCP/Azure, Docker, Kubernetes, and CI/CD tools like Jenkins or GitLab.',
      },
    ],
  });

  // Seed 5 Candidates
  await prisma.candidate.createMany({
    data: [
      {
        full_name: 'Nguyen Van An',
        email: 'an.nguyen@example.com',
        birthdate: new Date('1995-03-15'),
        gender: 'Male',
        experience: 4,
        skills: ['JavaScript', 'React', 'TypeScript', 'Node.js'],
        address: '123 Le Loi, Ho Chi Minh City, Vietnam',
        fit_score: 85.5,
        strengths: ['Strong problem-solving skills', 'Proficient in modern JS frameworks'],
        weaknesses: ['Limited experience with backend development'],
      },
      {
        full_name: 'Tran Thi Bich',
        email: 'bich.tran@example.com',
        birthdate: new Date('1993-07-22'),
        gender: 'Female',
        experience: 3,
        skills: ['Python', 'SQL', 'Tableau', 'Machine Learning'],
        address: '456 Tran Hung Dao, Hanoi, Vietnam',
        fit_score: 78.0,
        strengths: ['Excellent data analysis', 'Good communication skills'],
        weaknesses: ['Less experience in big data frameworks'],
      },
      {
        full_name: 'Le Minh Chau',
        email: 'chau.le@example.com',
        birthdate: new Date('1990-11-10'),
        gender: 'Male',
        experience: 5,
        skills: ['AWS', 'Docker', 'Kubernetes', 'Jenkins'],
        address: '789 Nguyen Trai, Da Nang, Vietnam',
        fit_score: 92.0,
        strengths: ['Expert in cloud infrastructure', 'Strong automation skills'],
        weaknesses: ['Limited front-end experience'],
      },
      {
        full_name: 'Pham Thi Dieu',
        email: 'dieu.pham@example.com',
        birthdate: new Date('1997-05-30'),
        gender: 'Female',
        experience: 2,
        skills: ['React', 'CSS', 'HTML', 'GraphQL'],
        address: '101 Nguyen Hue, Can Tho, Vietnam',
        fit_score: 70.5,
        strengths: ['Creative UI design', 'Quick learner'],
        weaknesses: ['Needs more experience in complex projects'],
      },
      {
        full_name: 'Hoang Van Em',
        email: 'em.hoang@example.com',
        birthdate: new Date('1994-09-12'),
        gender: 'Male',
        experience: 3,
        skills: ['Python', 'R', 'SQL', 'Power BI'],
        address: '202 Ba Trieu, Hai Phong, Vietnam',
        fit_score: 82.0,
        strengths: ['Strong statistical analysis', 'Good team player'],
        weaknesses: ['Limited cloud platform experience'],
      },
    ],
  });

  console.log('Seed data created successfully!');
}

main()
  .catch((e) => {
    console.error('Error seeding data:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });