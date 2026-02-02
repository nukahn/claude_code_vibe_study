import { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';

const CONVERSIONS = [
  {
    id: 'cm-inch',
    name: 'cm → inch',
    fromUnit: 'cm',
    toUnit: 'inch',
    convert: (value) => value * 0.393701,
  },
  {
    id: 'inch-cm',
    name: 'inch → cm',
    fromUnit: 'inch',
    toUnit: 'cm',
    convert: (value) => value * 2.54,
  },
  {
    id: 'kg-lb',
    name: 'kg → lb',
    fromUnit: 'kg',
    toUnit: 'lb',
    convert: (value) => value * 2.20462,
  },
  {
    id: 'lb-kg',
    name: 'lb → kg',
    fromUnit: 'lb',
    toUnit: 'kg',
    convert: (value) => value * 0.453592,
  },
];

export default function App() {
  const [selectedConversion, setSelectedConversion] = useState(CONVERSIONS[0]);
  const [inputValue, setInputValue] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);

  const handleConvert = () => {
    const numValue = parseFloat(inputValue);
    if (isNaN(numValue)) return '';
    return selectedConversion.convert(numValue).toFixed(4);
  };

  const result = handleConvert();

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <StatusBar style="light" />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* 헤더 */}
        <View style={styles.header}>
          <Text style={styles.title}>Unit Converter</Text>
          <Text style={styles.subtitle}>단위 변환기</Text>
        </View>

        {/* 변환 타입 선택 (Select) */}
        <View style={styles.section}>
          <Text style={styles.label}>변환 타입</Text>
          <TouchableOpacity
            style={styles.selectButton}
            onPress={() => setShowDropdown(!showDropdown)}
          >
            <Text style={styles.selectText}>{selectedConversion.name}</Text>
            <Text style={styles.selectArrow}>{showDropdown ? '▲' : '▼'}</Text>
          </TouchableOpacity>

          {showDropdown && (
            <View style={styles.dropdown}>
              {CONVERSIONS.map((conv) => (
                <TouchableOpacity
                  key={conv.id}
                  style={[
                    styles.dropdownItem,
                    selectedConversion.id === conv.id && styles.dropdownItemActive,
                  ]}
                  onPress={() => {
                    setSelectedConversion(conv);
                    setShowDropdown(false);
                    setInputValue('');
                  }}
                >
                  <Text
                    style={[
                      styles.dropdownText,
                      selectedConversion.id === conv.id && styles.dropdownTextActive,
                    ]}
                  >
                    {conv.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* 입력 */}
        <View style={styles.section}>
          <Text style={styles.label}>입력값</Text>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.input}
              value={inputValue}
              onChangeText={setInputValue}
              placeholder="숫자를 입력하세요"
              placeholderTextColor="#4a4a4a"
              keyboardType="decimal-pad"
            />
            <View style={styles.unitBadge}>
              <Text style={styles.unitText}>{selectedConversion.fromUnit}</Text>
            </View>
          </View>
        </View>

        {/* 결과 */}
        <View style={styles.resultSection}>
          <View style={styles.resultCard}>
            <Text style={styles.resultLabel}>변환 결과</Text>
            <View style={styles.resultRow}>
              <Text style={styles.resultValue}>
                {result || '0'}
              </Text>
              <Text style={styles.resultUnit}>{selectedConversion.toUnit}</Text>
            </View>
            {inputValue !== '' && result && (
              <Text style={styles.formula}>
                {inputValue} {selectedConversion.fromUnit} = {result} {selectedConversion.toUnit}
              </Text>
            )}
          </View>
        </View>

        {/* 변환 정보 */}
        <View style={styles.infoSection}>
          <Text style={styles.infoTitle}>변환 공식</Text>
          <View style={styles.infoGrid}>
            <View style={styles.infoCard}>
              <Text style={styles.infoLabel}>길이</Text>
              <Text style={styles.infoText}>1 inch = 2.54 cm</Text>
            </View>
            <View style={styles.infoCard}>
              <Text style={styles.infoLabel}>무게</Text>
              <Text style={styles.infoText}>1 lb = 0.4536 kg</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  scrollContent: {
    padding: 24,
    paddingTop: 60,
  },
  header: {
    marginBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#a0a0a0',
  },
  section: {
    marginBottom: 24,
    zIndex: 10,
  },
  label: {
    fontSize: 14,
    color: '#a0a0a0',
    marginBottom: 12,
    fontWeight: '500',
  },
  selectButton: {
    backgroundColor: '#1a1a1a',
    borderWidth: 1,
    borderColor: '#2a2a2a',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  selectText: {
    fontSize: 16,
    color: '#ffffff',
    fontWeight: '500',
  },
  selectArrow: {
    fontSize: 12,
    color: '#6366f1',
  },
  dropdown: {
    position: 'absolute',
    top: 80,
    left: 0,
    right: 0,
    backgroundColor: '#1a1a1a',
    borderWidth: 1,
    borderColor: '#2a2a2a',
    borderRadius: 12,
    overflow: 'hidden',
    zIndex: 100,
  },
  dropdownItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#2a2a2a',
  },
  dropdownItemActive: {
    backgroundColor: '#6366f1',
  },
  dropdownText: {
    fontSize: 16,
    color: '#ffffff',
  },
  dropdownTextActive: {
    fontWeight: '600',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    borderWidth: 1,
    borderColor: '#2a2a2a',
    borderRadius: 12,
    overflow: 'hidden',
  },
  input: {
    flex: 1,
    padding: 16,
    fontSize: 18,
    color: '#ffffff',
  },
  unitBadge: {
    backgroundColor: '#6366f1',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  unitText: {
    fontSize: 16,
    color: '#ffffff',
    fontWeight: '600',
  },
  resultSection: {
    marginTop: 16,
    marginBottom: 32,
  },
  resultCard: {
    backgroundColor: '#1a1a1a',
    borderWidth: 2,
    borderColor: '#6366f1',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
  },
  resultLabel: {
    fontSize: 14,
    color: '#a0a0a0',
    marginBottom: 16,
  },
  resultRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  resultValue: {
    fontSize: 48,
    fontWeight: '700',
    color: '#ffffff',
  },
  resultUnit: {
    fontSize: 24,
    fontWeight: '500',
    color: '#6366f1',
    marginLeft: 8,
  },
  formula: {
    marginTop: 16,
    fontSize: 14,
    color: '#4a4a4a',
  },
  infoSection: {
    marginTop: 16,
  },
  infoTitle: {
    fontSize: 14,
    color: '#a0a0a0',
    marginBottom: 12,
    fontWeight: '500',
  },
  infoGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  infoCard: {
    flex: 1,
    backgroundColor: '#1a1a1a',
    borderWidth: 1,
    borderColor: '#2a2a2a',
    borderRadius: 12,
    padding: 16,
  },
  infoLabel: {
    fontSize: 12,
    color: '#6366f1',
    marginBottom: 8,
    fontWeight: '600',
  },
  infoText: {
    fontSize: 14,
    color: '#ffffff',
  },
});
