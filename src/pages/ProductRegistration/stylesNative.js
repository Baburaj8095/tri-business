import { StyleSheet, Dimensions, Platform } from 'react-native';

const { width, height } = Dimensions.get('window');
const guidelineBaseWidth = 375;

// Responsive Scaling Helper
const scale = (size) => (width / guidelineBaseWidth) * size;

export const Colors = {
  primary: '#228B22', // Forest Green
  secondary: '#1B4D3E',
  background: '#ffffff',
  surface: '#f9fafb',
  text: '#111827',
  textMuted: '#6b7280',
  border: '#e5e7eb',
  error: '#ef4444',
  white: '#ffffff',
  shadow: '#000000',
};

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
    paddingHorizontal: 16,
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 20 : 40,
    paddingBottom: 30,
    paddingHorizontal: 24,
    backgroundColor: Colors.primary,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 15,
    elevation: 10,
  },
  headerTitle: {
    fontSize: scale(22),
    fontWeight: '900',
    color: Colors.white,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  headerSubtitle: {
    fontSize: scale(13),
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
    marginTop: 6,
    fontWeight: '600',
  },
  section: {
    marginTop: 24,
    marginHorizontal: 16,
    padding: 20,
    backgroundColor: Colors.white,
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#f3f4f6',
  },
  sectionTitle: {
    fontSize: scale(15),
    fontWeight: '800',
    color: Colors.primary,
    marginBottom: 20,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
  },
  fieldContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: scale(13),
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 8,
    paddingLeft: 4,
  },
  input: {
    height: 54,
    backgroundColor: Colors.surface,
    borderRadius: 14,
    paddingHorizontal: 16,
    fontSize: scale(15),
    color: Colors.text,
    borderWidth: 1.5,
    borderColor: Colors.border,
    fontWeight: '600',
  },
  textArea: {
    height: 120,
    textAlignVertical: 'top',
    paddingTop: 16,
  },
  dropdownPlaceholder: {
    height: 54,
    backgroundColor: Colors.surface,
    borderRadius: 14,
    paddingHorizontal: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: Colors.border,
  },
  dropdownText: {
    fontSize: scale(15),
    color: Colors.textMuted,
    fontWeight: '600',
  },
  row: {
    flexDirection: 'column',
  },
  halfField: {
    width: '100%',
  },
  toggleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 4,
  },
  uploadGrid: {
    flexDirection: 'column',
    rowGap: 14,
  },
  uploadBtn: {
    width: '100%',
    height: 110,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: Colors.border,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.surface,
  },
  uploadIconText: {
    fontSize: scale(11),
    fontWeight: '800',
    color: Colors.primary,
    marginTop: 8,
    textAlign: 'center',
  },
  buttonContainer: {
    marginTop: 32,
    paddingHorizontal: 0,
    gap: 14,
  },
  primaryButton: {
    height: 60,
    backgroundColor: Colors.primary,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 8,
  },
  outlineButton: {
    height: 56,
    backgroundColor: Colors.white,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2.5,
    borderColor: Colors.primary,
  },
  primaryButtonText: {
    fontSize: scale(16),
    fontWeight: '900',
    color: Colors.white,
    letterSpacing: 0.5,
  },
  outlineButtonText: {
    fontSize: scale(16),
    fontWeight: '900',
    color: Colors.primary,
  },
  errorText: {
    fontSize: scale(11),
    color: Colors.error,
    marginTop: 4,
    marginLeft: 4,
    fontWeight: '700',
  }
});
