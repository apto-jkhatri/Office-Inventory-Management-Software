import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Employee } from '../types';
import { Search, Plus, Mail, Briefcase, Calendar, UserCircle, Eye } from 'lucide-react';

const Employees = () => {
  const { employees, addEmployee, assets } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewingEmployee, setViewingEmployee] = useState<Employee | null>(null);

  const filteredEmployees = employees.filter(emp => 
    emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.department.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Get assets assigned to the viewing employee
  const employeeAssets = viewingEmployee 
    ? assets.filter(a => a.assignedTo === viewingEmployee.id)
    : [];

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);

    const newEmployee: Employee = {
      id: `E${Date.now()}`,
      name: formData.get('name') as string,
      email: formData.get('email') as string,
      department: formData.get('department') as string,
      role: formData.get('role') as string,
      joinDate: formData.get('joinDate') as string,
      avatar: `https://ui-avatars.com/api/?name=${formData.get('name')}&background=random`
    };

    addEmployee(newEmployee);
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Employees</h1>
          <p className="text-slate-500">Manage staff directory and access.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center shadow-sm"
        >
          <Plus size={18} className="mr-2" />
          Add Employee
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-4 border-b border-slate-100 bg-slate-50/50">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Search employees..." 
              className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-100">
              <tr>
                <th className="px-6 py-3">Employee</th>
                <th className="px-6 py-3">Role & Dept</th>
                <th className="px-6 py-3">Contact</th>
                <th className="px-6 py-3">Joined</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredEmployees.map((emp) => (
                <tr key={emp.id} className="hover:bg-slate-50 group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <img 
                        src={emp.avatar || `https://ui-avatars.com/api/?name=${emp.name}`} 
                        alt={emp.name} 
                        className="w-10 h-10 rounded-full bg-slate-200 object-cover"
                      />
                      <div>
                        <div className="font-medium text-slate-900">{emp.name}</div>
                        <div className="text-xs text-slate-400">ID: {emp.id}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-medium text-slate-900">{emp.role}</div>
                    <div className="text-slate-500 flex items-center gap-1 mt-0.5">
                      <Briefcase size={12} /> {emp.department}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-slate-600">
                      <Mail size={14} />
                      {emp.email}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-slate-600">
                    <div className="flex items-center gap-2">
                      <Calendar size={14} />
                      {emp.joinDate}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button 
                      onClick={() => setViewingEmployee(emp)}
                      className="text-slate-400 hover:text-blue-600 transition-colors p-2 hover:bg-blue-50 rounded-full"
                      title="View Details"
                    >
                      <Eye size={18} />
                    </button>
                  </td>
                </tr>
              ))}
              {filteredEmployees.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-slate-400">
                    <UserCircle size={48} className="mx-auto mb-2 text-slate-300" />
                    No employees found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Employee Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
            <div className="p-6 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
              <h3 className="text-lg font-bold text-slate-900">Add New Employee</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">&times;</button>
            </div>
            <form onSubmit={handleAddSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                <input required name="name" type="text" className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
                <input required name="email" type="email" className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Department</label>
                  <select name="department" className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none">
                    <option>Engineering</option>
                    <option>Design</option>
                    <option>Product</option>
                    <option>Sales</option>
                    <option>Marketing</option>
                    <option>HR</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Role</label>
                  <input required name="role" type="text" className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="e.g. Senior Dev" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Joining Date</label>
                <input required name="joinDate" type="date" className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50">Cancel</button>
                <button type="submit" className="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700">Add Employee</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Employee Detail Modal */}
      {viewingEmployee && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden">
            <div className="p-0">
              {/* Profile Header */}
              <div className="bg-slate-900 p-6 text-white text-center">
                <button onClick={() => setViewingEmployee(null)} className="absolute top-4 right-4 text-slate-400 hover:text-white">&times;</button>
                <img 
                  src={viewingEmployee.avatar || `https://ui-avatars.com/api/?name=${viewingEmployee.name}`} 
                  alt={viewingEmployee.name} 
                  className="w-24 h-24 rounded-full border-4 border-slate-800 mx-auto mb-4"
                />
                <h3 className="text-xl font-bold">{viewingEmployee.name}</h3>
                <p className="text-blue-400">{viewingEmployee.role} • {viewingEmployee.department}</p>
              </div>
              
              <div className="p-6">
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                    <span className="text-xs text-slate-400 block uppercase tracking-wider font-semibold">Email</span>
                    <span className="text-sm text-slate-800 break-all">{viewingEmployee.email}</span>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                    <span className="text-xs text-slate-400 block uppercase tracking-wider font-semibold">Joined</span>
                    <span className="text-sm text-slate-800">{viewingEmployee.joinDate}</span>
                  </div>
                </div>

                <h4 className="text-sm font-bold text-slate-900 mb-3 uppercase tracking-wider">Assigned Assets ({employeeAssets.length})</h4>
                <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
                  {employeeAssets.map(asset => (
                    <div key={asset.id} className="flex items-center justify-between p-3 border border-slate-200 rounded-lg hover:bg-slate-50">
                      <div>
                        <p className="font-medium text-slate-900 text-sm">{asset.name}</p>
                        <p className="text-xs text-slate-500">{asset.tag}</p>
                      </div>
                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">{asset.category}</span>
                    </div>
                  ))}
                  {employeeAssets.length === 0 && (
                    <p className="text-sm text-slate-400 italic text-center py-4">No assets currently assigned.</p>
                  )}
                </div>
              </div>
              <div className="bg-slate-50 p-4 border-t border-slate-100 text-right">
                 <button onClick={() => setViewingEmployee(null)} className="px-4 py-2 text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-100 text-sm">Close</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Employees;
