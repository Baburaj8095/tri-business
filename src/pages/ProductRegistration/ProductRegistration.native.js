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
  StatusBar
} from 'react-native';
import styles, { Colors } from './styles.native';

// --- Reusable Internal Components ---

const FormSection = ({ title, children }) => (
  <View style={styles.sectionCard}>
    <Text style={styles.sectionTitle}>{title}</Text>
    {children}
  </View>
);

const InputField = ({ label, placeholder, value, onChangeText, keyboardType, multiline, error }) => (
  <View style={styles.fieldGroup}>
    <Text style={styles.label}>{label}</Text>
    <TextInput
      style={[styles.input, multiline && styles.textArea, error && { borderColor: Colors.error }]}
      placeholder={placeholder}
      placeholderTextColor={Colors.textMuted}
      value={value}
      onChangeText={onChangeText}
      keyboardType={keyboardType}
      multiline={multiline}
    />
  </View>
);

const PickerField = ({ label, placeholder, value }) => (
  <View style={styles.fieldGroup}>
    <Text style={styles.label}>{label}</Text>
    <TouchableOpacity style={styles.dropdown} activeOpacity={0.7}>
      <Text style={styles.dropdownText}>{value || placeholder}</Text>
      <Text style={{ color: Colors.primary, fontSize: 16 }}>▼</Text>
    </TouchableOpacity>
  </View>
);

const SwitchField = ({ label, value, onValueChange }) => (
  <View style={styles.toggleContainer}>
    <Text style={[styles.label, { marginBottom: 0 }]}>{label}</Text>
    <Switch
      value={value}
      onValueChange={onValueChange}
      trackColor={{ false: '#e2e8f0', true: '#86efac' }}
      thumbColor={value ? Colors.primary : '#f8fafc'}
    />
  </View>
);

const MediaUpload = ({ label, icon }) => (
  <TouchableOpacity style={styles.mediaBox} activeOpacity={0.6}>
    <Text style={{ fontSize: 24 }}>{icon}</Text>
    <Text style={styles.mediaText}>{label}</Text>
  </TouchableOpacity>
);

// --- Main Application Screen ---

export default function ProductRegistration() {
  const [loading, setLoading] = useState(false);
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
    consumerComm: '',
    companyComm: '',
    courierCharges: '',
    includedInMRP: false,
    returnOrder: false,
    trikonetDeals: false,
    frontBanner: false,
  });

  const handleSave = () => {
    if (!formData.productName || !formData.mrp) {
      Alert.alert("Validation Error", "Product Name and MRP are required.");
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      Alert.alert("Success", "Product has been registered successfully!");
    }, 1500);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.primary} />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <ScrollView 
          style={styles.scrollView} 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Merchant Registration</Text>
            <Text style={styles.headerSubtitle}>Product Inventory & Catalog Management</Text>
          </View>

          {/* Section: Product Details */}
          <FormSection title="Product Details">
            <PickerField
              label="Category"
              placeholder="Select Category"
              value={formData.category}
            />
            <PickerField
              label="Brand Name"
              placeholder="Select Brand"
              value={formData.brandName}
            />
            <InputField 
              label="Product Name *" 
              placeholder="e.g. Classic Silk Saree"
              value={formData.productName}
              onChangeText={(t) => setFormData({...formData, productName: t})}
            />
            <InputField
              label="Size"
              placeholder="XL, 38..."
              value={formData.size}
              onChangeText={(t) => setFormData({...formData, size: t})}
            />
            <InputField
              label="Weight"
              placeholder="400g..."
              value={formData.weight}
              onChangeText={(t) => setFormData({...formData, weight: t})}
            />
            <InputField 
              label="Product Description" 
              placeholder="Enter product details..." 
              multiline 
              value={formData.description}
              onChangeText={(t) => setFormData({...formData, description: t})}
            />
          </FormSection>

          {/* Section: Pricing */}
          <FormSection title="Pricing & Commissions">
            <InputField 
              label="MRP (Final Price) *" 
              placeholder="₹ 0.00" 
              keyboardType="numeric"
              value={formData.mrp}
              onChangeText={(t) => setFormData({...formData, mrp: t})}
            />
            <InputField
              label="Discount (%)"
              placeholder="0"
              keyboardType="numeric"
              value={formData.discount}
              onChangeText={(t) => setFormData({...formData, discount: t})}
            />
            <InputField
              label="Extra Discount"
              placeholder="0"
              keyboardType="numeric"
              value={formData.extraDiscount}
              onChangeText={(t) => setFormData({...formData, extraDiscount: t})}
            />
            <InputField
              label="Consumer Commission"
              placeholder="₹ 0.00"
              keyboardType="numeric"
              value={formData.consumerComm}
              onChangeText={(t) => setFormData({...formData, consumerComm: t})}
            />
            <InputField
              label="Company Commission"
              placeholder="₹ 0.00"
              keyboardType="numeric"
              value={formData.companyComm}
              onChangeText={(t) => setFormData({...formData, companyComm: t})}
            />
          </FormSection>

          {/* Section: Media */}
          <FormSection title="Product Media">
            <View style={styles.mediaGrid}>
              <MediaUpload label="Product Image" icon="📷" />
              <MediaUpload label="Product Video" icon="🎥" />
              <MediaUpload label="Packing Video" icon="📦" />
            </View>
          </FormSection>

          {/* Section: Delivery */}
          <FormSection title="Delivery & Returns">
            <InputField label="Courier Charges" placeholder="₹ 0.00" keyboardType="numeric" />
            <SwitchField 
              label="Included in MRP" 
              value={formData.includedInMRP}
              onValueChange={(v) => setFormData({...formData, includedInMRP: v})}
            />
            <SwitchField 
              label="Allow Return Order" 
              value={formData.returnOrder}
              onValueChange={(v) => setFormData({...formData, returnOrder: v})}
            />
          </FormSection>

          {/* Section: Advertising */}
          <FormSection title="Advertisement">
            <SwitchField 
              label="Trikonet Deals Ads" 
              value={formData.trikonetDeals}
              onValueChange={(v) => setFormData({...formData, trikonetDeals: v})}
            />
            <SwitchField 
              label="Front Banner Ads Online" 
              value={formData.frontBanner}
              onValueChange={(v) => setFormData({...formData, frontBanner: v})}
            />
          </FormSection>

          {/* Action Buttons */}
          <View style={styles.buttonWrapper}>
            <TouchableOpacity 
              style={styles.saveButton} 
              onPress={handleSave}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color={Colors.white} />
              ) : (
                <Text style={styles.saveButtonText}>Save Product</Text>
              )}
            </TouchableOpacity>

            <View style={styles.row}>
              <TouchableOpacity style={[styles.secondaryButton, styles.halfColumn]}>
                <Text style={styles.secondaryButtonText}>Reset</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.secondaryButton, styles.halfColumn, { marginTop: 12 }]}>
                <Text style={styles.secondaryButtonText}>Preview</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
