import { Api } from './api-generated';

// Get backend URL from env or default to localhost
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

// API instance with auto-generated client
const apiClient = new Api({
  baseUrl: BASE_URL,
  baseApiParams: {
    headers: {
      'Content-Type': 'application/json',
    },
    secure: true,
  },
  securityWorker: async () => {
    const token = localStorage.getItem('google_id_token');
    if (token) {
      return {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };
    }
    return {};
  },
});

// Create a wrapper that matches our previous simple 'api' object 
// to avoid breaking existing code, while transitioning to the generated client.
export const api = {
  // Profile
  async getProfile() {
    const res = await apiClient.api.profileList();
    return res.data;
  },
  async getDashboard() {
    const res = await apiClient.api.dashboardList();
    return res.data;
  },
  async syncProfile() {
    const res = await apiClient.api.profileSyncCreate();
    return res.data;
  },
  async updateProfile(data: any) {
    const res = await apiClient.api.profileUpdate(data);
    return res.data;
  },
  async purgeData() {
    const res = await apiClient.api.profilePurgeCreate();
    return res.data;
  },

  // Categories
  async getCategories() {
    const res = await apiClient.api.categoriesList();
    return res.data;
  },
  async createCategory(data: any) {
    const res = await apiClient.api.categoriesCreate(data);
    return res.data;
  },
  async updateCategory(id: string, data: any) {
    const res = await apiClient.api.categoriesUpdate(id, data);
    return res.data;
  },
  async deleteCategory(id: string) {
    const res = await apiClient.api.categoriesDelete(id);
    return res.data;
  },

  // Accounts
  async getAccounts() {
    const res = await apiClient.api.accountsList();
    return res.data;
  },
  async createAccount(data: any) {
    const res = await apiClient.api.accountsCreate(data);
    return res.data;
  },
  async updateAccount(id: string, data: any) {
    const res = await apiClient.api.accountsUpdate(id, data);
    return res.data;
  },
  async deleteAccount(id: string) {
    const res = await apiClient.api.accountsDelete(id);
    return res.data;
  },

  // Transactions
  async getTransactions() {
    const res = await apiClient.api.transactionsList();
    return res.data;
  },
  async createTransaction(data: any) {
    const res = await apiClient.api.transactionsCreate(data);
    return res.data;
  },
  async updateTransaction(id: string, data: any) {
    const res = await apiClient.api.transactionsUpdate(id, data);
    return res.data;
  },
  async deleteTransaction(id: string) {
    const res = await apiClient.api.transactionsDelete(id);
    return res.data;
  },

  // Admin
  async getAdminStats() {
    const res = await apiClient.api.adminStatsList();
    return res.data;
  },
  async getAllUsers() {
    const res = await apiClient.api.adminUsersList();
    return res.data;
  },
  async updateUserRole(uid: string, isAdmin: boolean) {
    const res = await apiClient.api.adminUsersRoleUpdate(uid, { isAdmin });
    return res.data;
  },
  async runMigration() {
    const res = await apiClient.api.adminMigrateCreate();
    return res.data;
  },

  // Generic methods (legacy support)
  async get(endpoint: string) {
    if (endpoint === '/categories') return this.getCategories();
    if (endpoint === '/accounts') return this.getAccounts();
    if (endpoint === '/profile') return this.getProfile();
    throw new Error(`Endpoint ${endpoint} not explicitly mapped in generated API wrapper`);
  },
  async post(endpoint: string, data?: any) {
    if (endpoint === '/profile/sync') return this.syncProfile();
    if (endpoint === '/categories') return this.createCategory(data);
    if (endpoint === '/accounts') return this.createAccount(data);
    if (endpoint === '/profile/purge') return this.purgeData();
    throw new Error(`Endpoint ${endpoint} not explicitly mapped in generated API wrapper`);
  },
  async put(endpoint: string, data: any) {
    if (endpoint.startsWith('/categories/')) {
        const id = endpoint.split('/').pop()!;
        return this.updateCategory(id, data);
    }
    if (endpoint.startsWith('/accounts/')) {
        const id = endpoint.split('/').pop()!;
        return this.updateAccount(id, data);
    }
    if (endpoint === '/profile') return this.updateProfile(data);
    throw new Error(`Endpoint ${endpoint} not explicitly mapped in generated API wrapper`);
  },
  async delete(endpoint: string) {
    if (endpoint.startsWith('/categories/')) {
        const id = endpoint.split('/').pop()!;
        return this.deleteCategory(id);
    }
    if (endpoint.startsWith('/accounts/')) {
        const id = endpoint.split('/').pop()!;
        return this.deleteAccount(id);
    }
    throw new Error(`Endpoint ${endpoint} not explicitly mapped in generated API wrapper`);
  }
};

// Export the raw client for advanced usage
export { apiClient };
