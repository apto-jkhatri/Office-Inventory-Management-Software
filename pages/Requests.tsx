import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Inbox, Check, X, Clock, ChevronRight } from 'lucide-react';
import { AssetStatus } from '../types';

const Requests = () => {
  const { requests, employees, assets, approveRequest, rejectRequest } = useApp();
  const [selectedRequest, setSelectedRequest] = useState<string | null>(null);
  const [selectedAssetId, setSelectedAssetId] = useState('');

  const pendingRequests = requests.filter(r => r.status === 'Pending');
  const pastRequests = requests.filter(r => r.status !== 'Pending');

  // Filter assets that match the selected request category (if one is selected)
  // and are available.
  const activeRequestObj = requests.find(r => r.id === selectedRequest);
  const availableAssetsForRequest = activeRequestObj
    ? assets.filter(a => a.status === AssetStatus.AVAILABLE && a.category.toLowerCase() === activeRequestObj.category.toLowerCase())
    : [];

  const handleApproveClick = (requestId: string) => {
    setSelectedRequest(requestId);
    setSelectedAssetId('');
  };

  const confirmApproval = () => {
    if (selectedRequest && selectedAssetId) {
      approveRequest(selectedRequest, selectedAssetId);
      setSelectedRequest(null);
      setSelectedAssetId('');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Requests & Approvals</h1>
        <p className="text-slate-500">Manage employee asset requests.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pending Requests */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="font-semibold text-slate-900 flex items-center gap-2">
            <Clock size={20} className="text-amber-500" /> 
            Pending Requests 
            <span className="bg-amber-100 text-amber-700 text-xs px-2 py-0.5 rounded-full">{pendingRequests.length}</span>
          </h2>
          
          <div className="space-y-3">
            {pendingRequests.map(req => {
              const employee = employees.find(e => e.id === req.employeeId);
              return (
                <div key={req.id} className="bg-white p-5 rounded-xl shadow-sm border border-slate-100 flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold text-slate-900">{employee?.name}</span>
                      <span className="text-slate-400 text-sm">• {employee?.department}</span>
                    </div>
                    <div className="text-slate-800 font-medium">Requested: {req.category}</div>
                    <p className="text-sm text-slate-500 mt-1">"{req.reason}"</p>
                    <div className="text-xs text-slate-400 mt-2">Date: {req.requestDate}</div>
                  </div>
                  
                  <div className="flex gap-2 w-full sm:w-auto">
                    <button 
                      onClick={() => rejectRequest(req.id)}
                      className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 hover:text-red-600 transition-colors"
                    >
                      <X size={16} /> Reject
                    </button>
                    <button 
                      onClick={() => handleApproveClick(req.id)}
                      className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-sm"
                    >
                      <Check size={16} /> Approve
                    </button>
                  </div>
                </div>
              );
            })}
            
            {pendingRequests.length === 0 && (
              <div className="bg-slate-50 rounded-xl p-8 text-center text-slate-400 border border-dashed border-slate-200">
                <Inbox size={40} className="mx-auto mb-2 text-slate-300" />
                <p>No pending requests.</p>
              </div>
            )}
          </div>
        </div>

        {/* History / Past Requests */}
        <div>
          <h2 className="font-semibold text-slate-900 mb-4">Request History</h2>
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 divide-y divide-slate-100">
            {pastRequests.map(req => {
              const employee = employees.find(e => e.id === req.employeeId);
              return (
                <div key={req.id} className="p-4 flex items-start justify-between">
                  <div>
                    <div className="text-sm font-medium text-slate-900">{employee?.name}</div>
                    <div className="text-xs text-slate-500">{req.category}</div>
                    <div className="text-xs text-slate-400 mt-1">{req.requestDate}</div>
                  </div>
                  <div>
                    {req.status === 'Approved' ? (
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">Approved</span>
                    ) : (
                      <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-medium">Rejected</span>
                    )}
                  </div>
                </div>
              );
            })}
            {pastRequests.length === 0 && (
              <div className="p-6 text-center text-slate-400 text-sm">No history available.</div>
            )}
          </div>
        </div>
      </div>

      {/* Approval Modal to Select Asset */}
      {selectedRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
            <div className="p-6 border-b border-slate-100 bg-slate-50">
              <h3 className="text-lg font-bold text-slate-900">Approve Request</h3>
              <p className="text-sm text-slate-500">Select an available asset to assign.</p>
            </div>
            <div className="p-6 space-y-4">
              <div className="bg-blue-50 p-3 rounded-lg border border-blue-100 text-sm text-blue-800">
                <span className="font-semibold">Request:</span> {activeRequestObj?.category} <br />
                <span className="font-semibold">For:</span> {employees.find(e => e.id === activeRequestObj?.employeeId)?.name}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Available Assets ({activeRequestObj?.category})</label>
                <select 
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  value={selectedAssetId}
                  onChange={(e) => setSelectedAssetId(e.target.value)}
                >
                  <option value="">-- Select Asset --</option>
                  {availableAssetsForRequest.map(asset => (
                    <option key={asset.id} value={asset.id}>
                      {asset.name} ({asset.tag})
                    </option>
                  ))}
                  {availableAssetsForRequest.length === 0 && (
                    <option disabled>No available assets in this category</option>
                  )}
                </select>
                {availableAssetsForRequest.length === 0 && (
                  <p className="text-xs text-red-500 mt-2">Warning: No assets match this category. You may need to add inventory or check other categories.</p>
                )}
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button onClick={() => setSelectedRequest(null)} className="px-4 py-2 text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50">Cancel</button>
                <button 
                  onClick={confirmApproval} 
                  disabled={!selectedAssetId}
                  className="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Confirm Assignment
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Requests;