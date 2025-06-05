// Export all API modules
export { profileApi } from './profile';
export { sanctionsApi } from './sanctions';
export { eventsApi } from './events';
export { tasksApi } from './tasks';
export { moodApi } from './mood';
export { generatorApi } from './generator';
export { warningsApi } from './warnings';
export { ticketsApi } from './tickets';
export { surveysApi } from './surveys';
export { quickTasksApi } from './quicktasks';
export { miscApi } from './misc';

// Export client and types
export { apiClient, ApiError } from './client';
export type { ApiResponse } from './client';
export * from './types';

// Main API object for easier access
import { profileApi } from './profile';
import { sanctionsApi } from './sanctions';
import { eventsApi } from './events';
import { tasksApi } from './tasks';
import { moodApi } from './mood';
import { generatorApi } from './generator';
import { warningsApi } from './warnings';
import { ticketsApi } from './tickets';
import { surveysApi } from './surveys';
import { quickTasksApi } from './quicktasks';
import { miscApi } from './misc';

export const api = {
  profile: profileApi,
  sanctions: sanctionsApi,
  events: eventsApi,
  tasks: tasksApi,
  mood: moodApi,
  generator: generatorApi,
  warnings: warningsApi,
  tickets: ticketsApi,
  surveys: surveysApi,
  quickTasks: quickTasksApi,
  misc: miscApi,
};

// Default export for convenience
export default api;