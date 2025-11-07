const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PASSWORD_REGEX = /^(?=.*[A-Z])(?=.*\d).{8,}$/;

const sanitizeString = (value = "") => value.trim();

const isValidEmail = (email = "") => EMAIL_REGEX.test(email.trim());

const isStrongPassword = (password = "") => PASSWORD_REGEX.test(password);

const normalizeName = (value = "") => {
  const sanitized = sanitizeString(value);
  return sanitized.charAt(0).toUpperCase() + sanitized.slice(1);
};

module.exports = {
  isValidEmail,
  isStrongPassword,
  normalizeName,
  sanitizeString,
};

