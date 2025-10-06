// generateData.js
import { faker } from '@faker-js/faker';
import fs from 'fs';

const SKILLS = {
    ai: ['Python', 'PyTorch', 'TensorFlow', 'scikit-learn', 'NLP', 'Computer Vision'],
    web: ['JavaScript', 'React', 'Node.js', 'Express.js', 'HTML', 'CSS', 'SQL', 'MongoDB'],
    data: ['SQL', 'Tableau', 'R', 'Pandas', 'Statistics', 'Excel', 'Power BI'],
    mobile: ['Swift', 'Kotlin', 'React Native', 'Flutter', 'Firebase']
};

const MAJORS = ['Computer Science', 'Data Science', 'Information Technology', 'Software Engineering'];
const COMPANIES = ['InnovateAI', 'DataCorp', 'CloudServe', 'QuantumLeap', 'NexusTech', 'SynthCore'];

function createRandomStudent(id) {
    const major = faker.helpers.arrayElement(MAJORS);
    const skillSetKey = faker.helpers.arrayElement(['ai', 'web', 'data', 'mobile']);
    const numSkills = faker.number.int({ min: 4, max: 6 });
    
    return {
        _id: `student_${100 + id}`,
        name: faker.person.fullName(),
        major: major,
        skills: faker.helpers.arrayElements(SKILLS[skillSetKey], numSkills)
    };
}

function createRandomJob(id) {
    const roleType = faker.helpers.arrayElement(['ai', 'web', 'data', 'mobile']);
    const roleTitle = {
        ai: 'AI Engineer', web: 'Web Developer', data: 'Data Analyst', mobile: 'Mobile Developer'
    }[roleType];
    const numSkills = faker.number.int({ min: 3, max: 5 });

    return {
        _id: `job_${1000 + id}`,
        role: `${faker.helpers.arrayElement(['Junior', 'Senior', 'Lead'])} ${roleTitle}`,
        company: faker.helpers.arrayElement(COMPANIES),
        active: true,
        required_skills: faker.helpers.arrayElements(SKILLS[roleType], numSkills)
    };
}

const database = {
    students: Array.from({ length: 50 }, (_, i) => createRandomStudent(i + 1)),
    jobs: Array.from({ length: 100 }, (_, i) => createRandomJob(i + 1))
};

fs.writeFileSync('data.json', JSON.stringify(database, null, 2));
console.log('✅ Generated a new data.json file with 50 students and 100 jobs.');