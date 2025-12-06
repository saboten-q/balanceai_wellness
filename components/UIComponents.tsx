import React, { ReactNode, Children, isValidElement, cloneElement } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  TextInput, 
  StyleSheet, 
  ActivityIndicator,
  Modal as RNModal,
  ScrollView,
  Platform
} from 'react-native';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';

// Colors
const COLORS = {
  primary: {
    50: '#f0f9ff',
    100: '#e0f2fe',
    400: '#38bdf8',
    500: '#0ea5e9',
    600: '#0284c7',
    700: '#0369a1',
  },
  accent: {
    50: '#fff7ed',
    100: '#ffedd5',
    400: '#fb923c',
    500: '#f97316',
  },
  surface: {
    50: '#f8fafc',
    100: '#f1f5f9',
    200: '#e2e8f0',
    300: '#cbd5e1',
    400: '#94a3b8',
    500: '#64748b',
    600: '#475569',
    900: '#0f172a',
  },
  accent: {
    50: '#fff7ed',
    400: '#fb923c',
    500: '#f97316',
  },
  white: '#ffffff',
  red: '#ef4444',
  green: '#22c55e',
};

// --- Card ---
interface CardProps {
  children: ReactNode;
  style?: any;
  onPress?: () => void;
  title?: string;
  iconName?: string;
}

export const Card: React.FC<CardProps> = ({ children, style, onPress, title, iconName }) => {
  const CardComponent = onPress ? TouchableOpacity : View;
  
  return (
    <CardComponent 
      onPress={onPress} 
      activeOpacity={0.7}
      style={[styles.card, style]}
    >
      {(title || iconName) && (
        <View style={styles.cardHeader}>
              {iconName && (
            <View style={styles.cardIconContainer}>
              <Icon name={iconName as any} size={20} color={COLORS.primary[600]} />
            </View>
          )}
          {title && <Text style={styles.cardTitle}>{title}</Text>}
        </View>
      )}
      {children}
    </CardComponent>
  );
};

// --- Button ---
interface ButtonProps {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost';
  isLoading?: boolean;
  onPress?: () => void;
  disabled?: boolean;
  style?: any;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  isLoading, 
  onPress,
  disabled,
  style
}) => {
  const buttonStyle = [
    styles.button,
    variant === 'primary' && styles.buttonPrimary,
    variant === 'secondary' && styles.buttonSecondary,
    variant === 'ghost' && styles.buttonGhost,
    (disabled || isLoading) && styles.buttonDisabled,
    style
  ];

  const textStyle = [
    styles.buttonText,
    variant === 'primary' && styles.buttonTextPrimary,
    variant === 'secondary' && styles.buttonTextSecondary,
    variant === 'ghost' && styles.buttonTextGhost,
  ];

  const renderChildren = () => {
    if (isLoading) {
      return <ActivityIndicator color={variant === 'primary' ? COLORS.white : COLORS.primary[600]} />;
    }
    
    if (typeof children === 'string') {
      return <Text style={textStyle}>{children}</Text>;
    }
    
    // ReactNodeの場合、Text要素にスタイルを適用
    return Children.map(children, (child) => {
      if (isValidElement(child) && child.type === Text) {
        return cloneElement(child, { style: [textStyle, child.props.style] });
      }
      return child;
    });
  };

  return (
    <TouchableOpacity 
      style={buttonStyle}
      onPress={onPress}
      disabled={disabled || isLoading}
      activeOpacity={0.7}
    >
      {renderChildren()}
    </TouchableOpacity>
  );
};

// --- Input ---
interface InputProps {
  label?: string;
  placeholder?: string;
  value?: string;
  onChangeText?: (text: string) => void;
  secureTextEntry?: boolean;
  keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad';
  style?: any;
  multiline?: boolean;
  numberOfLines?: number;
}

export const Input: React.FC<InputProps> = ({ 
  label, 
  placeholder, 
  value, 
  onChangeText,
  secureTextEntry,
  keyboardType = 'default',
  style,
  multiline,
  numberOfLines
}) => (
  <View style={[styles.inputContainer, style]}>
    {label && <Text style={styles.inputLabel}>{label}</Text>}
    <TextInput
      style={[styles.input, multiline && styles.inputMultiline]}
      placeholder={placeholder}
      placeholderTextColor={COLORS.surface[400]}
      value={value}
      onChangeText={onChangeText}
      secureTextEntry={secureTextEntry}
      keyboardType={keyboardType}
      multiline={multiline}
      numberOfLines={numberOfLines}
    />
  </View>
);

// --- Select (Picker alternative) ---
interface SelectProps {
  label?: string;
  value?: string;
  onValueChange?: (value: string) => void;
  options: { label: string; value: string }[];
  style?: any;
}

