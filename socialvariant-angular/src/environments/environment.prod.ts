export const environment = {
  production: true,
  apiUrl: 'https://your-production-api.com/api',
  appName: 'SocialVariant',
  version: '1.0.0',
  features: {
    enableAnalytics: true,
    enableLogging: false,
    enableDebugMode: false
  },
  external: {
    // Add external API endpoints here
    // Example: githubApi: 'https://api.github.com',
    // Example: weatherApi: 'https://api.openweathermap.org/data/2.5'
  }
};
