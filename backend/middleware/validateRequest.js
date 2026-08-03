export const validateRequest = (schema) => {
  return (req, res, next) => {
    try {
      schema.parse({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      next();
    } catch (err) {
      // Zod v4 exposes the failures as `issues`; `errors` no longer exists, and
      // reading it here turned every validation failure into a 500.
      if (err.name === 'ZodError') {
        const issues = err.issues || [];
        return res.status(400).json({
          message: issues[0]?.message || 'Validation failed',
          errors: issues.map(e => ({
            // Drop the body/query/params wrapper so the client sees a plain field name
            path: e.path.filter(p => !['body', 'query', 'params'].includes(p)).join('.'),
            message: e.message
          }))
        });
      }
      next(err);
    }
  };
};
