'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { CreateAddressRequestSchema } from '@ecom/shared-schemas';

/**
 * AddressForm Component
 * 
 * Reusable address form with validation.
 * Used in checkout and profile pages.
 * 
 * @param {Object} props
 * @param {Object} [props.defaultValues] - Default form values (for edit mode)
 * @param {Function} props.onSubmit - Submit handler
 * @param {Function} [props.onCancel] - Cancel handler
 * @param {boolean} [props.isLoading] - Loading state
 * @param {'create'|'edit'} [props.mode] - Form mode ('create' or 'edit')
 */
export function AddressForm({ defaultValues, onSubmit, onCancel, isLoading = false, mode = 'create' }) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(CreateAddressRequestSchema),
    defaultValues: defaultValues || {
      country: 'IN',
      type: 'HOME',
      isDefault: false,
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* Full Name */}
      <div>
        <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">
          Full Name
        </label>
        <input
          {...register('fullName')}
          type="text"
          id="fullName"
          placeholder="Recipient name"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-900/20 focus:border-amber-900 transition-all"
        />
        {errors.fullName && (
          <p className="mt-1 text-sm text-red-600">{errors.fullName.message}</p>
        )}
      </div>

      {/* Phone */}
      <div>
        <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
          Phone Number <span className="text-red-500">*</span>
        </label>
        <input
          {...register('phone')}
          type="tel"
          id="phone"
          placeholder="+919876543210"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-900/20 focus:border-amber-900 transition-all"
        />
        {errors.phone && (
          <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>
        )}
      </div>

      {/* Street */}
      <div>
        <label htmlFor="street" className="block text-sm font-medium text-gray-700 mb-1">
          Street Address <span className="text-red-500">*</span>
        </label>
        <input
          {...register('street')}
          type="text"
          id="street"
          placeholder="House/Flat No., Building Name"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-900/20 focus:border-amber-900 transition-all"
        />
        {errors.street && (
          <p className="mt-1 text-sm text-red-600">{errors.street.message}</p>
        )}
      </div>

      {/* Street 2 */}
      <div>
        <label htmlFor="street2" className="block text-sm font-medium text-gray-700 mb-1">
          Street Address Line 2 (Optional)
        </label>
        <input
          {...register('street2')}
          type="text"
          id="street2"
          placeholder="Area, Locality"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-900/20 focus:border-amber-900 transition-all"
        />
        {errors.street2 && (
          <p className="mt-1 text-sm text-red-600">{errors.street2.message}</p>
        )}
      </div>

      {/* City, State, Postal Code */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
            City <span className="text-red-500">*</span>
          </label>
          <input
            {...register('city')}
            type="text"
            id="city"
            placeholder="City"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-900/20 focus:border-amber-900 transition-all"
          />
          {errors.city && (
            <p className="mt-1 text-sm text-red-600">{errors.city.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-1">
            State <span className="text-red-500">*</span>
          </label>
          <input
            {...register('state')}
            type="text"
            id="state"
            placeholder="State"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-900/20 focus:border-amber-900 transition-all"
          />
          {errors.state && (
            <p className="mt-1 text-sm text-red-600">{errors.state.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="postalCode" className="block text-sm font-medium text-gray-700 mb-1">
            Postal Code <span className="text-red-500">*</span>
          </label>
          <input
            {...register('postalCode')}
            type="text"
            id="postalCode"
            placeholder="PIN Code"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-900/20 focus:border-amber-900 transition-all"
          />
          {errors.postalCode && (
            <p className="mt-1 text-sm text-red-600">{errors.postalCode.message}</p>
          )}
        </div>
      </div>

      {/* Country */}
      <div>
        <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-1">
          Country
        </label>
        <select
          {...register('country')}
          id="country"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-900/20 focus:border-amber-900 transition-all"
        >
          <option value="IN">India</option>
          <option value="US">United States</option>
        </select>
        {errors.country && (
          <p className="mt-1 text-sm text-red-600">{errors.country.message}</p>
        )}
      </div>

      {/* Address Type */}
      <div>
        <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
          Address Type
        </label>
        <select
          {...register('type')}
          id="type"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-900/20 focus:border-amber-900 transition-all"
        >
          <option value="HOME">Home</option>
          <option value="WORK">Work</option>
          <option value="OTHER">Other</option>
        </select>
        {errors.type && (
          <p className="mt-1 text-sm text-red-600">{errors.type.message}</p>
        )}
      </div>

      {/* Set as Default */}
      <div className="flex items-center">
        <input
          {...register('isDefault')}
          type="checkbox"
          id="isDefault"
          className="w-4 h-4 text-amber-900 border-gray-300 rounded focus:ring-amber-900"
        />
        <label htmlFor="isDefault" className="ml-2 text-sm text-gray-700">
          Set as default address
        </label>
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-4">
        <button
          type="submit"
          disabled={isLoading}
          className="flex-1 bg-amber-900 text-white font-medium py-2.5 px-4 rounded-lg hover:bg-amber-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading 
            ? (mode === 'edit' ? 'Updating...' : 'Saving...') 
            : (mode === 'edit' ? 'Update Address' : 'Save Address')}
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

