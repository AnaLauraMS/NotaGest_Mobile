import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  ActivityIndicator,
  RefreshControl,
  Alert,
  Platform,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Receipt, Camera, Sparkles, Plus } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';

import { InvoiceService } from '@/domain/invoice/invoiceService';
import { InvoiceResponse, CreateInvoiceRequest } from '@/domain/invoice/schemas';
import { PropertyService } from '@/domain/property/propertyService';
import { PropertySimpleName } from '@/domain/property/schemas';
import { getTodayBrlDate, formatToBrlDate } from '@/core/utils/dateUtils';
import { InvoiceCard } from '@/components/invoice/InvoiceCard';
import { InvoiceCaptureSheet } from '@/components/invoice/InvoiceCaptureSheet';
import { AiProcessingOverlay } from '@/components/invoice/AiProcessingOverlay';
import { InvoiceFormModal, InvoiceFormData } from '@/components/invoice/InvoiceFormModal';

const CATEGORIES = [
  'Construção',
  'Reforma',
  'Manutenção',
  'Elétrica',
  'Hidráulica',
  'Mobília',
  'Outros',
];

export default function InvoicesScreen() {
  const insets = useSafeAreaInsets();
  const bottomInset = Math.max(insets.bottom, Platform.OS === 'android' ? 16 : 0);
  const [invoices, setInvoices] = useState<InvoiceResponse[]>([]);
  const [properties, setProperties] = useState<PropertySimpleName[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isCaptureSheetOpen, setIsCaptureSheetOpen] = useState(false);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isExtractingAi, setIsExtractingAi] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState<InvoiceFormData>({
    title: '',
    value: '',
    purchaseDate: getTodayBrlDate(),
    propertyId: '',
    category: CATEGORIES[0],
    subcategory: 'Geral',
    observation: '',
    filePath: '',
    wasAiExtracted: false,
    feedbackMessage: null,
  });

  const fetchInvoices = async () => {
    try {
      const data = await InvoiceService.getInvoices();
      setInvoices(data);
    } catch {
      setInvoices([]);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const fetchProperties = async () => {
    try {
      const props = await PropertyService.getPropertiesNames();
      setProperties(props);
      if (props.length > 0 && !formData.propertyId) {
        setFormData((prev) => ({ ...prev, propertyId: props[0]._id }));
      }
    } catch {
      setProperties([]);
    }
  };

  useEffect(() => {
    fetchInvoices();
    fetchProperties();
  }, []);

  const onRefresh = () => {
    setIsRefreshing(true);
    fetchInvoices();
    fetchProperties();
  };

  const resetForm = () => {
    setFormData({
      title: '',
      value: '',
      purchaseDate: getTodayBrlDate(),
      propertyId: properties.length > 0 ? properties[0]._id : '',
      category: CATEGORIES[0],
      subcategory: 'Geral',
      observation: '',
      filePath: '',
      wasAiExtracted: false,
      feedbackMessage: null,
    });
  };

  const handleOpenManualModal = () => {
    resetForm();
    setIsCaptureSheetOpen(false);
    setIsFormModalOpen(true);
  };

  const handleCameraCapture = async () => {
    setIsCaptureSheetOpen(false);
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permissão necessária', 'Acesso à câmera é necessário para fotografar comprovantes.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images'],
      quality: 0.8,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      await processAiImage(result.assets[0].uri, result.assets[0].mimeType);
    }
  };

  const handleGalleryPicker = async () => {
    setIsCaptureSheetOpen(false);
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permissão necessária', 'Acesso à galeria é necessário para escolher comprovantes.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.8,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      await processAiImage(result.assets[0].uri, result.assets[0].mimeType);
    }
  };

  const processAiImage = async (uri: string, mimeType?: string) => {
    setIsExtractingAi(true);
    try {
      const response = await InvoiceService.extractInvoiceWithAi(uri, mimeType);
      const extracted = response.data;

      setFormData({
        title: extracted.title || 'Comprovante Escaneado',
        value: extracted.totalValue ? String(extracted.totalValue) : '',
        purchaseDate: extracted.emissionDate ? formatToBrlDate(extracted.emissionDate) : getTodayBrlDate(),
        propertyId: properties.length > 0 ? properties[0]._id : '',
        category: extracted.category || CATEGORIES[0],
        subcategory: extracted.subcategory || 'Geral',
        observation: extracted.observation || '',
        filePath: response.filePath || '',
        wasAiExtracted: true,
        feedbackMessage: extracted.aiMessage || 'Dados extraídos com sucesso pela IA Gemini.',
      });
      setIsFormModalOpen(true);
    } catch {
      setFormData({
        title: 'Comprovante Escaneado',
        value: '',
        purchaseDate: getTodayBrlDate(),
        propertyId: properties.length > 0 ? properties[0]._id : '',
        category: CATEGORIES[0],
        subcategory: 'Geral',
        observation: '',
        filePath: '',
        wasAiExtracted: false,
        feedbackMessage: 'Não foi possível conectar ao serviço de IA. Você pode preencher os dados manualmente.',
      });
      setIsFormModalOpen(true);
    } finally {
      setIsExtractingAi(false);
    }
  };

  const handleSaveInvoice = async (payload: CreateInvoiceRequest) => {
    try {
      setIsSubmitting(true);
      await InvoiceService.createInvoice(payload);
      setIsFormModalOpen(false);
      resetForm();
      fetchInvoices();
    } catch (err: any) {
      Alert.alert('Erro ao Salvar', err?.response?.data?.error || err.message || 'Falha ao salvar nota fiscal.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteInvoice = (id: string, invoiceTitle: string) => {
    Alert.alert(
      'Excluir Nota',
      `Deseja realmente remover a nota "${invoiceTitle}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            try {
              await InvoiceService.deleteInvoice(id);
              setInvoices((prev) => prev.filter((inv) => inv._id !== id));
            } catch {
              Alert.alert('Erro', 'Não foi possível excluir a nota fiscal.');
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Notas Fiscais</Text>
          <Text style={styles.subtitle}>Extração e auditoria com IA Gemini</Text>
        </View>

        <View style={styles.headerActions}>
          <Pressable
            style={styles.scanButton}
            onPress={() => setIsCaptureSheetOpen(true)}>
            <Camera size={16} color="#ffffff" />
            <Text style={styles.scanButtonText}>Escanear</Text>
          </Pressable>

          <Pressable
            style={styles.addButton}
            onPress={handleOpenManualModal}>
            <Plus size={16} color="#ffffff" />
          </Pressable>
        </View>
      </View>

      <View style={styles.aiBanner}>
        <View style={styles.aiIconWrapper}>
          <Sparkles size={22} color="#7c3aed" />
        </View>
        <View style={styles.aiBannerContent}>
          <Text style={styles.aiBannerTitle}>Leitura Inteligente Ativa</Text>
          <Text style={styles.aiBannerSubtitle}>
            Tire uma foto de qualquer nota fiscal ou recibo. A IA Gemini preenche título, data, valor e categoria.
          </Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={[styles.listContent, { paddingBottom: 100 + bottomInset }]}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} colors={['#2563eb']} />
        }>
        <View style={styles.listHeaderRow}>
          <Text style={styles.listTitle}>Notas Cadastradas no Atlas</Text>
          <Text style={styles.listBadge}>{invoices.length} notas</Text>
        </View>

        {isLoading ? (
          <ActivityIndicator size="large" color="#2563eb" style={{ marginTop: 40 }} />
        ) : invoices.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Receipt size={48} color="#94a3b8" />
            <Text style={styles.emptyTitle}>Nenhuma nota fiscal encontrada</Text>
            <Text style={styles.emptySubtitle}>
              Toque em Escanear para fotografar um recibo ou toque em + para adicionar manualmente.
            </Text>
          </View>
        ) : (
          invoices.map((item) => (
            <InvoiceCard
              key={item._id}
              invoice={item}
              onDelete={handleDeleteInvoice}
            />
          ))
        )}
      </ScrollView>

      <AiProcessingOverlay visible={isExtractingAi} />

      <InvoiceCaptureSheet
        visible={isCaptureSheetOpen}
        onClose={() => setIsCaptureSheetOpen(false)}
        onCameraCapture={handleCameraCapture}
        onGalleryPicker={handleGalleryPicker}
        onManualEntry={handleOpenManualModal}
      />

      <InvoiceFormModal
        visible={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        onSave={handleSaveInvoice}
        properties={properties}
        categories={CATEGORIES}
        initialData={formData}
        isSubmitting={isSubmitting}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0f172a',
  },
  subtitle: {
    fontSize: 13,
    color: '#64748b',
    marginTop: 2,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  scanButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#7c3aed',
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 12,
    gap: 6,
  },
  scanButtonText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 13,
  },
  addButton: {
    backgroundColor: '#2563eb',
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  aiBanner: {
    marginHorizontal: 20,
    marginBottom: 16,
    backgroundColor: '#f5f3ff',
    borderRadius: 20,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ede9fe',
    gap: 14,
  },
  aiIconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#ede9fe',
    alignItems: 'center',
    justifyContent: 'center',
  },
  aiBannerContent: {
    flex: 1,
  },
  aiBannerTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#5b21b6',
  },
  aiBannerSubtitle: {
    fontSize: 12,
    color: '#7c3aed',
    marginTop: 2,
    lineHeight: 16,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  listHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  listTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0f172a',
  },
  listBadge: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748b',
    backgroundColor: '#e2e8f0',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 60,
    gap: 8,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#334155',
  },
  emptySubtitle: {
    fontSize: 13,
    color: '#94a3b8',
    textAlign: 'center',
  },
});
