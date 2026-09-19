import React, { useState } from 'react';
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
} from 'react-native';
import { X, Search } from 'lucide-react-native';
import { PropertyType, CreatePropertyRequest } from '@/domain/property/schemas';
import { ViaCepService } from '@/domain/property/viaCepService';
import { maskCepInput, cleanCep } from '@/core/utils/cepUtils';

interface PropertyFormModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (property: CreatePropertyRequest) => Promise<void>;
  isSubmitting: boolean;
}

export function PropertyFormModal({
  visible,
  onClose,
  onSave,
  isSubmitting,
}: PropertyFormModalProps) {
  const [nome, setNome] = useState('');
  const [cep, setCep] = useState('');
  const [rua, setRua] = useState('');
  const [numero, setNumero] = useState('');
  const [bairro, setBairro] = useState('');
  const [cidade, setCidade] = useState('');
  const [estado, setEstado] = useState('');
  const [tipo, setTipo] = useState<PropertyType>(PropertyType.Residencial);
  const [isSearchingCep, setIsSearchingCep] = useState(false);

  const resetForm = () => {
    setNome('');
    setCep('');
    setRua('');
    setNumero('');
    setBairro('');
    setCidade('');
    setEstado('');
    setTipo(PropertyType.Residencial);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleCepChange = async (text: string) => {
    const formatted = maskCepInput(text);
    setCep(formatted);

    const rawCep = cleanCep(text);
    if (rawCep.length === 8) {
      setIsSearchingCep(true);
      try {
        const address = await ViaCepService.fetchAddressByCep(rawCep);
        if (address) {
          setRua(address.rua);
          setBairro(address.bairro);
          setCidade(address.cidade);
          setEstado(address.estado);
        }
      } finally {
        setIsSearchingCep(false);
      }
    }
  };

  const handleSubmit = async () => {
    if (!nome.trim()) return;

    await onSave({
      nome: nome.trim(),
      cep: cep.trim(),
      rua: rua.trim(),
      numero: numero.trim(),
      bairro: bairro.trim(),
      cidade: cidade.trim(),
      estado: estado.trim(),
      tipo,
    });
    resetForm();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Novo Imóvel</Text>
            <Pressable onPress={handleClose}>
              <X size={22} color="#64748b" />
            </Pressable>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.formScroll}>
            <Text style={styles.inputLabel}>Nome do Imóvel *</Text>
            <TextInput
              style={styles.input}
              placeholder="Ex: Residencial Alphaville"
              value={nome}
              onChangeText={setNome}
            />

            <View style={styles.labelWithAction}>
              <Text style={styles.inputLabel}>CEP (Busca automática)</Text>
              {isSearchingCep ? <ActivityIndicator size="small" color="#2563eb" /> : null}
            </View>
            <View style={styles.cepInputContainer}>
              <TextInput
                style={styles.cepInput}
                placeholder="00000-000"
                value={cep}
                onChangeText={handleCepChange}
                keyboardType="numeric"
                maxLength={9}
              />
              <View style={styles.cepIconWrapper}>
                <Search size={18} color="#64748b" />
              </View>
            </View>

            <Text style={styles.inputLabel}>Rua / Logradouro</Text>
            <TextInput
              style={styles.input}
              placeholder="Ex: Av. Paulista"
              value={rua}
              onChangeText={setRua}
            />

            <View style={styles.rowInputs}>
              <View style={{ flex: 1 }}>
                <Text style={styles.inputLabel}>Número</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Ex: 1000"
                  value={numero}
                  onChangeText={setNumero}
                />
              </View>
              <View style={{ flex: 2 }}>
                <Text style={styles.inputLabel}>Bairro</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Ex: Bela Vista"
                  value={bairro}
                  onChangeText={setBairro}
                />
              </View>
            </View>

            <View style={styles.rowInputs}>
              <View style={{ flex: 2 }}>
                <Text style={styles.inputLabel}>Cidade</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Ex: São Paulo"
                  value={cidade}
                  onChangeText={setCidade}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.inputLabel}>Estado (UF)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Ex: SP"
                  value={estado}
                  onChangeText={setEstado}
                  maxLength={2}
                  autoCapitalize="characters"
                />
              </View>
            </View>

            <Text style={styles.inputLabel}>Tipo de Imóvel</Text>
            <View style={styles.typeSelector}>
              {[
                PropertyType.Residencial,
                PropertyType.Comercial,
                PropertyType.Industrial,
                PropertyType.Rural,
              ].map((t) => (
                <Pressable
                  key={t}
                  style={[styles.typeOption, tipo === t && styles.typeOptionActive]}
                  onPress={() => setTipo(t)}>
                  <Text style={[styles.typeOptionText, tipo === t && styles.typeOptionTextActive]}>
                    {t}
                  </Text>
                </Pressable>
              ))}
            </View>

            <Pressable
              style={[styles.saveButton, (!nome.trim() || isSubmitting) && styles.saveButtonDisabled]}
              onPress={handleSubmit}
              disabled={!nome.trim() || isSubmitting}>
              {isSubmitting ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <Text style={styles.saveButtonText}>Salvar Imóvel</Text>
              )}
            </Pressable>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    maxHeight: '85%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0f172a',
  },
  formScroll: {
    paddingBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#334155',
    marginBottom: 6,
    marginTop: 12,
  },
  labelWithAction: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  input: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    color: '#0f172a',
  },
  cepInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
  },
  cepInput: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    color: '#0f172a',
  },
  cepIconWrapper: {
    paddingHorizontal: 14,
  },
  rowInputs: {
    flexDirection: 'row',
    gap: 12,
  },
  typeSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 6,
  },
  typeOption: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    backgroundColor: '#f1f5f9',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  typeOptionActive: {
    backgroundColor: '#2563eb',
    borderColor: '#2563eb',
  },
  typeOptionText: {
    fontSize: 13,
    color: '#475569',
    fontWeight: '500',
  },
  typeOptionTextActive: {
    color: '#ffffff',
    fontWeight: '600',
  },
  saveButton: {
    backgroundColor: '#2563eb',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 24,
  },
  saveButtonDisabled: {
    backgroundColor: '#94a3b8',
  },
  saveButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});
