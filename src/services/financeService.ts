// src/services/financeService.ts
import api from './api';
import { 
  AccountFormInputs, 
  JournalFormInputs, 
  CashFormInputs,
  BankStatementFormInputs,
  AssetFormInputs
} from '../types/finance';

const financeService = {
  // === ACCOUNT SERVICES ===
  // Get all accounts
  async getAccounts() {
    const response = await api.get('/accounts');
    return response.data;
  },

  // Get account by ID
  async getAccountById(id: string) {
    const response = await api.get(`/accounts/${id}`);
    return response.data;
  },

  // Get accounts by type
  async getAccountsByType(type: string) {
    const response = await api.get(`/accounts/by-type/${type}`);
    return response.data;
  },

  // Create account
  async createAccount(accountData: AccountFormInputs) {
    const response = await api.post('/accounts', accountData);
    return response.data;
  },

  // Update account
  async updateAccount(id: string, accountData: Partial<AccountFormInputs>) {
    const response = await api.put(`/accounts/${id}`, accountData);
    return response.data;
  },

  // Delete account
  async deleteAccount(id: string) {
    const response = await api.delete(`/accounts/${id}`);
    return response.data;
  },

  // === JOURNAL SERVICES ===
  // Get all journals
  async getJournals() {
    const response = await api.get('/journals');
    return response.data;
  },

  // Get journal by ID
  async getJournalById(id: string) {
    const response = await api.get(`/journals/${id}`);
    return response.data;
  },

  // Get journals by branch
  async getJournalsByBranch(branchId: string) {
    const response = await api.get(`/journals/by-branch/${branchId}`);
    return response.data;
  },

  // Get journals by date range
  async getJournalsByDateRange(startDate: string, endDate: string) {
    const response = await api.get(`/journals/by-date-range?startDate=${startDate}&endDate=${endDate}`);
    return response.data;
  },

  // Get journals by type
  async getJournalsByType(type: 'Lokal' | 'Pusat') {
    const response = await api.get(`/journals/by-type/${type}`);
    return response.data;
  },

  // Create journal
  async createJournal(journalData: JournalFormInputs) {
    const response = await api.post('/journals', journalData);
    return response.data;
  },

  // Update journal
  async updateJournal(id: string, journalData: Partial<JournalFormInputs>) {
    const response = await api.put(`/journals/${id}`, journalData);
    return response.data;
  },

  // Delete journal
  async deleteJournal(id: string) {
    const response = await api.delete(`/journals/${id}`);
    return response.data;
  },

  // === CASH SERVICES ===
  // Get all cash
  async getCash() {
    const response = await api.get('/cash');
    return response.data;
  },

  // Get cash by ID
  async getCashById(id: string) {
    const response = await api.get(`/cash/${id}`);
    return response.data;
  },

  // Get cash by branch
  async getCashByBranch(branchId: string) {
    const response = await api.get(`/cash/by-branch/${branchId}`);
    return response.data;
  },

  // Get cash by type
  async getCashByType(type: 'Awal' | 'Akhir' | 'Kecil' | 'Rekening' | 'Tangan') {
    const response = await api.get(`/cash/by-type/${type}`);
    return response.data;
  },

  // Get cash by date range
  async getCashByDateRange(startDate: string, endDate: string) {
    const response = await api.get(`/cash/by-date-range?startDate=${startDate}&endDate=${endDate}`);
    return response.data;
  },

  // Create cash
  async createCash(cashData: CashFormInputs) {
    const response = await api.post('/cash', cashData);
    return response.data;
  },

  // Update cash
  async updateCash(id: string, cashData: Partial<CashFormInputs>) {
    const response = await api.put(`/cash/${id}`, cashData);
    return response.data;
  },

  // === BANK STATEMENT SERVICES ===
  // Get all bank statements
  async getBankStatements() {
    const response = await api.get('/bank-statements');
    return response.data;
  },

  // Get bank statement by ID
  async getBankStatementById(id: string) {
    const response = await api.get(`/bank-statements/${id}`);
    return response.data;
  },

  // Get bank statements by branch
  async getBankStatementsByBranch(branchId: string) {
    const response = await api.get(`/bank-statements/by-branch/${branchId}`);
    return response.data;
  },

  // Get bank statements by date range
  async getBankStatementsByDateRange(startDate: string, endDate: string) {
    const response = await api.get(`/bank-statements/by-date-range?startDate=${startDate}&endDate=${endDate}`);
    return response.data;
  },

  // Create bank statement
  async createBankStatement(statementData: BankStatementFormInputs) {
    const response = await api.post('/bank-statements', statementData);
    return response.data;
  },

  // Update bank statement
  async updateBankStatement(id: string, statementData: Partial<BankStatementFormInputs>) {
    const response = await api.put(`/bank-statements/${id}`, statementData);
    return response.data;
  },

  // Validate bank statement
  async validateBankStatement(id: string) {
    const response = await api.put(`/bank-statements/${id}/validate`);
    return response.data;
  },

  // === ASSET SERVICES ===
  // Get all assets
  async getAssets() {
    const response = await api.get('/assets');
    return response.data;
  },

  // Get asset by ID
  async getAssetById(id: string) {
    const response = await api.get(`/assets/${id}`);
    return response.data;
  },

  // Get assets by branch
  async getAssetsByBranch(branchId: string) {
    const response = await api.get(`/assets/by-branch/${branchId}`);
    return response.data;
  },

  // Get assets by type
  async getAssetsByType(type: string) {
    const response = await api.get(`/assets/by-type/${type}`);
    return response.data;
  },

  // Get assets by status
  async getAssetsByStatus(status: 'AKTIF' | 'DIJUAL' | 'RUSAK') {
    const response = await api.get(`/assets/by-status/${status}`);
    return response.data;
  },

  // Create asset
  async createAsset(assetData: AssetFormInputs) {
    const response = await api.post('/assets', assetData);
    return response.data;
  },

  // Update asset
  async updateAsset(id: string, assetData: Partial<AssetFormInputs>) {
    const response = await api.put(`/assets/${id}`, assetData);
    return response.data;
  },

  // Delete asset
  async deleteAsset(id: string) {
    const response = await api.delete(`/assets/${id}`);
    return response.data;
  },
};

export default financeService;
