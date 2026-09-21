const apiBaseUrl = (import.meta.env.VITE_API_BASE_URL || '/api').replace(/\/+$/, '');

async function request(path, options) {
  let response;
  try {
    response = await fetch(apiBaseUrl + '/' + path.replace(/^\/+/, ''), options);
  } catch {
    throw new Error('The website service is unavailable. Please try again shortly.');
  }

  let result;
  try {
    result = await response.json();
  } catch {
    throw new Error('The website service returned an unreadable response.');
  }

  if (!response.ok || !result.success) {
    throw new Error(result.message || 'The request could not be completed.');
  }

  return result;
}

export async function getPublishedBlogs(limit = 12) {
  const result = await request('/blogs?limit=' + encodeURIComponent(limit));
  return result.data.blogs;
}

export async function getPublishedBlogBySlug(slug) {
  const result = await request('/blogs/slug/' + encodeURIComponent(slug));
  return result.data;
}

export async function submitConsultationLead(lead) {
  return request('/leads', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(lead),
  });
}

export async function subscribeToNewsletter(subscriber) {
  return request('/newsletter/subscribe', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(subscriber),
  });
}

export async function unsubscribeFromNewsletter({ token, email }) {
  const params = new URLSearchParams();
  if (token) params.set('token', token);
  if (email) params.set('email', email);
  return request('/newsletter/unsubscribe?' + params.toString());
}

export async function adminRequest(path, token, options = {}) {
  return request(path, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...(options.headers || {}),
    },
  });
}
export async function adminUpload(path, token, formData) {
  return request(path, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });
}

export async function adminLogin(credentials) {
  return request('/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credentials),
  });
}
