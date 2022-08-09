const env = (field: string): string | null => {
  const vars = process.env;
  return vars[field] || null;
};

export default env;
