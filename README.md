🤖 AI Hiring Agent
A web application that uses a Large Language Model (Llama 3.1 via Groq) to provide intelligent job recommendations for student profiles. The agent can analyze pre-existing, generated profiles or parse uploaded resumes (PDF/DOCX) to generate three types of matches: Direct Skill Match, Aspirational Role, and Hidden Gem.

This is a sample GIF. You can create your own to showcase the project.

✨ Features
Dynamic AI Recommendations: Leverages the Groq API for fast, free AI analysis.

Resume Parsing: Upload a resume in PDF or DOCX format for instant, personalized recommendations.

Rich Faux Dataset: Uses Faker.js to generate a large, realistic dataset of students and jobs.

Three Recommendation Types:

🎯 Direct Skill Match: The best job for the candidate right now.

🚀 Aspirational Role: A challenging but achievable next step, with identified skill gaps.

💎 Hidden Gem: A role that fits the candidate's inferred work style or culture.

Modern UI: A clean, professional, and responsive interface built with Tailwind CSS.

Light/Dark Mode: A theme toggle with local storage persistence.

Loading Indicators: A smooth user experience while waiting for AI responses.

🛠️ Tech Stack
Backend: Node.js, Express.js

Frontend: EJS (Embedded JavaScript Templates)

Styling: Tailwind CSS

AI: Groq API (Llama 3.1 Model)

Data Generation: Faker.js

File Parsing: Multer, pdf-parse, Mammoth.js

Development: concurrently (for running multiple scripts)

🚀 Setup and Installation
Follow these steps to get the project running on your local machine.

1. Clone the Repository
Bash

git clone <your-repository-url>
cd <repository-folder>
2. Install Dependencies
Install all the necessary packages defined in package.json.

Bash

npm install
3. Set Up Environment Variables
Create a .env file in the root of the project. You can copy the example file:

Bash

cp .env.example .env
Now, open the .env file and add your free Groq API key:

Code snippet

# .env

# Your Groq API Key
GROQ_API_KEY="gsk_..."
4. Generate the Dataset
The project uses a local data.json file as its database. Run this command once to populate it with 50 students and 100 jobs.

Bash

node generateData.js
5. Run the Application
This command will start the Tailwind CSS compiler and the Node.js server at the same time.

Bash

npm start
Your application should now be running at http://localhost:3000.

📖 How to Use
Open your web browser and navigate to http://localhost:3000.

Option 1: Use the form at the top to upload a resume (PDF or DOCX) and click "Generate Recommendations".

Option 2: Scroll down and click on any of the pre-generated student profiles.

The application will display a loading spinner while the AI processes the request, then show the three types of job recommendations.

Use the toggle in the top-right corner to switch between light and dark mode.

📁 Project Structure
/
├── public/
│   ├── input.css         # Tailwind directives
│   └── output.css        # Generated CSS file
├── views/
│   ├── index.ejs         # Homepage UI
│   └── recommendations.ejs # Results page UI
├── .env                  # Your secret keys (gitignored)
├── .env.example          # Example environment file
├── data.json             # Local JSON database
├── generateData.js       # Script to generate faux data
├── index.js              # Main Express server logic
├── package.json          # Project dependencies and scripts
└── tailwind.config.js    # Tailwind CSS configuration
📄 License
This project is licensed under the MIT License.
