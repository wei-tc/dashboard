const HOSTNAME = window.location.origin;

export const ALL_USERS_URL = `${HOSTNAME}/api/v1/permissions`;
export const ALL_PLOTS_URL = `${HOSTNAME}/api/v1/plots/`; // for POST to be compatible with Django's trailing slash
export const DATASETS_URL = `${HOSTNAME}/api/v1/datasets`;
export const STANDARDS_URL = `${HOSTNAME}/api/v1/industry-standards`;
