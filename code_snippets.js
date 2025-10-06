// -----------------------------------------------------------------
// SNIPPET 1: For the "Filter & Combine Data" Node
// -----------------------------------------------------------------
// This code prepares all data for the AI in one clean package.
const student = $input.items[0].json.student;
const allJobs = $input.items[0].json.jobs;
const TOP_N = 30; // Max jobs to send to the AI

// Basic filtering: find jobs that match at least one student skill
const studentSkills = new Set(student.skills.map(s => s.toLowerCase()));
const filteredJobs = allJobs.filter(job =>
  job.required_skills && job.required_skills.some(skill => studentSkills.has(skill.toLowerCase()))
);

// If too many jobs, sort by a simple score and take the top N
if (filteredJobs.length > TOP_N) {
  filteredJobs.sort((a, b) => {
    const scoreA = a.required_skills.filter(s => studentSkills.has(s.toLowerCase())).length;
    const scoreB = b.required_skills.filter(s => studentSkills.has(s.toLowerCase())).length;
    return scoreB - scoreA;
  });
}

return {
  student_profile: student,
  job_listings: filteredJobs.slice(0, TOP_N)
};


// -----------------------------------------------------------------
// SNIPPET 2: For the "Parse & Format Email" Node
// -----------------------------------------------------------------
// This code parses the AI's JSON response and builds the HTML email.
const aiResponse = JSON.parse($input.item.json.ai_response);
const studentName = $input.item.json.student_name;

// Helper function to create a job card
function createJobCard(title, rec) {
  if (!rec || !rec.role) return '';
  return `
    <div class="card">
      <h3>${title}</h3>
      <p><b>${rec.role} at ${rec.company}</b></p>
      <p><i>"${rec.reason}"</i></p>
      ${rec.skill_gap ? `<p><b>Focus Area:</b> ${rec.skill_gap.join(', ')}</p>` : ''}
      <a href="#" class="button">View Job</a>
    </div>
  `;
}

let html = `
<html>
<head>
<style>
  body { font-family: -apple-system, BlinkMacSystemFont, sans-serif; margin: 40px; background-color: #f7f7f7; color: #333; }
  .container { max-width: 600px; margin: auto; background: white; padding: 20px; border-radius: 12px; }
  .card { border: 1px solid #e0e0e0; padding: 20px; margin-bottom: 20px; border-radius: 8px; }
  h2 { color: #1a1a1a; }
  h3 { color: #0056b3; margin-top: 0; }
  p { line-height: 1.6; }
  .button { background-color: #007bff; color: white; padding: 10px 15px; text-decoration: none; border-radius: 5px; display: inline-block; }
</style>
</head>
<body>
  <div class="container">
    <h2>Hi ${studentName}, here are your personalized career recommendations!</h2>
    ${createJobCard('🎯 Direct Skill Match', aiResponse.direct_match)}
    ${createJobCard('🚀 Aspirational Role', aiResponse.aspirational_match)}
    ${createJobCard('💎 Hidden Gem (Culture Fit)', aiResponse.hidden_gem_match)}
  </div>
</body>
</html>
`;

return { html_email: html };