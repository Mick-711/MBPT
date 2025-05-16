// Local storage keys
export const STORAGE_KEYS = {
  CLIENTS: 'fitTrainPro_clients',
  CURRENT_USER: 'fitTrainPro_currentUser',
};

// Client data type
export interface ClientData {
  id: number;
  fullName: string;
  email: string;
  profileImage: string | null;
  joinedDate: string;
  subscription: string;
  status: string;
  progress: number;
  trainer: string;
  tags: string[];
  nextSession: string | null;
}

// Get clients from local storage
export function getClientsFromStorage(): ClientData[] {
  const storedClients = localStorage.getItem(STORAGE_KEYS.CLIENTS);
  return storedClients ? JSON.parse(storedClients) : [];
}

// Save clients to local storage
export function saveClientsToStorage(clients: ClientData[]): void {
  localStorage.setItem(STORAGE_KEYS.CLIENTS, JSON.stringify(clients));
}

// Add a new client to storage
export function addClientToStorage(client: Omit<ClientData, 'id'>): ClientData {
  const clients = getClientsFromStorage();
  // Generate a new ID (max id + 1)
  const newId = clients.length > 0 
    ? Math.max(...clients.map(c => c.id)) + 1 
    : 1;
  
  const newClient = {
    ...client,
    id: newId,
  };
  
  clients.push(newClient);
  saveClientsToStorage(clients);
  
  return newClient;
}

// Update a client in storage
export function updateClientInStorage(id: number, updates: Partial<ClientData>): ClientData | null {
  const clients = getClientsFromStorage();
  const clientIndex = clients.findIndex(c => c.id === id);
  
  if (clientIndex === -1) return null;
  
  const updatedClient = {
    ...clients[clientIndex],
    ...updates,
  };
  
  clients[clientIndex] = updatedClient;
  saveClientsToStorage(clients);
  
  return updatedClient;
}

// Delete a client from storage
export function deleteClientFromStorage(id: number): boolean {
  const clients = getClientsFromStorage();
  const filteredClients = clients.filter(c => c.id !== id);
  
  if (filteredClients.length === clients.length) return false;
  
  saveClientsToStorage(filteredClients);
  return true;
}

// Initialize clients storage with sample data if empty
export function initializeClientsStorage(sampleData: ClientData[]): void {
  const existingClients = getClientsFromStorage();
  
  if (existingClients.length === 0) {
    saveClientsToStorage(sampleData);
  }
}