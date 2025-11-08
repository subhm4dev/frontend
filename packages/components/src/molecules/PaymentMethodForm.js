'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';

/**
 * PaymentMethodForm Component
 * 
 * Form for entering payment method details (card or UPI).
 * Used in checkout page.
 */
export function PaymentMethodForm({ defaultPaymentMethod, onSubmit, onCancel, isLoading = false }) {
  const [paymentType, setPaymentType] = useState(defaultPaymentMethod?.type || 'CARD');
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm({
    defaultValues: defaultPaymentMethod || {
      type: 'CARD',
      cardNumber: '',
      expiryMonth: '',
      expiryYear: '',
      cvv: '',
      upiId: '',
    },
  });

  const handleFormSubmit = (data) => {
    onSubmit({
      type: paymentType,
      ...data,
    });
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      {/* Payment Type Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Payment Method
        </label>
        <div className="flex gap-4">
          <label className="flex items-center">
            <input
              type="radio"
              value="CARD"
              checked={paymentType === 'CARD'}
              onChange={(e) => setPaymentType(e.target.value)}
              className="w-4 h-4 text-amber-900 border-gray-300 focus:ring-amber-900"
            />
            <span className="ml-2 text-sm text-gray-700">Card</span>
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              value="UPI"
              checked={paymentType === 'UPI'}
              onChange={(e) => setPaymentType(e.target.value)}
              className="w-4 h-4 text-amber-900 border-gray-300 focus:ring-amber-900"
            />
            <span className="ml-2 text-sm text-gray-700">UPI</span>
          </label>
        </div>
      </div>

      {paymentType === 'CARD' ? (
        <>
          {/* Card Number */}
          <div>
            <label htmlFor="cardNumber" className="block text-sm font-medium text-gray-700 mb-1">
              Card Number <span className="text-red-500">*</span>
            </label>
            <input
              {...register('cardNumber', {
                required: 'Card number is required',
                pattern: {
                  value: /^\d{13,19}$/,
                  message: 'Invalid card number',
                },
              })}
              type="text"
              id="cardNumber"
              placeholder="1234 5678 9012 3456"
              maxLength={19}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-900/20 focus:border-amber-900 transition-all"
            />
            {errors.cardNumber && (
              <p className="mt-1 text-sm text-red-600">{errors.cardNumber.message}</p>
            )}
          </div>

          {/* Expiry and CVV */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="expiryMonth" className="block text-sm font-medium text-gray-700 mb-1">
                Expiry Month <span className="text-red-500">*</span>
              </label>
              <input
                {...register('expiryMonth', {
                  required: 'Expiry month is required',
                  min: { value: 1, message: 'Invalid month' },
                  max: { value: 12, message: 'Invalid month' },
                })}
                type="number"
                id="expiryMonth"
                placeholder="MM"
                min="1"
                max="12"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-900/20 focus:border-amber-900 transition-all"
              />
              {errors.expiryMonth && (
                <p className="mt-1 text-sm text-red-600">{errors.expiryMonth.message}</p>
              )}
            </div>
            <div>
              <label htmlFor="expiryYear" className="block text-sm font-medium text-gray-700 mb-1">
                Expiry Year <span className="text-red-500">*</span>
              </label>
              <input
                {...register('expiryYear', {
                  required: 'Expiry year is required',
                  min: { value: new Date().getFullYear(), message: 'Card expired' },
                })}
                type="number"
                id="expiryYear"
                placeholder="YYYY"
                min={new Date().getFullYear()}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-900/20 focus:border-amber-900 transition-all"
              />
              {errors.expiryYear && (
                <p className="mt-1 text-sm text-red-600">{errors.expiryYear.message}</p>
              )}
            </div>
          </div>

          {/* CVV */}
          <div>
            <label htmlFor="cvv" className="block text-sm font-medium text-gray-700 mb-1">
              CVV <span className="text-red-500">*</span>
            </label>
            <input
              {...register('cvv', {
                required: 'CVV is required',
                pattern: {
                  value: /^\d{3,4}$/,
                  message: 'Invalid CVV',
                },
              })}
              type="text"
              id="cvv"
              placeholder="123"
              maxLength={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-900/20 focus:border-amber-900 transition-all"
            />
            {errors.cvv && (
              <p className="mt-1 text-sm text-red-600">{errors.cvv.message}</p>
            )}
          </div>
        </>
      ) : (
        <>
          {/* UPI ID */}
          <div>
            <label htmlFor="upiId" className="block text-sm font-medium text-gray-700 mb-1">
              UPI ID <span className="text-red-500">*</span>
            </label>
            <input
              {...register('upiId', {
                required: 'UPI ID is required',
                pattern: {
                  value: /^[\w.-]+@[\w.-]+$/,
                  message: 'Invalid UPI ID (e.g., name@paytm)',
                },
              })}
              type="text"
              id="upiId"
              placeholder="name@paytm"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-900/20 focus:border-amber-900 transition-all"
            />
            {errors.upiId && (
              <p className="mt-1 text-sm text-red-600">{errors.upiId.message}</p>
            )}
          </div>
        </>
      )}

      {/* Actions */}
      <div className="flex gap-3 pt-4">
        <button
          type="submit"
          disabled={isLoading}
          className="flex-1 bg-amber-900 text-white font-medium py-2.5 px-4 rounded-lg hover:bg-amber-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Processing...' : 'Continue'}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            className="px-6 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}

