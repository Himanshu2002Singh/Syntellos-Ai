export function validateLeadSubmission(req, res, next) {
  const { name, email, intent, message } = req.body;
  const errors = [];

  if (!name || typeof name !== 'string' || !name.trim()) {
    errors.push('Name is required');
  }

  if (!email || typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
    errors.push('Valid email address is required');
  }

  if (!intent || typeof intent !== 'string' || !intent.trim()) {
    errors.push('Consultation intent is required');
  }

  if (!message || typeof message !== 'string' || !message.trim()) {
    errors.push('Message or project brief is required');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors
    });
  }

  next();
}

export function validateSubscription(req, res, next) {
  const { email } = req.body;

  if (!email || typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
    return res.status(400).json({
      success: false,
      message: 'A valid email address is required to subscribe.'
    });
  }

  next();
}

export function validateBlogPayload(req, res, next) {
  const { title, category, content } = req.body;
  const errors = [];

  if (!title || typeof title !== 'string' || !title.trim()) {
    errors.push('Blog title is required');
  }

  if (!category || typeof category !== 'string' || !category.trim()) {
    errors.push('Category is required');
  }

  if (!content || typeof content !== 'string' || !content.trim()) {
    errors.push('Content is required');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors
    });
  }

  next();
}
