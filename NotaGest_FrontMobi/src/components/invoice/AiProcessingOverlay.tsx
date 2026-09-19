import React from 'react';
import { View, Text, StyleSheet, Modal, ActivityIndicator } from 'react-native';
import { Sparkles } from 'lucide-react-native';

interface AiProcessingOverlayProps {
  visible: boolean;
}

export function AiProcessingOverlay({ visible }: AiProcessingOverlayProps) {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.card}>
          <View style={styles.iconWrapper}>
            <Sparkles size={36} color="#7c3aed" />
          </View>
          <Text style={styles.title}>Processando com Gemini AI</Text>
          <Text style={styles.subtitle}>
            Extraindo valor total, data de emissão, CNPJ e itens da nota fiscal...
          </Text>
          <ActivityIndicator size="large" color="#7c3aed" style={{ marginTop: 16 }} />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.7)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 28,
    alignItems: 'center',
    width: '100%',
    maxWidth: 340,
  },
  iconWrapper: {
    width: 68,
    height: 68,
    borderRadius: 24,
    backgroundColor: '#f5f3ff',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    borderWidth: 2,
    borderColor: '#ede9fe',
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1e1b4b',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 13,
    color: '#64748b',
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 18,
  },
});
