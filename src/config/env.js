module.exports = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: process.env.PORT || 3004,
  JWT_SECRET: process.env.JWT_SECRET || 'farmify_secret_change_in_production',
  JWT_EXPIRY: '7d',
  SALT_ROUNDS: 10,
  GEMINI_API_KEY: process.env.GEMINI_API_KEY || '',
  OPENWEATHER_API_KEY: process.env.OPENWEATHER_API_KEY || ''
};
