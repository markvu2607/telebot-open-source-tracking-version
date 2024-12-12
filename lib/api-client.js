import axios from 'axios';

const apiClient = axios.create({
  baseURL: 'https://api.github.com',
  headers: {
    'Authorization': `token ${process.env.GITHUB_PERSONAL_ACCESS_TOKEN}`
  }
});

export default apiClient;
