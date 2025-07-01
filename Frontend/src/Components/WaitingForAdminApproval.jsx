import React, { useEffect, useRef } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import bootstrap from 'bootstrap/dist/js/bootstrap.bundle.min.js';

window.bootstrap = bootstrap;

const WaitingForAdminApproval = () => {
  const toastRef = useRef(null);

  useEffect(() => {
    if (toastRef.current) {
      const toast = new window.bootstrap.Toast(toastRef.current);
      toast.show();
    }
  }, []);

  return (
    <div className="d-flex flex-column vh-100 justify-content-center align-items-center bg-light position-relative">
      {/* Toast at Top Center */}
      <div
        className="toast-container position-fixed top-0 start-50 translate-middle-x p-3"
        style={{ zIndex: 1055 }}
      >
        <div
          className="toast bg-dark text-white"
          ref={toastRef}
          role="alert"
          aria-live="assertive"
          aria-atomic="true"
        >
          <div className="toast-header bg-dark text-white border-0">
            <strong className="me-auto fs-3">Success</strong>
            <small>Now</small>
            <button
              type="button"
              className="btn-close btn-close-white"
              data-bs-dismiss="toast"
              aria-label="Close"
            ></button>
          </div>
          <div className="toast-body fs-4">
            Request sent successfully!
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="text-center p-4 border rounded shadow bg-white p-5">
        {/* <div className="spinner-border text-primary mb-4" role="status">
          <span className="visually-hidden">Loading...</span>
        </div> */}
        <h2 className="mb-3">Waiting for Admin Approval</h2>
        <p className="text-muted fs-4">
          Your account has been submitted successfully. Please wait while an admin reviews your request.
        </p>
        <p className="text-secondary fs-4">
          You can visit again later to check the status of your request.
        </p>
      </div>
    </div>
  );
};

export default WaitingForAdminApproval;
