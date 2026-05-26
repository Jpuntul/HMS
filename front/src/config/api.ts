// API Configuration
// Reads from environment variables set in .env file

export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

export const API_ENDPOINTS = {
  // Auth (JWT)
  login: `${API_BASE_URL}/api/auth/login/`,
  refresh: `${API_BASE_URL}/api/auth/refresh/`,
  logout: `${API_BASE_URL}/api/auth/logout/`,
  register: `${API_BASE_URL}/api/auth/register/`,
  profile: `${API_BASE_URL}/api/auth/profile/`,

  // Persons
  persons: `${API_BASE_URL}/api/persons/`,
  personsFilterOptions: `${API_BASE_URL}/api/persons/filter-options/`,

  // Employees
  employees: `${API_BASE_URL}/api/employees/`,
  employeesFilterOptions: `${API_BASE_URL}/api/employees/filter-options/`,

  // Facilities
  facilities: `${API_BASE_URL}/api/facilities/`,

  // Persons (URL identifier is person.uuid, never Medicare/SSN)
  personDetail: (uuid: string) => `${API_BASE_URL}/api/persons/${uuid}/`,
  // Employees (lookup via person.uuid through the OneToOne)
  employeeDetail: (uuid: string) => `${API_BASE_URL}/api/employees/${uuid}/`,

  // Infections (composite PK; URL exposes person.uuid, not SSN)
  infections: `${API_BASE_URL}/api/infections/`,
  infectionTypes: `${API_BASE_URL}/api/infection-types/`,
  infectionDetail: (
    personUuid: string,
    date: string,
    typeId: number | string,
  ) => `${API_BASE_URL}/api/infections/${personUuid}/${date}/${typeId}/`,

  // Vaccinations (composite PK; URL exposes person.uuid, not SSN)
  vaccinations: `${API_BASE_URL}/api/vaccinations/`,
  vaccineTypes: `${API_BASE_URL}/api/vaccine-types/`,
  vaccinationDetail: (
    personUuid: string,
    typeId: number | string,
    date: string,
  ) => `${API_BASE_URL}/api/vaccinations/${personUuid}/${typeId}/${date}/`,

  // Schedules (composite PK; URL exposes person.uuid, not ESSN)
  schedules: `${API_BASE_URL}/api/schedules/`,
  scheduleDetail: (
    personUuid: string,
    fid: number | string,
    date: string,
    startTime: string,
  ) =>
    `${API_BASE_URL}/api/schedules/${personUuid}/${fid}/${date}/${startTime}/`,

  // Analytics
  analytics: {
    dashboard: `${API_BASE_URL}/api/analytics/dashboard/`,
    demographics: `${API_BASE_URL}/api/analytics/demographics/`,
    facilities: `${API_BASE_URL}/api/analytics/facilities/`,
  },
};

// Frontend route builders — must mirror the backend URL shape so React
// Router params line up with the API path segments. Every entity that
// previously carried SSN/Medicare in its URL now carries a person UUID.
export const ROUTES = {
  personDetail: (uuid: string) => `/persons/${uuid}`,
  personEdit: (uuid: string) => `/persons/${uuid}/edit`,

  employeeDetail: (uuid: string) => `/employees/${uuid}`,
  employeeEdit: (uuid: string) => `/employees/${uuid}/edit`,

  infectionDetail: (
    personUuid: string,
    date: string,
    typeId: number | string,
  ) => `/infections/${personUuid}/${date}/${typeId}`,
  infectionEdit: (personUuid: string, date: string, typeId: number | string) =>
    `/infections/${personUuid}/${date}/${typeId}/edit`,

  vaccinationDetail: (
    personUuid: string,
    typeId: number | string,
    date: string,
  ) => `/vaccinations/${personUuid}/${typeId}/${date}`,
  vaccinationEdit: (
    personUuid: string,
    typeId: number | string,
    date: string,
  ) => `/vaccinations/${personUuid}/${typeId}/${date}/edit`,

  scheduleDetail: (
    personUuid: string,
    fid: number | string,
    date: string,
    startTime: string,
  ) => `/schedules/${personUuid}/${fid}/${date}/${startTime}`,
  scheduleEdit: (
    personUuid: string,
    fid: number | string,
    date: string,
    startTime: string,
  ) => `/schedules/${personUuid}/${fid}/${date}/${startTime}/edit`,
};
