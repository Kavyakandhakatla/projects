import React, { useState, useEffect } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import axios from "axios";
import { useAuth } from "./AuthContext";
import "./style.css";

export default function BookingForm({
  provider,
  serviceType,
  onClose,
  isEditMode = false,
  existingBooking = null,
}) {
  const { user } = useAuth();
  const [date, setDate] = useState(null);
  const [location, setLocation] = useState("");
  const [sqft, setSqft] = useState("");
  const [hours, setHours] = useState("");
  const [specialRequest, setSpecialRequest] = useState("");
  const [totalCost, setTotalCost] = useState(null);
  const [errors, setErrors] = useState({});
  const [providerData, setProviderData] = useState(provider);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const selectedService = serviceType || existingBooking?.service_type;
  

  useEffect(() => {
    if (isEditMode && existingBooking) {
      setDate(new Date(existingBooking.date));
      setLocation(existingBooking.location);
      setSqft(existingBooking.sqft || "");
      setHours(existingBooking.estimated_hours || "");
      setSpecialRequest(existingBooking.special_request || "");

      axios
        .get(`/api/auth/provider/${existingBooking.provider_id}`)
        .then((res) => {
          setProviderData(res.data);
        })
        .catch((err) => console.error("Error fetching provider data", err));
    } else if (provider) {
      setProviderData(provider);
    }
  }, [existingBooking, provider, isEditMode]);

  const rate =
    selectedService === "Snow Removal"
      ? providerData?.snowrate || 0
      : providerData?.lawnrate || 0;

  useEffect(() => {
    const sqftValue = parseFloat(sqft || 0);
    const hoursValue = parseFloat(hours || 0);
    const base =
      selectedService === "Lawn Mowing"
        ? sqftValue * rate
        : hoursValue * rate;

    if (base > 0) {
      const withAdmin = base + base * 0.05;
      const withTax = withAdmin + withAdmin * 0.05;
      setTotalCost(withTax.toFixed(2));
    } else {
      setTotalCost(null);
    }
  }, [sqft, hours, rate, selectedService]);

  const validateForm = () => {
    const newErrors = {};
    if (!date) newErrors.date = "Please select a date.";
    if (!location.trim()) newErrors.location = "Location is required.";
    if (selectedService === "Lawn Mowing" && (!sqft || sqft <= 0))
      newErrors.sqft = "Enter valid sqft.";
    if (selectedService === "Snow Removal" && (!hours || hours <= 0))
      newErrors.hours = "Enter valid hours.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const submitBooking = async () => {
    const sqftValue = parseFloat(sqft || 0);
    const hoursValue = parseFloat(hours || 0);
    const rateValue = parseFloat(rate || 0);

    const baseCost =
      selectedService === "Lawn Mowing"
        ? sqftValue * rateValue
        : hoursValue * rateValue;

    const adminCommission = baseCost * 0.05;
    const tax = (baseCost + adminCommission) * 0.05;
    const totalCostCalculated = baseCost + adminCommission + tax;

    const bookingDetails = {
      customerId: user.id,
      providerId: providerData?.id || existingBooking?.provider_id,
      serviceType: selectedService,
      location,
      date: date?.toISOString(),
      estimatedHours: selectedService === "Snow Removal" ? hoursValue : null,
      sqft: selectedService === "Lawn Mowing" ? sqftValue : null,
      specialRequest,
      rate: rateValue,
      adminCommission,
      tax,
      totalCost: totalCostCalculated,
    };

    try {
      if (isEditMode && existingBooking?.id) {
        await axios.put(
          `https://snowmow.online/api/bookings/update/${existingBooking.id}`,
          bookingDetails
        );
        alert("Booking updated successfully!");
      } else {
        await axios.post("https://snowmow.online/api/bookings/request", bookingDetails);
        alert("Booking requested successfully!");
      }
      onClose();
    } catch (err) {
      console.error("Error submitting:", err);
      alert("Submission failed.");
    }
  };

  const handleSubmit = () => {
    if (!providerData?.id && !existingBooking?.provider_id) {
      alert("Provider data is missing. Please try again.");
      return;
    }
    if (!validateForm()) return;
    if (isEditMode) {
      setShowConfirmModal(true);
    } else {
      submitBooking();
    }
  };

  return (
    <div className="booking-overlay">
      <div className="booking-container">
        <div className="booking-left">
          <h2>{isEditMode ? "Edit Booking" : "Booking with"}</h2>
          <h3>{providerData?.name}</h3>
          <p>
            <strong>Service:</strong> {selectedService}
          </p>
          <p>
            <strong>Rate:</strong> ${rate}{" "}
            {selectedService === "Snow Removal" ? "/hr" : "/sq ft"}
          </p>
        </div>

        <div className="booking-right">
          <h3>Enter Booking Details</h3>

          <div className="form-group">
            <label>Select Date</label>
            <DatePicker
              selected={date}
              onChange={(d) => setDate(d)}
              minDate={new Date()}
              className="form-control"
            />
            {errors.date && <div className="error-text">{errors.date}</div>}
          </div>

          <div className="form-group">
            <label>Location</label>
            <input
              className="form-control"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
            {errors.location && <div className="error-text">{errors.location}</div>}
          </div>

          {selectedService === "Lawn Mowing" && (
            <div className="form-group">
              <label>Square Feet</label>
              <input
                type="number"
                className="form-control"
                value={sqft}
                onChange={(e) => setSqft(e.target.value)}
              />
              {errors.sqft && <div className="error-text">{errors.sqft}</div>}
            </div>
          )}

          {selectedService === "Snow Removal" && (
            <div className="form-group">
              <label>Estimated Hours</label>
              <input
                type="number"
                className="form-control"
                value={hours}
                onChange={(e) => setHours(e.target.value)}
              />
              {errors.hours && <div className="error-text">{errors.hours}</div>}
            </div>
          )}

          <div className="form-group">
            <label>Special Request (Optional)</label>
            <textarea
              className="form-control"
              value={specialRequest}
              onChange={(e) => setSpecialRequest(e.target.value)}
            />
          </div>

          {totalCost && (
            <div className="total-summary">
              Total Cost: <strong>${totalCost}</strong>
            </div>
          )}

          <div className="button-group">
            <button className="confirm-btn" onClick={handleSubmit}>
              {isEditMode ? "Update Booking" : "Confirm Booking"}
            </button>
            <button className="cancel-btn" onClick={onClose}>
              Cancel
            </button>
          </div>
        </div>
      </div>

      {showConfirmModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Confirm Update</h3>
            <p>Are you sure you want to update this booking?</p>
            <div className="button-group">
              <button
                className="confirm-btn"
                onClick={() => {
                  submitBooking();
                  setShowConfirmModal(false);
                }}
              >
                Yes, Update
              </button>
              <button
                className="cancel-btn"
                onClick={() => setShowConfirmModal(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
