import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';

const ProviderRequestRejected = () => {
  return (
    <div className="d-flex justify-content-center align-items-center vh-100">
      <div className="alert alert-danger text-center p-5">
        <h2 className="mb-3">Request Rejected</h2>
        <p className="fs-4">
          Sorry, your request to become a service provider has been rejected by the admin.
          You can reach out us on info@snowmowsolutions.com for detailed information.
        </p>
      </div>
    </div>
  );
};

export default ProviderRequestRejected;
