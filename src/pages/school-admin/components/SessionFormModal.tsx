import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { X, AlertCircle } from '@hugeicons/react';

const sessionSchema = z.object({
  name: z.string().min(1, 'Term name is required'),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().min(1, 'End date is required'),
}).refine(
  (data) => new Date(data.startDate) < new Date(data.endDate),
  {
    message: 'End date must be after start date',
    path: ['endDate'],
  }
);

type SessionFormData = z.infer<typeof sessionSchema>;

interface SessionFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: SessionFormData) => Promise<void>;
  initialData?: SessionFormData & { id?: string };
  isEditing?: boolean;
  isSubmitting?: boolean;
  error?: string | null;
  sessionName?: string;
}

export const SessionFormModal: React.FC<SessionFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  isEditing = false,
  isSubmitting = false,
  error,
  sessionName = '2025/2026',
}) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<SessionFormData>({
    resolver: zodResolver(sessionSchema),
    defaultValues: initialData || {
      name: '',
      startDate: '',
      endDate: '',
    },
  });

  useEffect(() => {
    if (initialData) {
      reset(initialData);
    }
  }, [initialData, reset]);

  const onSubmitForm = async (data: SessionFormData) => {
    await onSubmit(data);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-900 rounded-lg border border-slate-700 max-w-md w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-700">
          <h2 className="text-xl font-bold text-white">
            {isEditing ? 'Edit Term' : 'Add New Term'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit(onSubmitForm)} className="p-6 space-y-4">
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 flex gap-2">
              <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          {/* Session Name Display */}
          <div>
            <label className="text-gray-300 text-sm font-medium block mb-2">Session</label>
            <input
              type="text"
              value={sessionName}
              disabled
              className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-gray-400 cursor-not-allowed"
            />
          </div>

          {/* Term Name */}
          <div>
            <label className="text-gray-300 text-sm font-medium block mb-2">Term Name *</label>
            <input
              type="text"
              placeholder="e.g., First Term"
              {...register('name')}
              className={`w-full px-3 py-2 bg-slate-800 border rounded-lg text-white placeholder-gray-500 outline-none transition-colors ${
                errors.name
                  ? 'border-red-500/50 focus:border-red-500'
                  : 'border-slate-600 focus:border-blue-500'
              }`}
            />
            {errors.name && (
              <p className="text-red-400 text-xs mt-1">{errors.name.message}</p>
            )}
          </div>

          {/* Start Date */}
          <div>
            <label className="text-gray-300 text-sm font-medium block mb-2">Start Date *</label>
            <input
              type="date"
              {...register('startDate')}
              className={`w-full px-3 py-2 bg-slate-800 border rounded-lg text-white outline-none transition-colors ${
                errors.startDate
                  ? 'border-red-500/50 focus:border-red-500'
                  : 'border-slate-600 focus:border-blue-500'
              }`}
            />
            {errors.startDate && (
              <p className="text-red-400 text-xs mt-1">{errors.startDate.message}</p>
            )}
          </div>

          {/* End Date */}
          <div>
            <label className="text-gray-300 text-sm font-medium block mb-2">End Date *</label>
            <input
              type="date"
              {...register('endDate')}
              className={`w-full px-3 py-2 bg-slate-800 border rounded-lg text-white outline-none transition-colors ${
                errors.endDate
                  ? 'border-red-500/50 focus:border-red-500'
                  : 'border-slate-600 focus:border-blue-500'
              }`}
            />
            {errors.endDate && (
              <p className="text-red-400 text-xs mt-1">{errors.endDate.message}</p>
            )}
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-gray-300 rounded-lg font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors"
            >
              {isSubmitting ? 'Saving...' : isEditing ? 'Update' : 'Add'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
