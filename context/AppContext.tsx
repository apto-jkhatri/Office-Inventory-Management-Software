import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Asset, Employee, Assignment, MaintenanceLog, AssetRequest, AssetStatus } from '../types';
import { db } from '../services/DatabaseService';

// Extended User type for Auth
export interface User {
  id: string;
  name: string;
  email: string;
  role: 'Admin'; // Restricted to Admin Only
  avatar?: string;
  department?: string;
}

interface AppContextType {
  // Data
  assets: Asset[];
  employees: Employee[];
  assignments: Assignment[];
  maintenanceLogs: MaintenanceLog[];
  requests: AssetRequest[];
  
  loading: boolean; // Data loading state
  isAuthLoading: boolean; // Authentication loading state
  
  // Auth
  currentUser: User | null;
  login: () => Promise<boolean>;
  logout: () => void;

  // Actions
  addAsset: (asset: Asset) => void;
  addEmployee: (employee: Employee) => void;
  updateAsset: (asset: Asset) => void;
  deleteAsset: (id: string) => void;
  assignAsset: (assetId: string, employeeId: string, expectedReturn?: string) => void;
  returnAsset: (assetId: string, notes?: string) => void;
  addMaintenanceLog: (log: MaintenanceLog) => void;
  updateMaintenanceLog: (id: string, status: 'In Progress' | 'Completed') => void;
  approveRequest: (requestId: string, assetId: string) => void;
  rejectRequest: (requestId: string) => void;
  createRequest: (req: AssetRequest) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [maintenanceLogs, setMaintenanceLogs] = useState<MaintenanceLog[]>([]);
  const [requests, setRequests] = useState<AssetRequest[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Auth State - Default to Admin User to bypass login
  const [currentUser, setCurrentUser] = useState<User | null>({
      id: 'ADMIN_DESKTOP',
      name: 'System Administrator',
      email: 'admin@local',
      role: 'Admin',
      avatar: 'https://ui-avatars.com/api/?name=Admin&background=0f172a&color=fff'
  });
  const [isAuthLoading, setIsAuthLoading] = useState(false);

  // Load Data on Mount
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [a, e, asg, m, r] = await Promise.all([
          db.getAssets(),
          db.getEmployees(),
          db.getAssignments(),
          db.getMaintenanceLogs(),
          db.getRequests()
        ]);
        
        setAssets(a);
        setEmployees(e);
        setAssignments(asg);
        setMaintenanceLogs(m);
        setRequests(r);
      } catch (error) {
        console.error("Failed to load data", error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  // Auth Actions - No-ops since auth is removed
  const login = async (): Promise<boolean> => {
    return true;
  };

  const logout = () => {
    // No-op
  };

  // Data Actions
  const addAsset = (asset: Asset) => {
    // Optimistic Update
    setAssets(prev => [...prev, asset]);
    // DB Update
    db.saveAsset(asset);
  };

  const addEmployee = (employee: Employee) => {
    setEmployees(prev => [...prev, employee]);
    db.saveEmployee(employee);
  };

  const updateAsset = (updatedAsset: Asset) => {
    setAssets(prev => prev.map(a => a.id === updatedAsset.id ? updatedAsset : a));
    db.saveAsset(updatedAsset);
  };

  const deleteAsset = (id: string) => {
    setAssets(prev => prev.filter(a => a.id !== id));
    db.deleteAsset(id);
  };

  const assignAsset = (assetId: string, employeeId: string, expectedReturn?: string) => {
    const newAssignment: Assignment = {
      id: `ASG-${Date.now()}`,
      assetId,
      employeeId,
      borrowDate: new Date().toISOString().split('T')[0],
      expectedReturnDate: expectedReturn,
      isActive: true,
    };
    
    // Update State
    setAssignments(prev => [...prev, newAssignment]);
    setAssets(prev => prev.map(a => 
      a.id === assetId 
        ? { ...a, status: AssetStatus.ASSIGNED, assignedTo: employeeId } 
        : a
    ));

    // Update DB
    db.saveAssignment(newAssignment);
    const asset = assets.find(a => a.id === assetId);
    if(asset) {
       db.saveAsset({ ...asset, status: AssetStatus.ASSIGNED, assignedTo: employeeId });
    }
  };

  const returnAsset = (assetId: string, notes?: string) => {
    const today = new Date().toISOString().split('T')[0];

    // Optimistic calculations for DB update
    const asset = assets.find(a => a.id === assetId);
    const assignment = assignments.find(a => a.assetId === assetId && a.isActive);

    setAssignments(prev => prev.map(a => {
      if (a.assetId === assetId && a.isActive) {
        return { ...a, isActive: false, returnedDate: today, notes: notes };
      }
      return a;
    }));

    setAssets(prev => prev.map(a => 
      a.id === assetId 
        ? { ...a, status: AssetStatus.AVAILABLE, assignedTo: undefined } 
        : a
    ));

    // DB Updates
    if (assignment) {
      db.saveAssignment({ ...assignment, isActive: false, returnedDate: today, notes: notes });
    }
    if (asset) {
      db.saveAsset({ ...asset, status: AssetStatus.AVAILABLE, assignedTo: undefined });
    }
  };

  const addMaintenanceLog = (log: MaintenanceLog) => {
    setMaintenanceLogs(prev => [...prev, log]);
    setAssets(prev => prev.map(a => 
      a.id === log.assetId 
        ? { ...a, status: AssetStatus.IN_REPAIR } 
        : a
    ));

    db.saveMaintenanceLog(log);
    const asset = assets.find(a => a.id === log.assetId);
    if (asset) db.saveAsset({ ...asset, status: AssetStatus.IN_REPAIR });
  };

  const updateMaintenanceLog = (id: string, status: 'In Progress' | 'Completed') => {
    setMaintenanceLogs(prev => prev.map(log => 
      log.id === id ? { ...log, status } : log
    ));
    
    // DB Logic
    const log = maintenanceLogs.find(l => l.id === id);
    if (log) {
       db.saveMaintenanceLog({ ...log, status });
       
       if (status === 'Completed') {
         const asset = assets.find(a => a.id === log.assetId);
         if (asset) {
           setAssets(prev => prev.map(a => a.id === log.assetId ? { ...a, status: AssetStatus.AVAILABLE } : a));
           db.saveAsset({ ...asset, status: AssetStatus.AVAILABLE });
         }
       }
    }
  };

  const createRequest = (req: AssetRequest) => {
    setRequests(prev => [...prev, req]);
    db.saveRequest(req);
  };

  const approveRequest = (requestId: string, assetId: string) => {
    const req = requests.find(r => r.id === requestId);
    if (!req) return;

    // Update Request State
    const updatedReq = { ...req, status: 'Approved' as const };
    setRequests(prev => prev.map(r => r.id === requestId ? updatedReq : r));
    
    // Assign Asset Logic
    assignAsset(assetId, req.employeeId);
    
    // DB Update
    db.saveRequest(updatedReq);
  };

  const rejectRequest = (requestId: string) => {
    const req = requests.find(r => r.id === requestId);
    if (!req) return;
    
    const updatedReq = { ...req, status: 'Rejected' as const };
    setRequests(prev => prev.map(r => r.id === requestId ? updatedReq : r));
    db.saveRequest(updatedReq);
  };

  return (
    <AppContext.Provider value={{
      assets,
      employees,
      assignments,
      maintenanceLogs,
      requests,
      loading,
      isAuthLoading,
      currentUser,
      login,
      logout,
      addAsset,
      addEmployee,
      updateAsset,
      deleteAsset,
      assignAsset,
      returnAsset,
      addMaintenanceLog,
      updateMaintenanceLog,
      approveRequest,
      rejectRequest,
      createRequest
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};