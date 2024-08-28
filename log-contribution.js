const fs = require('fs');
const core = require('@actions/core');
const github = require('@actions/github');

(async () => {
  try {
    const token = process.env.GITHUB_TOKEN;
    const octokit = github.getOctokit(token);

    const { context } = github;
    const { issue } = context.payload;

    if (issue.labels.some(label => label.name === 'contribution')) {
      const username = issue.user.login;

      // Log the issue body for debugging
      const issueBody = issue.body || "";
      console.log('Full Issue Body:', issueBody);

      // Default values
      let projectArea = "N/A";
      let dateCompleted = "N/A";
      let typeOfContribution = "N/A";

      // Split the issue body by lines
      const lines = issueBody.split('\n');

      // Logging lines for debugging
      console.log('Split lines:', lines);

      // Iterate over each line and extract values
      lines.forEach((line, index) => {
        if (line.includes('Specify Area of Project')) {
          projectArea = lines[index + 1].trim();
          console.log('Extracted Project Area:', projectArea);
        }
        if (line.includes('Date of Completion')) {
          dateCompleted = lines[index + 1].trim();
          console.log('Extracted Date Completed:', dateCompleted);
        }
        if (line.includes('Specify the type of contribution')) {
          typeOfContribution = lines[index + 1].trim();
          console.log('Extracted Type of Contribution:', typeOfContribution);
        }
      });

      // Assume the task description comes from the issue title
      const taskCompleted = issue.title.replace('[Project]:', '').trim();

      // Create a new row for the markdown table
      const newRow = `| @${username} | ${taskCompleted} | ${projectArea} | ${dateCompleted} | ${typeOfContribution} |\n`;

      const filePath = 'community-contributions.md';
      const fileContents = fs.readFileSync(filePath, 'utf-8');

      console.log('Original File Contents:');
      console.log(fileContents);

      // Append the new row to the existing content
      const updatedContents = fileContents + newRow;

      fs.writeFileSync(filePath, updatedContents);

      console.log('New Row to Add:');
      console.log(newRow);

      console.log('Updated File Contents:');
      console.log(updatedContents);

      console.log(`New contribution added to ${filePath}`);
    } else {
      console.log('No "contribution" label found, skipping update.');
    }
  } catch (error) {
    core.setFailed(error.message);
  }
})();
