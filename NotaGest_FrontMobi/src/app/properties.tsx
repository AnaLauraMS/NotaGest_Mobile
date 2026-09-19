import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Building2, Plus } from 'lucide-react-native';

import { PropertyService } from '@/domain/property/propertyService';
import { PropertyResponse, CreatePropertyRequest } from '@/domain/property/schemas';
import { PropertyCard } from '@/components/property/PropertyCard';
import { PropertyFormModal } from '@/components/property/PropertyFormModal';

export default function PropertiesScreen() {
  const insets = useSafeAreaInsets();
  const bottomInset = Math.max(insets.bottom, Platform.OS === 'android' ? 16 : 0);
  const [properties, setProperties] = useState<PropertyResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchProperties = async () => {
    try {
      setIsLoading(true);
      const data = await PropertyService.getProperties();
      setProperties(data);
    } catch {
      setProperties([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProperties();
  }, []);

  const handleCreateProperty = async (payload: CreatePropertyRequest) => {
    try {
      setIsSubmitting(true);
      const newProperty = await PropertyService.createProperty(payload);
      setProperties((prev) => [newProperty, ...prev]);
      setIsModalOpen(false);
    } catch (err: any) {
      Alert.alert('Erro ao criar imóvel', err?.response?.data?.error || err.message || 'Falha ao salvar imóvel.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteProperty = (id: string) => {
    Alert.alert(
      'Excluir Imóvel',
      'Tem certeza que deseja remover este imóvel?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            try {
              await PropertyService.deleteProperty(id);
              setProperties((prev) => prev.filter((p) => p._id !== id));
            } catch {
              Alert.alert('Erro', 'Não foi possível excluir o imóvel.');
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
          <Text style={styles.title}>Meus Imóveis</Text>
          <Text style={styles.subtitle}>Gestão de obras, reformas e unidades</Text>
        </View>

        <Pressable style={styles.createButton} onPress={() => setIsModalOpen(true)}>
          <Plus size={18} color="#ffffff" />
          <Text style={styles.createButtonText}>Adicionar</Text>
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={[styles.listContent, { paddingBottom: 100 + bottomInset }]}>
        {isLoading ? (
          <ActivityIndicator size="large" color="#2563eb" style={{ marginTop: 40 }} />
        ) : properties.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Building2 size={48} color="#94a3b8" />
            <Text style={styles.emptyTitle}>Nenhum imóvel cadastrado</Text>
            <Text style={styles.emptySubtitle}>Toque no botão acima para cadastrar seu primeiro imóvel</Text>
          </View>
        ) : (
          properties.map((property) => (
            <PropertyCard
              key={property._id}
              property={property}
              onDelete={handleDeleteProperty}
            />
          ))
        )}
      </ScrollView>

      <PropertyFormModal
        visible={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleCreateProperty}
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
    fontSize: 24,
    fontWeight: '800',
    color: '#0f172a',
  },
  subtitle: {
    fontSize: 13,
    color: '#64748b',
    marginTop: 2,
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2563eb',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    gap: 6,
  },
  createButtonText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 14,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 100,
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
