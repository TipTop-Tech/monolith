import { describe, it, expect, vi, beforeEach } from 'vitest';
import { initDB, getHistoryFromDB, saveHistoryToDB, migrateFromLocalStorage } from '../storage';
import { Capacitor } from '@capacitor/core';

// --- Mocks ---
vi.mock('@capacitor/core', () => ({
  Capacitor: {
    getPlatform: vi.fn(() => 'web'),
  },
}));

const { 
  mockExecute, mockQuery, mockRun, mockOpen,
  mockIsConnection, mockRetrieveConnection, mockCreateConnection, mockInitWebStore 
} = vi.hoisted(() => ({
  mockExecute: vi.fn(),
  mockQuery: vi.fn(),
  mockRun: vi.fn(),
  mockOpen: vi.fn(),
  mockIsConnection: vi.fn(),
  mockRetrieveConnection: vi.fn(),
  mockCreateConnection: vi.fn(),
  mockInitWebStore: vi.fn(),
}));

const mockConnection = {
  execute: mockExecute,
  query: mockQuery,
  run: mockRun,
  open: mockOpen,
};

vi.mock('@capacitor-community/sqlite', () => {
  return {
    CapacitorSQLite: {},
    SQLiteConnection: class {
      initWebStore = mockInitWebStore;
      isConnection = mockIsConnection;
      retrieveConnection = mockRetrieveConnection;
      createConnection = mockCreateConnection;
    },
  };
});

describe('storage utilities', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    
    // Default mock implementations
    mockIsConnection.mockResolvedValue({ result: false });
    mockCreateConnection.mockResolvedValue(mockConnection);
    mockRetrieveConnection.mockResolvedValue(mockConnection);
    mockQuery.mockResolvedValue({ values: [] });
  });

  describe('initDB', () => {
    it('initializes the web store if platform is web', async () => {
      vi.mocked(Capacitor.getPlatform).mockReturnValue('web');
      await initDB();
      expect(mockInitWebStore).toHaveBeenCalled();
    });

    it('does not initialize web store if platform is android', async () => {
      vi.mocked(Capacitor.getPlatform).mockReturnValue('android');
      await initDB();
      expect(mockInitWebStore).not.toHaveBeenCalled();
    });

    it('creates a new connection if none exists', async () => {
      mockIsConnection.mockResolvedValue({ result: false });
      await initDB();
      expect(mockCreateConnection).toHaveBeenCalledWith('WorkoutDB', false, 'no-encryption', 1, false);
      expect(mockRetrieveConnection).not.toHaveBeenCalled();
      expect(mockOpen).toHaveBeenCalled();
      expect(mockExecute).toHaveBeenCalled(); // create table
    });

    it('retrieves existing connection if one exists', async () => {
      mockIsConnection.mockResolvedValue({ result: true });
      await initDB();
      expect(mockRetrieveConnection).toHaveBeenCalledWith('WorkoutDB', false);
      expect(mockCreateConnection).not.toHaveBeenCalled();
      expect(mockOpen).toHaveBeenCalled();
    });
  });

  describe('getHistoryFromDB', () => {
    it('returns empty array if no records found', async () => {
      mockQuery.mockResolvedValue({ values: [] });
      const result = await getHistoryFromDB();
      expect(result).toEqual([]);
    });

    it('returns parsed records if found', async () => {
      const mockData = [{ exerciseId: '1', name: 'Squat' }];
      mockQuery.mockResolvedValue({ 
        values: [
          { data: JSON.stringify(mockData[0]) }
        ] 
      });
      const result = await getHistoryFromDB();
      expect(result).toEqual(mockData);
    });

    it('handles query errors gracefully', async () => {
      mockQuery.mockRejectedValue(new Error('DB Error'));
      const result = await getHistoryFromDB();
      expect(result).toEqual([]);
    });
  });

  describe('saveHistoryToDB', () => {
    it('clears existing history and returns early if empty array provided', async () => {
      await saveHistoryToDB([]);
      expect(mockExecute).toHaveBeenCalledWith('DELETE FROM workoutHistory;');
      expect(mockRun).not.toHaveBeenCalled();
    });

    it('inserts new records', async () => {
      const mockHistory = [
        { exerciseId: 'ex1', sets: [] },
        { exerciseId: 'ex2', sets: [] }
      ];
      await saveHistoryToDB(mockHistory as any);
      
      expect(mockExecute).toHaveBeenCalledWith('DELETE FROM workoutHistory;');
      expect(mockRun).toHaveBeenCalledWith(
        'INSERT INTO workoutHistory (exerciseId, data) VALUES (?, ?), (?, ?)',
        [
          'ex1', JSON.stringify(mockHistory[0]),
          'ex2', JSON.stringify(mockHistory[1])
        ]
      );
    });
  });

  describe('migrateFromLocalStorage', () => {
    it('returns null if no data in localStorage', async () => {
      const result = await migrateFromLocalStorage();
      expect(result).toBeNull();
    });

    it('migrates data from localStorage and removes it', async () => {
      const mockData = [{ exerciseId: 'migrate1', sets: [] }];
      localStorage.setItem('workoutHistory', JSON.stringify(mockData));

      const result = await migrateFromLocalStorage();
      
      expect(result).toEqual(mockData);
      expect(mockRun).toHaveBeenCalled(); // via saveHistoryToDB
      expect(localStorage.getItem('workoutHistory')).toBeNull();
    });
  });
});
