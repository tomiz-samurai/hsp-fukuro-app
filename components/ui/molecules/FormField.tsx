/**
 * FormField Component
 * 
 * A wrapper component for form inputs that handles validation, error states,
 * and consistent styling designed with HSP users in mind.
 */

import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { Controller, Control, FieldValues, Path, FieldError } from 'react-hook-form';
import Input, { InputProps } from '@components/ui/atoms/Input';
import { useTheme } from 'react-native-paper';
import { AppTheme } from '@config/theme';
import { ERROR_MESSAGES } from '@config/constants';

// FormField props interface
export interface FormFieldProps<T extends FieldValues> extends Omit<InputProps, 'onChangeText' | 'value'> {
  // React Hook Form props
  control: Control<T>;
  name: Path<T>;
  defaultValue?: string;
  rules?: {
    required?: boolean | string;
    minLength?: { value: number; message: string };
    maxLength?: { value: number; message: string };
    pattern?: { value: RegExp; message: string };
    validate?: (value: string) => string | boolean;
  };
  
  // Styling
  containerStyle?: ViewStyle;
  
  // Test ID
  testID?: string;
}

// FormField component
function FormField<T extends FieldValues>({
  // React Hook Form props
  control,
  name,
  defaultValue = '',
  rules,
  
  // Input props
  label,
  helperText,
  variant = 'outlined',
  disabled,
  
  // Styling
  containerStyle,
  
  // Test ID
  testID,
  
  // Other input props
  ...rest
}: FormFieldProps<T>): JSX.Element {
  // Theme
  const theme = useTheme() as AppTheme;
  
  // Get transformed validation rules
  const getValidationRules = () => {
    const formattedRules: any = {};
    
    if (rules?.required) {
      formattedRules.required = 
        typeof rules.required === 'string' 
          ? rules.required 
          : ERROR_MESSAGES.FIELD_REQUIRED;
    }
    
    if (rules?.minLength) {
      formattedRules.minLength = rules.minLength;
    }
    
    if (rules?.maxLength) {
      formattedRules.maxLength = rules.maxLength;
    }
    
    if (rules?.pattern) {
      formattedRules.pattern = rules.pattern;
    }
    
    if (rules?.validate) {
      formattedRules.validate = rules.validate;
    }
    
    return formattedRules;
  };
  
  return (
    <View style={[styles.container, containerStyle]} testID={testID}>
      <Controller
        control={control}
        name={name}
        defaultValue={defaultValue as any}
        rules={getValidationRules()}
        render={({
          field: { onChange, onBlur, value, ref },
          fieldState: { error, isTouched },
        }) => (
          <Input
            ref={ref}
            label={label}
            helperText={helperText}
            error={error?.message}
            variant={variant}
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            disabled={disabled}
            testID={`${testID}-input`}
            {...rest}
          />
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
});

export default FormField;
