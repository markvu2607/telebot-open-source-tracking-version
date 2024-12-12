export const formatListResponse = (rows) => {
  return rows.map((row) => `${row.name}: ${row.version}`).join("\n");
};
