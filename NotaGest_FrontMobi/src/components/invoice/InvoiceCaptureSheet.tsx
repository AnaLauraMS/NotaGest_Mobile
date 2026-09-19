import React from 'react';
import { View, Text, StyleSheet, Modal, Pressable, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Camera, Image as ImageIcon, Plus } from 'lucide-react-native';

interface InvoiceCaptureSheetProps {
  visible: boolean;
  onClose: () => void;
  onCameraCapture: () => void;
  onGalleryPicker: () => void;
  onManualEntry: () => void;
}

export function InvoiceCaptureSheet({
  visible,
  onClose,
  onCameraCapture,
  onGalleryPicker,
  onManualEntry,
}: InvoiceCaptureSheetProps) {
  const insets = useSafeAreaInsets();
  const bottomInset = Math.max(insets.bottom, Platform.OS === 'android' ? 24 : 0);

  return (
    <Modal visible={visible} transparent animationType="slide">
      <Pressable style={styles.backdrop} onPress={onClose}>
        <View style={[styles.card, { paddingBottom: 24 + bottomInset }]}>
          <View style={styles.handle} />
          <Text style={styles.title}>Como deseja capturar a nota?</Text>

          <Pressable style={styles.option} onPress={onCameraCapture}>
            <View style={[styles.optionIcon, { backgroundColor: '#eff6ff' }]}>
              <Camera size={22} color="#2563eb" />
            </View>
            <View style={styles.optionTextCol}>
              <Text style={styles.optionTitle}>Tirar Foto com a Câmera</Text>
              <Text style={styles.optionSubtitle}>Fotografe o cupom ou recibo diretamente</Text>
            </View>
          </Pressable>

          <Pressable style={styles.option} onPress={onGalleryPicker}>
            <View style={[styles.optionIcon, { backgroundColor: '#f5f3ff' }]}>
              <ImageIcon size={22} color="#7c3aed" />
            </View>
            <View style={styles.optionTextCol}>
              <Text style={styles.optionTitle}>Escolher da Galeria</Text>
              <Text style={styles.optionSubtitle}>Selecione um recibo já salvo em fotos</Text>
            </View>
          </Pressable>

          <Pressable style={styles.option} onPress={onManualEntry}>
            <View style={[styles.optionIcon, { backgroundColor: '#f1f5f9' }]}>
              <Plus size={22} color="#475569" />
            </View>
            <View style={styles.optionTextCol}>
              <Text style={styles.optionTitle}>Preenchimento Manual</Text>
              <Text style={styles.optionSubtitle}>Digitar os dados sem enviar imagem</Text>
            </View>
          </Pressable>

          <Pressable style={styles.cancelButton} onPress={onClose}>
            <Text style={styles.cancelText}>Cancelar</Text>
          </Pressable>
        </View>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
    justifyContent: 'flex-end',
  },
  card: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 24,
    paddingBottom: 40,
    gap: 12,
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: '#cbd5e1',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0f172a',
    marginBottom: 8,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    gap: 14,
  },
  optionIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionTextCol: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0f172a',
  },
  optionSubtitle: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 1,
  },
  cancelButton: {
    alignItems: 'center',
    paddingVertical: 12,
    marginTop: 4,
  },
  cancelText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748b',
  },
});
