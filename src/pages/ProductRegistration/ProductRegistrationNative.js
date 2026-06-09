import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Switch,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import styles, { Colors } from './stylesNative';

// --- Custom Reusable Components ---

const InputLabel = ({ label }) => (
  <Text style={styles.label}>{label}</Text>
);

const CustomInput = ({ label, placeholder, value, onChangeText, keyboardType, multiline, error }) => (
  <View style={styles.fieldContainer}>
    <InputLabel label={label} />
    <TextInput
      style={[styles.input, multiline && styles.textArea, error && { borderColor: Colors.error }]}
      placeholder={placeholder}
      placeholderTextColor={Colors.textMuted}
      value={value}
      onChangeText={onChangeText}
      keyboardType={keyboardType}
      multiline={multiline}
    />
    {error ? <Text style={styles.errorText}>{error}</Text> : null}
  </View>
);

const CustomDropdown = ({ label, placeholder, value }) => (
  <View style={styles.fieldContainer}>
    <InputLabel label={label} />
    <TouchableOpacity style={styles.dropdownPlaceholder} activeOpacity={0.7}>
      <Text style={styles.dropdownText}>{value || placeholder}</Text>
      <Text style={{ color: Colors.primary, fontSize: 18, fontWeight: '900' }}>▼</Text>
    </TouchableOpacity>
  </View>
);

const ToggleRow = ({ label, value, onValueChange }) => (
  <View style={styles.toggleContainer}>
    <Text style={[styles.label, { marginBottom: 0 }]}>{label}</Text>
    <Switch
      value={value}
      onValueChange={onValueChange}
      trackColor={{ false: '#d1d5db', true: '#86efac' }}
      thumbColor={value ? Colors.primary : '#f3f4f6'}
    />
  </View>
);

const UploadButton = ({ label, type }) => (
  <TouchableOpacity style={styles.uploadBtn} activeOpacity={0.6}>
    <Text style={{ fontSize: 28 }}>{type === 'video' ? '📽️' : '📸'}</Text>
    <Text style={styles.uploadIconText}>{label}</Text>
  </TouchableOpacity>
);

// --- Main Screen Component ---

export default function ProductRegistrationNative() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    category: '',
    brandName: '',
    productName: '',
    size: '',
    weight: '',
    description: '',
    mrp: '',
    discount: '',
    extraDiscount: '',
    consumerCommission: '',
    companyCommission: '',
    courierCharges: '',
    includedInMRP: false,
    returnOrder: false,
  });

  const [errors, setErrors] = useState({});

  const validateForm = () => {
    let _errors = {};
    if (!formData.productName) _errors.productName = 'Product name is required';
    if (!formData.mrp) _errors.mrp = 'Price is required';
    setErrors(_errors);
    return Object.keys(_errors).length === 0;
  };

  const handleSubmit = () => {
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    // Simulate Production API Request
    setTimeout(() => {
      setIsSubmitting(false);
      Alert.alert(
        "Registration Successful",
        "Product has been added to your merchant catalog.",
        [{ text: "OK", style: "default" }]
      );
    }, 2000);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.primary} />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header Section */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Merchant Product Registration</Text>
            <Text style={styles.headerSubtitle}>Complete the form to register your product</Text>
          </View>

          {/* Section: Product Details */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>1. Product Details</Text>
            <CustomDropdown
              label="Category *"
              placeholder="Select Category"
              value={formData.category}
            />
            <CustomDropdown
              label="Brand Name"
              placeholder="Select Brand"
              value={formData.brandName}
            />
            <CustomInput
              label="Product Name *"
              placeholder="e.g. Premium Cotton Shirt"
              value={formData.productName}
              onChangeText={(t) => setFormData({ ...formData, productName: t })}
              error={errors.productName}
            />
            <CustomInput
              label="Product Size"
              placeholder="XL, 42..."
              value={formData.size}
              onChangeText={(t) => setFormData({ ...formData, size: t })}
            />
            <CustomInput
              label="Product Weight"
              placeholder="500g..."
              value={formData.weight}
              onChangeText={(t) => setFormData({ ...formData, weight: t })}
            />
            <CustomInput
              label="Description"
              placeholder="Tell customers more about this product..."
              multiline
              value={formData.description}
              onChangeText={(t) => setFormData({ ...formData, description: t })}
            />
          </View>

          {/* Section: Pricing */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>2. Pricing & Offers</Text>
            <CustomInput
              label="MRP (Maximum Retail Price) *"
              placeholder="₹ 0.00"
              keyboardType="numeric"
              value={formData.mrp}
              onChangeText={(t) => setFormData({ ...formData, mrp: t })}
              error={errors.mrp}
            />
            <CustomInput
              label="Discount (%)"
              placeholder="0"
              keyboardType="numeric"
              value={formData.discount}
              onChangeText={(t) => setFormData({ ...formData, discount: t })}
            />
            <CustomInput
              label="Extra Discount"
              placeholder="0"
              keyboardType="numeric"
              value={formData.extraDiscount}
              onChangeText={(t) => setFormData({ ...formData, extraDiscount: t })}
            />
            <CustomInput
              label="Consumer Commission"
              placeholder="₹ 0.00"
              keyboardType="numeric"
              value={formData.consumerCommission}
              onChangeText={(t) => setFormData({ ...formData, consumerCommission: t })}
            />
            <CustomInput
              label="Company Commission"
              placeholder="₹ 0.00"
              keyboardType="numeric"
              value={formData.companyCommission}
              onChangeText={(t) => setFormData({ ...formData, companyCommission: t })}
            />
          </View>

          {/* Section: Media Upload */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>3. Product Media</Text>
            <UploadButton label="Upload Image" type="image" />
            <UploadButton label="Upload Video" type="video" />
            <UploadButton label="Packing Video" type="video" />
          </View>

          {/* Section: Delivery */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>4. Delivery & Returns</Text>
            <CustomInput
              label="Courier Charges"
              placeholder="₹ 0.00"
              keyboardType="numeric"
              value={formData.courierCharges}
              onChangeText={(t) => setFormData({ ...formData, courierCharges: t })}
            />
            <ToggleRow
              label="Included in MRP"
              value={formData.includedInMRP}
              onValueChange={(v) => setFormData({ ...formData, includedInMRP: v })}
            />
            <ToggleRow
              label="Allow Return Order"
              value={formData.returnOrder}
              onValueChange={(v) => setFormData({ ...formData, returnOrder: v })}
            />
          </View>

          {/* Form Actions */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={handleSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <ActivityIndicator color={Colors.white} />
              ) : (
                <Text style={styles.primaryButtonText}>Save Product Details</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity style={styles.outlineButton}>
              <Text style={styles.outlineButtonText}>Preview Registration</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={{ alignSelf: 'center', marginTop: 10 }}
              onPress={() => Alert.alert("Reset", "Form has been cleared.")}
            >
              <Text style={{ color: Colors.textMuted, fontWeight: '700' }}>Reset All Fields</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
