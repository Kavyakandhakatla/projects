import React, { useEffect, useState } from 'react';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';

const AdminProvidersRequest = () => {
  const [pendingProviders, setPendingProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const fetchPendingProviders = async () => {
    try {
      const res = await axios.get('https://snowmow.online/api/auth/providers/pending');
      setPendingProviders(res.data);
      console.log('Pending Providers:', res.data);
    } catch (err) {
      console.error('Error fetching providers:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingProviders();
  }, []);

  const approveProvider = async (userId) => {
    try {
      await axios.put(`https://snowmow.online/api/auth/providers/approve/${userId}`);
      setPendingProviders(prev => prev.filter(p => p.id !== userId));
    } catch (err) {
      console.error('Error approving provider:', err);
    }
  };

  const rejectProvider = async (userId) => {
    try {
      await axios.put(`https://snowmow.online/api/auth/provider/reject/${userId}`);
      setPendingProviders(prev => prev.filter(p => p.id !== userId));
    } catch (err) {
      console.error('Error rejecting provider:', err);
    }
  };

  const formatList = (item) => {
    if (Array.isArray(item)) return item.join(', ');
    if (typeof item === 'string') {
      try {
        const parsed = JSON.parse(item);
        return Array.isArray(parsed) ? parsed.join(', ') : item;
      } catch {
        return item;
      }
    }
    return 'N/A';
  };

  if (loading) {
    return (
      <div className="text-center mt-5">
        <div className="spinner-border text-primary" role="status" />
      </div>
    );
  }

  if (pendingProviders.length === 0) {
    return <div className="alert alert-success mt-5 text-center">No pending providers.</div>;
  }

  return (
    <div className="container mt-5">
      <h2 className="text-center mb-4">Pending Service Providers</h2>
      <div className="row justify-content-center g-4">
        {pendingProviders.map((provider) => (
          <div key={provider.id} className="col-12 col-md-10 col-lg-8">
            <div className="card shadow-lg border-0 rounded-4">
              <div className="card-body p-4 d-flex flex-column">
                <div className="mb-3">
                  <h5 className="card-title mb-1">Name:{provider.name}</h5>
                  <h6 className="card-subtitle">Contact Email: {provider.email}</h6>
                </div>

                <ul className="list-unstyled mb-4">
                  <li><strong>Locations:</strong> {formatList(provider.locations)}</li>
                  <li><strong>Services:</strong> {formatList(provider.services)}</li>
                  {(provider.snowrate || provider.lawnrate) && (
  <li>
    <strong>Rates:</strong>
    <ul className="mb-0">
      {provider.snowrate && <li>Snow Removal: ${provider.snowrate}/hr</li>}
      {provider.lawnrate && <li>Lawn Mowing: ${provider.lawnrate}/sq.ft</li>}
    </ul>
  </li>
)}

                  <li><strong>Experience:</strong> {provider.experience} years</li>
                </ul>

                <div className="d-flex justify-content-end gap-2 mt-auto">
                  <button
                    className="btn btn-success"
                    onClick={() => approveProvider(provider.id)}
                  >
                    Approve
                  </button>
                  <button
                    className="btn btn-outline-danger"
                    onClick={() => rejectProvider(provider.id)}
                  >
                    Reject
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminProvidersRequest;
