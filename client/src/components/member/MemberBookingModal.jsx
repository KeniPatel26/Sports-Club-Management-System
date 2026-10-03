import React, { useState } from 'react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import Select from '../ui/Select';
import Badge from '../ui/Badge';
import {
  Calendar,
  Clock,
  ShieldCheck,
  Check,
  CheckCircle2,
  CreditCard,
  QrCode,
  Banknote,
  Sparkles,
  Info,
} from 'lucide-react';

export const MemberBookingModal = ({
  isOpen,
  onClose,
  court,
  date,
  slotTime,
  userDiscount = 100,
  userPlanName = 'GOLD',
  onConfirmBooking,
  submitting = false,
}) => {
  const [rentEquipment, setRentEquipment] = useState([]);
  const [paymentMethod, setPaymentMethod] = useState('UPI');

  if (!court || !slotTime) return null;

  const baseRate = court.hourlyRate || 600;
  const discountAmount = (baseRate * userDiscount) / 100;
  const equipmentFee = rentEquipment.length * 100;
  const finalTotal = Math.max(0, baseRate - discountAmount) + equipmentFee;

  const toggleEquipment = (item) => {
    if (rentEquipment.includes(item)) {
      setRentEquipment(rentEquipment.filter((e) => e !== item));
    } else {
      setRentEquipment([...rentEquipment, item]);
    }
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    onConfirmBooking({
      courtId: court._id,
      date,
      startTime: slotTime,
      equipmentRented: rentEquipment,
      paymentMethod: finalTotal === 0 ? 'MEMBERSHIP_INCLUDED' : paymentMethod,
    });
  };

  const availableAddons = court.equipmentAvailable || [
    'Wilson Pro Racket Rental (₹100/session)',
    'Match Balls Championship Tube (₹100)',
    'Overgrip Replacement Tape (₹50)',
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Review & Submit Court Booking"
      subtitle={`Session: ${date} at ${slotTime} (60 Minutes)`}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={submitting}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleFormSubmit} loading={submitting}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
              <CheckCircle2 size={16} /> Confirm & Submit Reservation
            </span>
          </Button>
        </>
      }
    >
      <form onSubmit={handleFormSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.15rem' }}>
        {/* Court Summary */}
        <div
          style={{
            padding: '0.9rem',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'var(--color-surface-soft)',
            border: '1px solid var(--card-border)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.85rem',
          }}
        >
          {court.image && (
            <img
              src={court.image}
              alt={court.name}
              style={{ width: '64px', height: '64px', borderRadius: 'var(--radius-md)', objectFit: 'cover' }}
            />
          )}
          <div style={{ flex: 1 }}>
            <h5 style={{ margin: 0, fontWeight: 700, fontSize: '0.95rem', color: 'var(--color-primary)' }}>
              {court.name}
            </h5>
            <div style={{ display: 'flex', gap: '0.4rem', marginTop: '0.3rem' }}>
              <Badge variant="info">{court.type}</Badge>
              <Badge variant={court.isIndoor ? 'purple' : 'active'}>
                {court.isIndoor ? 'Indoor AC' : 'Outdoor Floodlit'}
              </Badge>
            </div>
          </div>
        </div>

        {/* Date & Time Confirmation Pill */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0.75rem 1rem',
            backgroundColor: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-md)',
            fontSize: '0.875rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 600 }}>
            <Calendar size={15} color="var(--primary)" />
            <span>Date: {date}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 600 }}>
            <Clock size={15} color="var(--primary)" />
            <span>Time: {slotTime} (1 Hour)</span>
          </div>
        </div>

        {/* Optional Gear / Equipment Add-ons */}
        <div>
          <label style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--color-primary)', marginBottom: '0.4rem', display: 'block' }}>
            Optional Equipment & Gear Add-ons
          </label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            {availableAddons.map((addon) => {
              const isChecked = rentEquipment.includes(addon);
              return (
                <label
                  key={addon}
                  onClick={() => toggleEquipment(addon)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.65rem',
                    padding: '0.55rem 0.85rem',
                    borderRadius: 'var(--radius-md)',
                    border: isChecked ? '1px solid var(--primary)' : '1px solid var(--border-subtle)',
                    backgroundColor: isChecked ? 'var(--primary-light)' : 'var(--bg-card)',
                    cursor: 'pointer',
                    fontSize: '0.825rem',
                    fontWeight: isChecked ? 600 : 400,
                    transition: 'var(--transition)',
                  }}
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => {}}
                    style={{ accentColor: 'var(--primary)' }}
                  />
                  <span>{addon}</span>
                </label>
              );
            })}
          </div>
        </div>

        {/* Price Breakdown Calculation Box */}
        <div
          style={{
            padding: '1rem',
            borderRadius: 'var(--radius-md)',
            backgroundColor: '#F8FAFC',
            border: '1px solid var(--card-border)',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.4rem',
            fontSize: '0.875rem',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
            <span>Standard Court Fee (1 Hr):</span>
            <span>₹{baseRate}</span>
          </div>

          {userDiscount > 0 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--success-text)', fontWeight: 600 }}>
              <span>{userPlanName} Member Discount ({userDiscount}%):</span>
              <span>-₹{discountAmount}</span>
            </div>
          )}

          {equipmentFee > 0 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
              <span>Gear Rental Add-ons:</span>
              <span>+₹{equipmentFee}</span>
            </div>
          )}

          <div
            style={{
              borderTop: '1px solid var(--border-color)',
              paddingTop: '0.5rem',
              marginTop: '0.2rem',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              fontWeight: 800,
              fontSize: '1.05rem',
            }}
          >
            <span>Total Payable:</span>
            <span style={{ color: 'var(--primary)', fontSize: '1.2rem' }}>
              {finalTotal === 0 ? '₹0 (Included in Membership)' : `₹${finalTotal}`}
            </span>
          </div>
        </div>

        {/* Payment Method Selector (if finalTotal > 0) */}
        {finalTotal > 0 ? (
          <Select
            label="Payment Method"
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value)}
            options={[
              { value: 'UPI', label: 'Instant UPI (GPay / PhonePe / Paytm)' },
              { value: 'CARD', label: 'Credit or Debit Card' },
              { value: 'CASH', label: 'Pay at Club Front Desk' },
            ]}
          />
        ) : (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.65rem 0.85rem',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--color-success-bg)',
              color: 'var(--color-success-text)',
              fontSize: '0.8rem',
              fontWeight: 600,
            }}
          >
            <ShieldCheck size={18} />
            <span>Full 100% complimentary coverage provided by your VIP Membership.</span>
          </div>
        )}
      </form>
    </Modal>
  );
};

export default MemberBookingModal;