export const Select: React.FC<SelectProps> = ({ 
  label, 
  value, 
  onValueChange,
  options,
  style
}) => {
  const [showPicker, setShowPicker] = React.useState(false);
  const selectedOption = options.find(opt => opt.value === value);

  return (
    <View style={[styles.inputContainer, style]}>
      {label && <Text style={styles.inputLabel}>{label}</Text>}
      <TouchableOpacity 
        style={styles.selectButton}
        onPress={() => setShowPicker(true)}
      >
        <Text style={styles.selectText}>
          {selectedOption?.label || '選択してください'}
        </Text>
        <Icon name="chevron-down" size={20} color={COLORS.surface[500]} />
      </TouchableOpacity>

      <RNModal
        visible={showPicker}
        transparent
        animationType="slide"
        onRequestClose={() => setShowPicker(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowPicker(false)}
        >
          <View style={styles.pickerContainer}>
            <View style={styles.pickerHeader}>
              <Text style={styles.pickerTitle}>{label || '選択'}</Text>
              <TouchableOpacity onPress={() => setShowPicker(false)}>
                <Icon name="close" size={24} color={COLORS.surface[900]} />
              </TouchableOpacity>
            </View>
            <ScrollView>
              {options.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.pickerOption,
                    option.value === value && styles.pickerOptionSelected
                  ]}
                  onPress={() => {
                    onValueChange?.(option.value);
                    setShowPicker(false);
                  }}
                >
                  <Text style={[
                    styles.pickerOptionText,
                    option.value === value && styles.pickerOptionTextSelected
                  ]}>
                    {option.label}
                  </Text>
                  {option.value === value && (
                    <Icon name="check" size={20} color={COLORS.primary[600]} />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </RNModal>
    </View>
  );
};

// --- Checkbox ---
interface CheckboxProps {
  checked: boolean;
  onChange: () => void;
  label?: string;
}

export const Checkbox: React.FC<CheckboxProps> = ({ checked, onChange, label }) => (
  <TouchableOpacity 
    onPress={onChange} 
    style={styles.checkboxContainer}
    activeOpacity={0.7}
  >
    <View style={[
      styles.checkbox,
      checked && styles.checkboxChecked
    ]}>
      {checked && <Icon name="check" size={14} color={COLORS.white} />}
    </View>
    {label && (
      <Text style={[
        styles.checkboxLabel,
        checked && styles.checkboxLabelChecked
      ]}>
        {label}
      </Text>
    )}
  </TouchableOpacity>
);

// --- Modal ---
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  title?: string;
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, children, title }) => {
  return (
    <RNModal
      visible={isOpen}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{title}</Text>
            <TouchableOpacity onPress={onClose} style={styles.modalCloseButton}>
              <Icon name="close" size={24} color={COLORS.surface[500]} />
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.modalBody}>
            {children}
          </ScrollView>
        </View>
      </View>
    </RNModal>
  );
};

const styles = StyleSheet.create({
  // Card
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 24,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.surface[100],
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 8,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: COLORS.primary[50],
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.surface[900],
  },

  // Button
  button: {
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  buttonPrimary: {
    backgroundColor: COLORS.primary[600],
    ...Platform.select({
      ios: {
        shadowColor: COLORS.primary[500],
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  buttonSecondary: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.surface[200],
  },
  buttonGhost: {
    backgroundColor: 'transparent',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  buttonTextPrimary: {
    color: COLORS.white,
  },
  buttonTextSecondary: {
    color: COLORS.surface[900],
  },
  buttonTextGhost: {
    color: COLORS.surface[900],
  },

  // Input
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.surface[900],
    marginBottom: 8,
    marginLeft: 4,
  },
  input: {
    backgroundColor: COLORS.surface[50],
    borderWidth: 1,
    borderColor: COLORS.surface[200],
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: COLORS.surface[900],
  },
  inputMultiline: {
    minHeight: 100,
    textAlignVertical: 'top',
  },

  // Select
  selectButton: {
    backgroundColor: COLORS.surface[50],
    borderWidth: 1,
    borderColor: COLORS.surface[200],
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  selectText: {
    fontSize: 16,
    color: COLORS.surface[900],
  },
  pickerContainer: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '70%',
    marginTop: 'auto',
  },
  pickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.surface[100],
  },
  pickerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.surface[900],
  },
  pickerOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.surface[100],
  },
  pickerOptionSelected: {
    backgroundColor: COLORS.primary[50],
  },
  pickerOptionText: {
    fontSize: 16,
    color: COLORS.surface[900],
  },
  pickerOptionTextSelected: {
    fontWeight: '600',
    color: COLORS.primary[600],
  },

  // Checkbox
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: COLORS.surface[300],
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: COLORS.primary[500],
    borderColor: COLORS.primary[500],
  },
  checkboxLabel: {
    marginLeft: 12,
    fontSize: 14,
    color: COLORS.surface[900],
  },
  checkboxLabelChecked: {
    color: COLORS.surface[400],
    textDecorationLine: 'line-through',
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    maxHeight: '80%',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.surface[100],
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.surface[900],
  },
  modalCloseButton: {
    padding: 8,
  },
  modalBody: {
    flex: 1,
  },
});
