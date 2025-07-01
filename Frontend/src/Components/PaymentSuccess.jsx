import { useParams, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import axios from 'axios';

const PaymentSuccess = () => {
  const { bookingId } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const markAsPaid = async () => {
      try {
        await axios.patch(`https://snowmow.online/api/bookings/mark-paid/${bookingId}`);
        console.log("Sending PATCH for booking:", bookingId);
        setTimeout(() => navigate('/my-bookings'), 20);
      } catch (err) {
        console.error("Payment update failed:", err);
      }
    };
    markAsPaid();
  }, [bookingId, navigate]);

  return (
    <div className="text-center mt-5">
      <h2>✅ Payment Successful!</h2>
      <p>Redirecting to your bookings...</p>
    </div>
  );
};

export default PaymentSuccess;
