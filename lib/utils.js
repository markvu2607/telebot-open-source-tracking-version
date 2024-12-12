export const formatListResponse = (rows) => {
  return rows.map((row, index) => `${index + 1}. ${row.name}: ${row.version}`).join("\n");
};

export const formatRowResponse = (row) => {
  return `
    ${row.name}: ${row.version}
    ${row.description}
  `;
}

export const getRepoInfo = async (packageName) => {
  try {
    console.log(process.env.GITHUB_PERSONAL_ACCESS_TOKEN);
    const response = await fetch(`https://api.github.com/repos/${packageName}/releases/latest`, {
      headers: {
        Authorization: `token ${process.env.GITHUB_PERSONAL_ACCESS_TOKEN}`
      }
    }).then(res => res.json());
    const version = response.tag_name;
    const description = response.body || '';

    return {
      version,
      description
    }
  } catch (error) {
    console.error('Error fetching repository info:', error);
    return {
      version: 'unknown',
      description: 'Error fetching release info'
    }
  }
};
