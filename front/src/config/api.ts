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

  // Infections (composite PK: ssn + date + type_id)
  infections: `${API_BASE_URL}/api/infections/`,
  infectionTypes: `${API_BASE_URL}/api/infection-types/`,
  infectionDetail: (
    ssn: number | string,
    date: string,
    typeId: number | string,
  ) => `${API_BASE_URL}/api/infections/${ssn}/${date}/${typeId}/`,

  // Vaccinations (composite PK: ssn + type_id + date)
  vaccinations: `${API_BASE_URL}/api/vaccinations/`,
  vaccineTypes: `${API_BASE_URL}/api/vaccine-types/`,
  vaccinationDetail: (
    ssn: number | string,
    typeId: number | string,
    date: string,
  ) => `${API_BASE_URL}/api/vaccinations/${ssn}/${typeId}/${date}/`,

  // Schedules (composite PK: essn + fid + date + start_time)
  schedules: `${API_BASE_URL}/api/schedules/`,
  scheduleDetail: (
    essn: number | string,
    fid: number | string,
    date: string,
    startTime: string,
  ) => `${API_BASE_URL}/api/schedules/${essn}/${fid}/${date}/${startTime}/`,

  // Analytics
  analytics: {
    dashboard: `${API_BASE_URL}/api/analytics/dashboard/`,
    demographics: `${API_BASE_URL}/api/analytics/demographics/`,
    facilities: `${API_BASE_URL}/api/analytics/facilities/`,
  },
};

// Frontend route builders — must mirror the backend composite-PK URL shape so
// React Router params line up with the API path segments.
export const ROUTES = {
  infectionDetail: (
    ssn: number | string,
    date: string,
    typeId: number | string,
  ) => `/infections/${ssn}/${date}/${typeId}`,
  infectionEdit: (
    ssn: number | string,
    date: string,
    typeId: number | string,
  ) => `/infections/${ssn}/${date}/${typeId}/edit`,

  vaccinationDetail: (
    ssn: number | string,
    typeId: number | string,
    date: string,
  ) => `/vaccinations/${ssn}/${typeId}/${date}`,
  vaccinationEdit: (
    ssn: number | string,
    typeId: number | string,
    date: string,
  ) => `/vaccinations/${ssn}/${typeId}/${date}/edit`,

  scheduleDetail: (
    essn: number | string,
    fid: number | string,
    date: string,
    startTime: string,
  ) => `/schedules/${essn}/${fid}/${date}/${startTime}`,
  scheduleEdit: (
    essn: number | string,
    fid: number | string,
    date: string,
    startTime: string,
  ) => `/schedules/${essn}/${fid}/${date}/${startTime}/edit`,
};
