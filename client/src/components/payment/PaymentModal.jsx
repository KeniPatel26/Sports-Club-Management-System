import React, { useState, useEffect } from 'react';
import {
  CheckCircle2,
  XCircle,
  CreditCard,
  QrCode,
  Banknote,
  ShieldCheck,
  ArrowRight,
  RefreshCw,
  Copy,
  Check,
  Sparkles,
  Lock,
} from 'lucide-react';
import paymentService from '../../services/paymentService';
import { useToast } from '../../context/ToastContext';

export const PaymentModal = ({
  isOpen,
  onClose,
  amount = 0,
  purpose = 'COURT_BOOKING',
  referenceId,
  title,
  subtitle,
  itemDetails,
  allowCash = false,
  onSuccess,
  onFailure,
}) => {
  const { toastSuccess, toastError } = useToast();

  const [step, setStep] = useState('SELECT'); // 'SELECT' | 'SIMULATE' | 'SUCCESS' | 'FAILED'
  const [paymentMethod, setPaymentMethod] = useState('UPI');
  const [upiId, setUpiId] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentPayment, setCurrentPayment] = useState(null);
  const [copiedTxn, setCopiedTxn] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Reset state on open/reference change
  useEffect(() => {
    if (isOpen) {
      setStep('SELECT');
      setPaymentMethod('UPI');
      setUpiId('athlete@okhdfcbank');
      setCardNumber('4532 •••• •••• 8821');
      setCardExpiry('12/28');
      setCardCvv('782');
      setCurrentPayment(null);
      setErrorMsg('');
      setLoading(false);
    }
  }, [isOpen, referenceId]);

  if (!isOpen) return null;

  const purposeLabels = {
    COURT_BOOKING: 'Court Reservation',
    MEMBERSHIP: 'Club Membership Plan',
    SHOP_ORDER: 'Pro Shop Gear Order',
    CANTEEN_ORDER: 'Canteen & Bar Bill',
    OTHER: 'Club Service',
  };

  const purposeSuccessLabels = {
    COURT_BOOKING: 'Court Booking Confirmed!',
    MEMBERSHIP: 'Membership Activated!',
    SHOP_ORDER: 'Pro Shop Order Placed!',
    CANTEEN_ORDER: 'Canteen Bill Settled & Tab Closed!',
    OTHER: 'Payment Completed!',
  };

  const handleCreatePaymentIntent = async () => {
    if (!referenceId) {
      toastError('Missing booking/order reference ID');
      return;
    }

    try {
      setLoading(true);
      setErrorMsg('');
      const res = await paymentService.createPayment({
        purpose,
        referenceId,
        paymentMethod,
        notes: `Demo checkout for ${purposeLabels[purpose] || purpose}`,
      });

      if (res.success && res.data) {
        setCurrentPayment(res.data);
        setStep('SIMULATE');
      } else {
        throw new Error(res.message || 'Failed to initiate payment');
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Payment initiation failed';
      setErrorMsg(msg);
      toastError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmSimulation = async (simulateSuccess) => {
    if (!currentPayment?._id) return;

    try {
      setLoading(true);
      setErrorMsg('');

      const res = await paymentService.confirmPayment(currentPayment._id, {
        simulateSuccess,
        paymentMethod,
      });

      if (simulateSuccess && res.success) {
        setCurrentPayment(res.data);
        setStep('SUCCESS');
        toastSuccess('Payment successful!');
        if (onSuccess) onSuccess(res.data);
      } else {
        setCurrentPayment(res.data || currentPayment);
        setStep('FAILED');
        setErrorMsg(res.message || 'Payment declined by bank simulator');
        toastError('Payment failed');
        if (onFailure) onFailure(res.data);
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Payment processing failed';
      setStep('FAILED');
      setErrorMsg(msg);
      toastError(msg);
      if (onFailure) onFailure(err);
    } finally {
      setLoading(false);
    }
  };

  const copyTransactionId = () => {
    if (currentPayment?.transactionId) {
      navigator.clipboard.writeText(currentPayment.transactionId);
      setCopiedTxn(true);
      setTimeout(() => setCopiedTxn(false), 2000);
    }
  };

  const handleClose = () => {
    if (step === 'SUCCESS' && onSuccess && currentPayment) {
      onSuccess(currentPayment);
    }
    onClose();
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        backgroundColor: 'rgba(15, 23, 42, 0.75)',
        backdropFilter: 'blur(6px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
        animation: 'fadeIn 0.2s ease-out',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget && !loading) handleClose();
      }}
    >
      <div
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '20px',
          width: '100%',
          maxWidth: '520px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          overflow: 'hidden',
          border: '1px solid #E2E8F0',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
        }}
      >
        {/* Header Ribbon */}
        <div
          style={{
            background: 'linear-gradient(135deg, #17263B 0%, #1E3A8A 100%)',
            color: '#FFFFFF',
            padding: '1.5rem 1.75rem',
            position: 'relative',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <span
                style={{
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  backgroundColor: 'rgba(255, 255, 255, 0.15)',
                  padding: '3px 9px',
                  borderRadius: '12px',
                  display: 'inline-block',
                  marginBottom: '0.4rem',
                }}
              >
                {purposeLabels[purpose] || 'Payment Portal'}
              </span>
              <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: '#FFFFFF' }}>
                {title || 'Complete Payment'}
              </h2>
              <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.82rem', color: '#94A3B8' }}>
                {subtitle || 'Secure, real-time verified transaction'}
              </p>
            </div>

            <button
              type="button"
              onClick={handleClose}
              disabled={loading}
              style={{
                background: 'rgba(255, 255, 255, 0.12)',
                border: 'none',
                color: '#FFFFFF',
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: loading ? 'not-allowed' : 'pointer',
                fontSize: '1rem',
                fontWeight: 700,
              }}
            >
              ✕
            </button>
          </div>

          {/* Amount Badge */}
          <div
            style={{
              marginTop: '1.2rem',
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(8px)',
              borderRadius: '14px',
              padding: '0.85rem 1.25rem',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              border: '1px solid rgba(255, 255, 255, 0.15)',
            }}
          >
            <div>
              <span style={{ fontSize: '0.75rem', color: '#CBD5E1', display: 'block' }}>Total Payable Amount</span>
              <strong style={{ fontSize: '1.65rem', fontWeight: 900, color: '#38BDF8', letterSpacing: '-0.02em' }}>
                ₹{Number(amount || currentPayment?.amount || 0).toLocaleString('en-IN')}
              </strong>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#86EFAC', fontSize: '0.78rem', fontWeight: 600 }}>
              <ShieldCheck size={16} /> 256-Bit Encrypted
            </div>
          </div>
        </div>

        {/* Modal Body Based on Current Step */}
        <div style={{ padding: '1.75rem', maxHeight: '70vh', overflowY: 'auto' }}>
          {errorMsg && step !== 'FAILED' && (
            <div
              style={{
                backgroundColor: '#FEF2F2',
                color: '#991B1B',
                padding: '0.75rem 1rem',
                borderRadius: '10px',
                border: '1px solid #F87171',
                fontSize: '0.85rem',
                marginBottom: '1.25rem',
              }}
            >
              {errorMsg}
            </div>
          )}

          {/* ========================================================= */}
          {/* STEP 1: METHOD SELECTION */}
          {/* ========================================================= */}
          {step === 'SELECT' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {/* Optional Item Details Card */}
              {itemDetails && (
                <div
                  style={{
                    backgroundColor: '#F8FAFC',
                    borderRadius: '12px',
                    padding: '0.85rem 1rem',
                    border: '1px solid #E2E8F0',
                    fontSize: '0.85rem',
                  }}
                >
                  <div style={{ fontWeight: 700, color: '#1E293B', marginBottom: '0.35rem' }}>Booking & Cart Summary</div>
                  {Object.entries(itemDetails).map(([key, val]) => (
                    <div key={key} style={{ display: 'flex', justifyContent: 'space-between', color: '#64748B', margin: '0.2rem 0' }}>
                      <span style={{ textTransform: 'capitalize' }}>{key.replace(/([A-Z])/g, ' $1')}:</span>
                      <strong style={{ color: '#0F172A' }}>{String(val)}</strong>
                    </div>
                  ))}
                </div>
              )}

              {/* Payment Methods */}
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#1E293B', marginBottom: '0.6rem' }}>
                  Select Payment Method
                </label>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                  {/* UPI Option */}
                  <label
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.85rem',
                      padding: '0.85rem 1rem',
                      borderRadius: '12px',
                      border: paymentMethod === 'UPI' ? '2px solid #2563EB' : '1px solid #E2E8F0',
                      backgroundColor: paymentMethod === 'UPI' ? '#EFF6FF' : '#FFFFFF',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="UPI"
                      checked={paymentMethod === 'UPI'}
                      onChange={() => setPaymentMethod('UPI')}
                      style={{ accentColor: '#2563EB' }}
                    />
                    <div
                      style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '8px',
                        backgroundColor: '#DBEAFE',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#2563EB',
                      }}
                    >
                      <QrCode size={20} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <strong style={{ display: 'block', fontSize: '0.9rem', color: '#0F172A' }}>UPI (Instant Transfer)</strong>
                      <span style={{ fontSize: '0.75rem', color: '#64748B' }}>Google Pay, PhonePe, Paytm, BHIM</span>
                    </div>
                  </label>

                  {/* Card Option */}
                  <label
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.85rem',
                      padding: '0.85rem 1rem',
                      borderRadius: '12px',
                      border: paymentMethod === 'CARD' ? '2px solid #2563EB' : '1px solid #E2E8F0',
                      backgroundColor: paymentMethod === 'CARD' ? '#EFF6FF' : '#FFFFFF',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="CARD"
                      checked={paymentMethod === 'CARD'}
                      onChange={() => setPaymentMethod('CARD')}
                      style={{ accentColor: '#2563EB' }}
                    />
                    <div
                      style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '8px',
                        backgroundColor: '#E0E7FF',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#4F46E5',
                      }}
                    >
                      <CreditCard size={20} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <strong style={{ display: 'block', fontSize: '0.9rem', color: '#0F172A' }}>Credit / Debit Card</strong>
                      <span style={{ fontSize: '0.75rem', color: '#64748B' }}>Visa, MasterCard, RuPay</span>
                    </div>
                  </label>

                  {/* Cash Option (Counter/Staff only) */}
                  {allowCash && (
                    <label
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.85rem',
                        padding: '0.85rem 1rem',
                        borderRadius: '12px',
                        border: paymentMethod === 'CASH' ? '2px solid #16A34A' : '1px solid #E2E8F0',
                        backgroundColor: paymentMethod === 'CASH' ? '#F0FDF4' : '#FFFFFF',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                      }}
                    >
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="CASH"
                        checked={paymentMethod === 'CASH'}
                        onChange={() => setPaymentMethod('CASH')}
                        style={{ accentColor: '#16A34A' }}
                      />
                      <div
                        style={{
                          width: '36px',
                          height: '36px',
                          borderRadius: '8px',
                          backgroundColor: '#DCFCE7',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#16A34A',
                        }}
                      >
                        <Banknote size={20} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <strong style={{ display: 'block', fontSize: '0.9rem', color: '#0F172A' }}>Cash at Counter</strong>
                        <span style={{ fontSize: '0.75rem', color: '#64748B' }}>Collect direct physical currency note</span>
                      </div>
                    </label>
                  )}
                </div>
              </div>

              {/* Dynamic Inputs for chosen method */}
              {paymentMethod === 'UPI' && (
                <div style={{ backgroundColor: '#F8FAFC', padding: '1rem', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
                    Virtual Payment Address (VPA / UPI ID)
                  </label>
                  <input
                    type="text"
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                    placeholder="name@upi"
                    style={{
                      width: '100%',
                      padding: '0.65rem 0.85rem',
                      borderRadius: '8px',
                      border: '1px solid #CBD5E1',
                      fontSize: '0.9rem',
                      boxSizing: 'border-box',
                    }}
                  />
                  <div style={{ display: 'flex', gap: '0.35rem', marginTop: '0.5rem', flexWrap: 'wrap' }}>
                    {['@okhdfcbank', '@oksbi', '@okicici', '@paytm'].map((handle) => (
                      <button
                        key={handle}
                        type="button"
                        onClick={() => setUpiId((prev) => (prev.split('@')[0] || 'member') + handle)}
                        style={{
                          fontSize: '0.72rem',
                          backgroundColor: '#FFFFFF',
                          border: '1px solid #CBD5E1',
                          padding: '2px 6px',
                          borderRadius: '6px',
                          color: '#475569',
                          cursor: 'pointer',
                        }}
                      >
                        {handle}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {paymentMethod === 'CARD' && (
                <div style={{ backgroundColor: '#F8FAFC', padding: '1rem', borderRadius: '12px', border: '1px solid #E2E8F0', display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: '0.2rem' }}>Card Number</label>
                    <input
                      type="text"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      placeholder="4532 0000 0000 0000"
                      style={{ width: '100%', padding: '0.55rem 0.8rem', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.88rem', boxSizing: 'border-box' }}
                    />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: '0.2rem' }}>Expiry MM/YY</label>
                      <input
                        type="text"
                        value={cardExpiry}
                        onChange={(e) => setCardExpiry(e.target.value)}
                        placeholder="12/28"
                        style={{ width: '100%', padding: '0.55rem 0.8rem', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.88rem', boxSizing: 'border-box' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: '0.2rem' }}>CVV</label>
                      <input
                        type="password"
                        value={cardCvv}
                        onChange={(e) => setCardCvv(e.target.value)}
                        placeholder="•••"
                        maxLength={4}
                        style={{ width: '100%', padding: '0.55rem 0.8rem', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.88rem', boxSizing: 'border-box' }}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Proceed CTA */}
              <button
                type="button"
                onClick={handleCreatePaymentIntent}
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '0.9rem',
                  backgroundColor: '#2563EB',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '12px',
                  fontWeight: 800,
                  fontSize: '1rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  boxShadow: '0 4px 12px rgba(37, 99, 235, 0.28)',
                  transition: 'all 0.2s ease',
                }}
              >
                {loading ? <RefreshCw className="animate-spin" size={20} /> : (
                  <>
                    Pay ₹{Number(amount).toLocaleString('en-IN')} <ArrowRight size={18} />
                  </>
                )}
              </button>
            </div>
          )}

          {/* ========================================================= */}
          {/* STEP 2: DEMO PAYMENT SIMULATOR */}
          {/* ========================================================= */}
          {step === 'SIMULATE' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', textAlign: 'center' }}>
              <div
                style={{
                  backgroundColor: '#FEF3C7',
                  border: '1px solid #F59E0B',
                  borderRadius: '12px',
                  padding: '1rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  textAlign: 'left',
                }}
              >
                <Sparkles size={24} color="#D97706" style={{ flexShrink: 0 }} />
                <div>
                  <strong style={{ display: 'block', color: '#92400E', fontSize: '0.88rem' }}>
                    Demo Payment Gateway Sandbox
                  </strong>
                  <span style={{ fontSize: '0.78rem', color: '#B45309' }}>
                    Simulate real-time bank response to verify immediate state transitions and automated inventory / slot locking.
                  </span>
                </div>
              </div>

              <div style={{ padding: '1rem', border: '1px solid #E2E8F0', borderRadius: '12px', backgroundColor: '#F8FAFC' }}>
                <span style={{ fontSize: '0.8rem', color: '#64748B', display: 'block' }}>Payment Intent ID</span>
                <code style={{ fontSize: '0.85rem', color: '#0F172A', fontWeight: 700 }}>{currentPayment?._id}</code>
                <div style={{ marginTop: '0.5rem', fontSize: '0.88rem', color: '#334155' }}>
                  Amount: <strong style={{ color: '#2563EB', fontSize: '1.1rem' }}>₹{currentPayment?.amount}</strong> via <strong>{paymentMethod}</strong>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => handleConfirmSimulation(true)}
                  disabled={loading}
                  style={{
                    padding: '0.9rem',
                    backgroundColor: '#16A34A',
                    color: '#FFFFFF',
                    border: 'none',
                    borderRadius: '12px',
                    fontWeight: 800,
                    fontSize: '0.95rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    boxShadow: '0 4px 12px rgba(22, 163, 74, 0.25)',
                  }}
                >
                  {loading ? <RefreshCw className="animate-spin" size={18} /> : (
                    <>
                      <CheckCircle2 size={18} /> Simulate Successful Payment
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => handleConfirmSimulation(false)}
                  disabled={loading}
                  style={{
                    padding: '0.8rem',
                    backgroundColor: '#FFFFFF',
                    color: '#DC2626',
                    border: '1.5px solid #FCA5A5',
                    borderRadius: '12px',
                    fontWeight: 700,
                    fontSize: '0.9rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    cursor: loading ? 'not-allowed' : 'pointer',
                  }}
                >
                  <XCircle size={18} /> Simulate Failed Payment (Slot Released)
                </button>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* STEP 3: PAYMENT SUCCESS RECEIPT */}
          {/* ========================================================= */}
          {step === 'SUCCESS' && (
            <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
              <div
                style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '50%',
                  backgroundColor: '#DCFCE7',
                  color: '#16A34A',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 10px 25px -5px rgba(22, 163, 74, 0.3)',
                }}
              >
                <CheckCircle2 size={36} />
              </div>

              <div>
                <h3 style={{ margin: 0, fontSize: '1.35rem', fontWeight: 900, color: '#0F172A' }}>
                  {purposeSuccessLabels[purpose] || 'Payment Successful!'}
                </h3>
                <span style={{ fontSize: '0.85rem', color: '#16A34A', fontWeight: 700, marginTop: '0.2rem', display: 'block' }}>
                  Status: PAID & ACTIVE
                </span>
              </div>

              {/* Receipt Box */}
              <div
                style={{
                  width: '100%',
                  backgroundColor: '#F8FAFC',
                  borderRadius: '14px',
                  padding: '1.25rem',
                  border: '1px solid #E2E8F0',
                  textAlign: 'left',
                  boxSizing: 'border-box',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.6rem', borderBottom: '1px dashed #CBD5E1', paddingBottom: '0.6rem' }}>
                  <span style={{ fontSize: '0.82rem', color: '#64748B' }}>Amount Paid</span>
                  <strong style={{ fontSize: '1.1rem', color: '#0F172A' }}>
                    ₹{Number(currentPayment?.amount || amount).toLocaleString('en-IN')}
                  </strong>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: '0.82rem', color: '#64748B' }}>Transaction ID</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <code style={{ fontSize: '0.82rem', fontWeight: 700, color: '#1E40AF', backgroundColor: '#EFF6FF', padding: '2px 6px', borderRadius: '4px' }}>
                      {currentPayment?.transactionId || 'TXN-CONFIRMED'}
                    </code>
                    <button
                      type="button"
                      onClick={copyTransactionId}
                      style={{ background: 'none', border: 'none', color: '#64748B', cursor: 'pointer', padding: '2px' }}
                      title="Copy Txn ID"
                    >
                      {copiedTxn ? <Check size={14} color="#16A34A" /> : <Copy size={14} />}
                    </button>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: '0.82rem', color: '#64748B' }}>Payment Method</span>
                  <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#0F172A' }}>{currentPayment?.paymentMethod || paymentMethod}</span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '0.82rem', color: '#64748B' }}>Timestamp</span>
                  <span style={{ fontSize: '0.82rem', color: '#0F172A' }}>
                    {new Date(currentPayment?.paidAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleClose}
                style={{
                  width: '100%',
                  padding: '0.85rem',
                  backgroundColor: '#17263B',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '12px',
                  fontWeight: 800,
                  fontSize: '0.95rem',
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(23, 38, 59, 0.2)',
                  marginTop: '0.5rem',
                }}
              >
                Done / Return to Dashboard
              </button>
            </div>
          )}

          {/* ========================================================= */}
          {/* STEP 4: PAYMENT FAILED */}
          {/* ========================================================= */}
          {step === 'FAILED' && (
            <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
              <div
                style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '50%',
                  backgroundColor: '#FEE2E2',
                  color: '#DC2626',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <XCircle size={36} />
              </div>

              <div>
                <h3 style={{ margin: 0, fontSize: '1.3rem', fontWeight: 900, color: '#991B1B' }}>
                  Payment Failed
                </h3>
                <p style={{ margin: '0.35rem 0 0 0', fontSize: '0.85rem', color: '#64748B' }}>
                  {errorMsg || 'The transaction was declined or simulated as failed.'}
                </p>
              </div>

              <div
                style={{
                  backgroundColor: '#FFF1F2',
                  border: '1px solid #FECDD3',
                  borderRadius: '12px',
                  padding: '0.85rem 1rem',
                  fontSize: '0.82rem',
                  color: '#9F1239',
                  textAlign: 'left',
                  width: '100%',
                  boxSizing: 'border-box',
                }}
              >
                <strong>System Action:</strong> The pending slot / order has been safely cancelled and unlocked for other members.
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', width: '100%', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => setStep('SELECT')}
                  style={{
                    flex: 1,
                    padding: '0.8rem',
                    backgroundColor: '#2563EB',
                    color: '#FFFFFF',
                    border: 'none',
                    borderRadius: '10px',
                    fontWeight: 700,
                    fontSize: '0.9rem',
                    cursor: 'pointer',
                  }}
                >
                  Try Again
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  style={{
                    flex: 1,
                    padding: '0.8rem',
                    backgroundColor: '#F1F5F9',
                    color: '#475569',
                    border: 'none',
                    borderRadius: '10px',
                    fontWeight: 700,
                    fontSize: '0.9rem',
                    cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer Security Note */}
        <div
          style={{
            backgroundColor: '#F8FAFC',
            borderTop: '1px solid #F1F5F9',
            padding: '0.75rem 1.75rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            fontSize: '0.75rem',
            color: '#94A3B8',
          }}
        >
          <Lock size={13} /> Integrated Sports Club Management Payment Core
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;
