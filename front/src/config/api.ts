// API Configuration
// Reads from environment variables set in .env file

export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

export const API_ENDPOINTS = {
  // Auth
  login: `${API_BASE_URL}/api/auth/login/`,
  logout: `${API_BASE_URL}/api/auth/logout/`,
  register: `${API_BASE_URL}/api/auth/register/`,

  // Persons
  persons: `${API_BASE_URL}/api/persons/`,
  personsFilterOptions: `${API_BASE_URL}/api/persons/filter-options/`,

  // Employees
  employees: `${API_BASE_URL}/api/employees/`,
  employeesFilterOptions: `${API_BASE_URL}/api/employees/filter-options/`,

  // Facilities
  facilities: `${API_BASE_URL}/api/facilities/`,

  // Infections
  infections: `${API_BASE_URL}/api/infections/`,
  infectionTypes: `${API_BASE_URL}/api/infection-types/`,

  // Vaccinations
  vaccinations: `${API_BASE_URL}/api/vaccinations/`,
  vaccineTypes: `${API_BASE_URL}/api/vaccine-types/`,

  // Schedules
  schedules: `${API_BASE_URL}/api/schedules/`,

  // Analytics
  analytics: {
    dashboard: `${API_BASE_URL}/api/analytics/dashboard/`,
    demographics: `${API_BASE_URL}/api/analytics/demographics/`,
    facilities: `${API_BASE_URL}/api/analytics/facilities/`,
  },
};
