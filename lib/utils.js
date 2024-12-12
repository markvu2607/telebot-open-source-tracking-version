import apiClient from "./api-client.js";

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
    const response = await apiClient.get(`/repos/${packageName}/releases/latest`);
    const releaseData = response.data;
    const version = releaseData.tag_name;
    const description = releaseData.body || '';

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
