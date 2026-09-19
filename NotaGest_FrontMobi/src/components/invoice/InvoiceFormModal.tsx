import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  TextInput,
  Modal,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Building, Sparkles, AlertCircle, X, UploadCloud } from 'lucide-react-native';
import { PropertySimpleName } from '@/domain/property/schemas';
import { CreateInvoiceRequest } from '@/domain/invoice/schemas';
import { maskBrlDateInput, parseBrlDateToIso, getTodayBrlDate } from '@/core/utils/dateUtils';

export interface InvoiceFormData {
  title: string;
  value: string;
  purchaseDate: string;
  propertyId: string;
  category: string;
  subcategory: string;
  observation: string;
  filePath: string;
  wasAiExtracted: boolean;
  feedbackMessage: string | null;
}

interface InvoiceFormModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (payload: CreateInvoiceRequest) => Promise<void>;
  properties: PropertySimpleName[];
  categories: string[];
  initialData: InvoiceFormData;
  isSubmitting: boolean;
}

export function InvoiceFormModal({
  visible,
  onClose,
  onSave,
  properties,
  categories,
  initialData,
  isSubmitting,
}: InvoiceFormModalProps) {
  const [title, setTitle] = useState(initialData.title);
  const [value, setValue] = useState(initialData.value);
  const [purchaseDate, setPurchaseDate] = useState(initialData.purchaseDate || getTodayBrlDate());
  const [selectedPropertyId, setSelectedPropertyId] = useState(initialData.propertyId);
  const [category, setCategory] = useState(initialData.category || categories[0]);
  const [subcategory, setSubcategory] = useState(initialData.subcategory || 'Geral');
  const [observation, setObservation] = useState(initialData.observation || '');
  const [filePath, setFilePath] = useState(initialData.filePath || '');

  useEffect(() => {
    if (visible) {
      setTitle(initialData.title);
      setValue(initialData.value);
      setPurchaseDate(initialData.purchaseDate || getTodayBrlDate());
      setSelectedPropertyId(
        initialData.propertyId || (properties.length > 0 ? properties[0]._id : '')
      );
      setCategory(initialData.category || categories[0]);
      setSubcategory(initialData.subcategory || 'Geral');
      setObservation(initialData.observation || '');
      setFilePath(initialData.filePath || '');
    }
  }, [visible, initialData, properties, categories]);

  const handleDateChange = (text: string) => {
    setPurchaseDate(maskBrlDateInput(text));
  };

  const handleSubmit = async () => {
    if (!title.trim()) {
      Alert.alert('Atenção', 'Informe um título ou estabelecimento para a nota.');
      return;
    }
    const numericValue = parseFloat(value.replace(',', '.'));
    if (isNaN(numericValue) || numericValue <= 0) {
      Alert.alert('Atenção', 'Informe um valor numérico válido e positivo.');
      return;
    }
    if (!selectedPropertyId) {
      Alert.alert('Atenção', 'Selecione um imóvel para associar esta nota.');
      return;
    }

    const isoDate = parseBrlDateToIso(purchaseDate) || new Date().toISOString().split('T')[0];

    await onSave({
      title: title.trim(),
      value: numericValue,
      purchaseDate: isoDate,
      property: selectedPropertyId,
      category: category.trim(),
      subcategory: subcategory.trim() || 'Geral',
      observation: observation.trim(),
      filePath: filePath.trim(),
    });
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}>
      <SafeAreaView style={styles.modalSafeArea}>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <View style={styles.modalHeader}>
            <View>
              <Text style={styles.modalTitle}>
                {initialData.wasAiExtracted ? 'Revisar Nota Fiscal' : 'Nova Nota Fiscal'}
              </Text>
              <Text style={styles.modalSubtitle}>
                {initialData.wasAiExtracted
                  ? 'Confira os dados lidos pela IA antes de salvar'
                  : 'Cadastre os detalhes do comprovante'}
              </Text>
            </View>
            <Pressable style={styles.closeButton} onPress={onClose}>
              <X size={20} color="#64748b" />
            </Pressable>
          </View>

          {initialData.wasAiExtracted ? (
            <View style={styles.aiExtractedBanner}>
              <Sparkles size={16} color="#7c3aed" />
              <Text style={styles.aiExtractedBannerText}>
                {initialData.feedbackMessage || 'Extraído automaticamente pelo Google Gemini AI.'}
              </Text>
            </View>
          ) : initialData.feedbackMessage ? (
            <View style={styles.aiNoticeBanner}>
              <AlertCircle size={16} color="#b45309" />
              <Text style={styles.aiNoticeBannerText}>{initialData.feedbackMessage}</Text>
            </View>
          ) : null}

          <ScrollView contentContainerStyle={styles.formContent}>
            <Text style={styles.inputLabel}>Título ou Estabelecimento *</Text>
            <TextInput
              style={styles.input}
              placeholder="Ex: Leroy Merlin - Materiais Elétricos"
              value={title}
              onChangeText={setTitle}
            />

            <View style={styles.formRow}>
              <View style={{ flex: 1, marginRight: 8 }}>
                <Text style={styles.inputLabel}>Valor Total (R$) *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="0.00"
                  keyboardType="decimal-pad"
                  value={value}
                  onChangeText={setValue}
                />
              </View>

              <View style={{ flex: 1, marginLeft: 8 }}>
                <Text style={styles.inputLabel}>Data da Compra (DD/MM/AAAA) *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="DD/MM/AAAA"
                  keyboardType="numeric"
                  maxLength={10}
                  value={purchaseDate}
                  onChangeText={handleDateChange}
                />
              </View>
            </View>

            <Text style={styles.inputLabel}>Vincular ao Imóvel *</Text>
            {properties.length === 0 ? (
              <View style={styles.emptyPropertiesWarn}>
                <Text style={styles.emptyPropertiesWarnText}>
                  Nenhum imóvel cadastrado. Cadastre um imóvel na aba Imóveis para associar suas despesas.
                </Text>
              </View>
            ) : (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.pillContainer}>
                {properties.map((p) => {
                  const isSelected = selectedPropertyId === p._id;
                  return (
                    <Pressable
                      key={p._id}
                      style={[styles.propertyPill, isSelected && styles.propertyPillActive]}
                      onPress={() => setSelectedPropertyId(p._id)}>
                      <Building size={14} color={isSelected ? '#ffffff' : '#475569'} />
                      <Text style={[styles.propertyPillText, isSelected && styles.propertyPillTextActive]}>
                        {p.nome}
                      </Text>
                    </Pressable>
                  );
                })}
              </ScrollView>
            )}

            <Text style={styles.inputLabel}>Categoria</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.pillContainer}>
              {categories.map((cat) => {
                const isSelected = category === cat;
                return (
                  <Pressable
                    key={cat}
                    style={[styles.categoryPill, isSelected && styles.categoryPillActive]}
                    onPress={() => setCategory(cat)}>
                    <Text style={[styles.categoryPillText, isSelected && styles.categoryPillTextActive]}>
                      {cat}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>

            <Text style={styles.inputLabel}>Subcategoria / Detalhe</Text>
            <TextInput
              style={styles.input}
              placeholder="Ex: Iluminação, Alvenaria, Hidráulica..."
              value={subcategory}
              onChangeText={setSubcategory}
            />

            <Text style={styles.inputLabel}>Observações Adicionais</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Itens específicos, garantia ou notas complementares..."
              value={observation}
              onChangeText={setObservation}
              multiline
              numberOfLines={3}
            />

            <Pressable
              style={[styles.saveButton, isSubmitting && styles.saveButtonDisabled]}
              onPress={handleSubmit}
              disabled={isSubmitting}>
              {isSubmitting ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <>
                  <UploadCloud size={18} color="#ffffff" />
                  <Text style={styles.saveButtonText}>Confirmar e Salvar no Atlas</Text>
                </>
              )}
            </Pressable>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalSafeArea: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0f172a',
  },
  modalSubtitle: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  aiExtractedBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#f5f3ff',
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginHorizontal: 20,
    marginTop: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#ede9fe',
  },
  aiExtractedBannerText: {
    flex: 1,
    fontSize: 12,
    fontWeight: '600',
    color: '#6d28d9',
  },
  aiNoticeBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#fffbeb',
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginHorizontal: 20,
    marginTop: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#fef3c7',
  },
  aiNoticeBannerText: {
    flex: 1,
    fontSize: 12,
    fontWeight: '600',
    color: '#b45309',
  },
  formContent: {
    padding: 20,
    paddingBottom: 60,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 6,
    marginTop: 12,
  },
  input: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    color: '#0f172a',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  formRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pillContainer: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  propertyPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  propertyPillActive: {
    backgroundColor: '#2563eb',
    borderColor: '#2563eb',
  },
  propertyPillText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#475569',
  },
  propertyPillTextActive: {
    color: '#ffffff',
  },
  categoryPill: {
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  categoryPillActive: {
    backgroundColor: '#7c3aed',
    borderColor: '#7c3aed',
  },
  categoryPillText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#475569',
  },
  categoryPillTextActive: {
    color: '#ffffff',
  },
  emptyPropertiesWarn: {
    backgroundColor: '#fffbeb',
    borderWidth: 1,
    borderColor: '#fef3c7',
    borderRadius: 12,
    padding: 12,
  },
  emptyPropertiesWarnText: {
    fontSize: 12,
    color: '#b45309',
    lineHeight: 16,
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2563eb',
    paddingVertical: 14,
    borderRadius: 14,
    marginTop: 24,
    gap: 8,
  },
  saveButtonDisabled: {
    backgroundColor: '#94a3b8',
  },
  saveButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
  },
});
