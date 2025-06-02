import { useState } from 'react';

/**
 * A generic form state and validation hook for React/React Native forms.
 * Accepts an initial state object and a validate function.
 * Returns state, setters, touched, error, submitAttempted, handleChange, handleBlur, handleSubmit, and resetForm.
 */
export function useGenericForm<T extends Record<string, any>>({
  initialState,
  validate,
  onSubmit,
}: {
  initialState: T;
  validate: (values: T) => string | null;
  onSubmit: (values: T) => void;
}) {
  const [values, setValues] = useState<T>(initialState);
  const [touched, setTouched] = useState<Record<keyof T, boolean>>(
    Object.keys(initialState).reduce((acc, key) => ({ ...acc, [key]: false }), {} as Record<keyof T, boolean>)
  );
  const [error, setError] = useState<string | null>(null);
  const [submitAttempted, setSubmitAttempted] = useState(false);

  // Generic change handler
  const handleChange = (key: keyof T, value: any) => {
    setValues(prev => ({ ...prev, [key]: value }));
  };

  // Generic blur handler
  const handleBlur = (key: keyof T) => {
    setTouched(prev => ({ ...prev, [key]: true }));
  };

  // Generic submit handler
  const handleSubmit = () => {
    setSubmitAttempted(true);
    setTouched(
      Object.keys(initialState).reduce((acc, key) => ({ ...acc, [key]: true }), {} as Record<keyof T, boolean>)
    );
    const validationError = validate(values);
    setError(validationError);
    if (!validationError) {
      onSubmit(values);
    }
  };

  // Reset form
  const resetForm = () => {
    setValues(initialState);
    setTouched(Object.keys(initialState).reduce((acc, key) => ({ ...acc, [key]: false }), {} as Record<keyof T, boolean>));
    setError(null);
    setSubmitAttempted(false);
  };

  return {
    values,
    setValues,
    touched,
    setTouched,
    error,
    setError,
    submitAttempted,
    setSubmitAttempted,
    handleChange,
    handleBlur,
    handleSubmit,
    resetForm,
  };
}
