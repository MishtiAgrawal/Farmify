module.exports = (schema) => {
  return (req, res, next) => {
    for (const [field, rule] of Object.entries(schema)) {
      const value = req.body[field];
      if (rule.required && (value === undefined || value === null || value === "")) {
        return res.status(400).json({ error: `Field '${field}' is required` });
      }
      if (value !== undefined && rule.type && typeof value !== rule.type) {
        return res.status(400).json({ error: `Field '${field}' must be of type ${rule.type}` });
      }
      if (value && rule.minLength && String(value).length < rule.minLength) {
        return res.status(400).json({ error: `Field '${field}' must be at least ${rule.minLength} characters` });
      }
    }
    next();
  };
};
