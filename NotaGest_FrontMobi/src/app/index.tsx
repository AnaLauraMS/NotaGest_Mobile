import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Image,
  RefreshControl,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import {
  Building2,
  Receipt,
  Sparkles,
  TrendingUp,
  PlusCircle,
  CheckCircle2,
  AlertCircle,
  ArrowUpRight,
  LogOut,
} from 'lucide-react-native';

import { useAuth } from '@/core/auth/AuthContext';
import { PropertyService } from '@/domain/property/propertyService';
import { PropertyResponse } from '@/domain/property/schemas';
import { InvoiceService } from '@/domain/invoice/invoiceService';
import { InvoiceResponse } from '@/domain/invoice/schemas';

export default function DashboardScreen() {
  const router = useRouter();
  const { logout } = useAuth();
  const insets = useSafeAreaInsets();
  const bottomInset = Math.max(insets.bottom, Platform.OS === 'android' ? 16 : 0);
  const [properties, setProperties] = useState<PropertyResponse[]>([]);
  const [invoices, setInvoices] = useState<InvoiceResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [serverOnline, setServerOnline] = useState(true);

  const loadDashboardData = async () => {
    try {
      const [propsData, invoicesData] = await Promise.all([
        PropertyService.getProperties(),
        InvoiceService.getInvoices(),
      ]);
      setProperties(propsData);
      setInvoices(invoicesData);
      setServerOnline(true);
    } catch {
      setServerOnline(false);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const totalExpenses = invoices.reduce((acc, curr) => acc + (curr.value || 0), 0);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const onRefresh = () => {
    setIsRefreshing(true);
    loadDashboardData();
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingBottom: 100 + bottomInset }]}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} colors={['#2563eb']} />
        }>
        <View style={styles.header}>
          <View>
            <Image
              source={require('@/assets/notagest/LogoHorizontal.png')}
              style={styles.brandLogo}
              resizeMode="contain"
            />
            <Text style={styles.subtitle}>Gestão Patrimonial & Notas Fiscais</Text>
          </View>

          <View style={styles.headerRightActions}>
            <View
              style={[
                styles.connectionBadge,
                serverOnline ? styles.badgeSuccess : styles.badgeWarning,
              ]}>
              {serverOnline ? (
                <CheckCircle2 size={14} color="#16a34a" />
              ) : (
                <AlertCircle size={14} color="#d97706" />
              )}
              <Text
                style={[
                  styles.connectionText,
                  serverOnline ? styles.textSuccess : styles.textWarning,
                ]}>
                {serverOnline ? 'Online' : 'Offline'}
              </Text>
            </View>

            <Pressable style={styles.logoutButton} onPress={logout}>
              <LogOut size={16} color="#ef4444" />
            </Pressable>
          </View>
        </View>

        <View style={styles.heroCard}>
          <View style={styles.heroHeader}>
            <Text style={styles.heroLabel}>Total de Despesas Registradas</Text>
            <View style={styles.heroTag}>
              <TrendingUp size={14} color="#2563eb" />
              <Text style={styles.heroTagText}>Consolidado</Text>
            </View>
          </View>
          <Text style={styles.heroAmount}>
            {isLoading ? (
              <ActivityIndicator size="small" color="#ffffff" />
            ) : (
              `R$ ${totalExpenses.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
            )}
          </Text>
          <Text style={styles.heroHint}>Atualizado em tempo real via IA Gemini</Text>
        </View>

        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <View style={[styles.iconContainer, { backgroundColor: '#eff6ff' }]}>
              <Building2 size={20} color="#2563eb" />
            </View>
            <Text style={styles.statValue}>
              {isLoading ? <ActivityIndicator size="small" color="#2563eb" /> : properties.length}
            </Text>
            <Text style={styles.statLabel}>Imóveis Cadastrados</Text>
          </View>

          <View style={styles.statCard}>
            <View style={[styles.iconContainer, { backgroundColor: '#f0fdf4' }]}>
              <Receipt size={20} color="#16a34a" />
            </View>
            <Text style={styles.statValue}>
              {isLoading ? <ActivityIndicator size="small" color="#16a34a" /> : invoices.length}
            </Text>
            <Text style={styles.statLabel}>Notas Fiscais</Text>
          </View>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Ações Rápidas</Text>
          <Text style={styles.sectionHint}>Zona de Acesso Direto</Text>
        </View>

        <View style={styles.actionsGrid}>
          <Pressable
            style={styles.actionButton}
            onPress={() => router.push('/properties')}>
            <View style={[styles.actionIconWrapper, { backgroundColor: '#2563eb' }]}>
              <PlusCircle size={22} color="#ffffff" />
            </View>
            <View style={styles.actionTextWrapper}>
              <Text style={styles.actionTitle}>Novo Imóvel</Text>
              <Text style={styles.actionDescription}>Cadastrar endereço e tipo</Text>
            </View>
            <ArrowUpRight size={18} color="#94a3b8" />
          </Pressable>

          <Pressable
            style={styles.actionButton}
            onPress={() => router.push('/invoices')}>
            <View style={[styles.actionIconWrapper, { backgroundColor: '#082f49' }]}>
              <Receipt size={22} color="#ffffff" />
            </View>
            <View style={styles.actionTextWrapper}>
              <Text style={styles.actionTitle}>Escanear Nota</Text>
              <Text style={styles.actionDescription}>Extração OCR com IA Gemini</Text>
            </View>
            <ArrowUpRight size={18} color="#94a3b8" />
          </Pressable>

          <Pressable
            style={styles.actionButton}
            onPress={() => router.push('/chat')}>
            <View style={[styles.actionIconWrapper, { backgroundColor: '#7c3aed' }]}>
              <Sparkles size={22} color="#ffffff" />
            </View>
            <View style={styles.actionTextWrapper}>
              <Text style={styles.actionTitle}>Assistente IA (RAG)</Text>
              <Text style={styles.actionDescription}>Tirar dúvidas sobre gastos</Text>
            </View>
            <ArrowUpRight size={18} color="#94a3b8" />
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 100,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  brandLogo: {
    width: 140,
    height: 38,
  },
  subtitle: {
    fontSize: 13,
    color: '#64748b',
    marginTop: 4,
    fontWeight: '500',
  },
  connectionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    gap: 6,
    borderWidth: 1,
  },
  badgeSuccess: {
    backgroundColor: '#f0fdf4',
    borderColor: '#bbf7d0',
  },
  badgeWarning: {
    backgroundColor: '#fffbeb',
    borderColor: '#fde68a',
  },
  connectionText: {
    fontSize: 11,
    fontWeight: '600',
  },
  textSuccess: {
    color: '#16a34a',
  },
  textWarning: {
    color: '#d97706',
  },
  headerRightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  logoutButton: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: '#fef2f2',
    borderWidth: 1,
    borderColor: '#fecaca',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroCard: {
    backgroundColor: '#082f49',
    borderRadius: 24,
    padding: 24,
    marginBottom: 20,
    boxShadow: '0px 8px 16px rgba(8, 47, 73, 0.15)',
    elevation: 8,
  },
  heroHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  heroLabel: {
    fontSize: 13,
    color: '#94a3b8',
    fontWeight: '500',
  },
  heroTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#eff6ff',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  heroTagText: {
    fontSize: 11,
    color: '#2563eb',
    fontWeight: '700',
  },
  heroAmount: {
    fontSize: 32,
    fontWeight: '800',
    color: '#ffffff',
    letterSpacing: -0.5,
  },
  heroHint: {
    fontSize: 12,
    color: '#cbd5e1',
    marginTop: 8,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 28,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.04)',
    elevation: 2,
  },
  iconContainer: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  statValue: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0f172a',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '500',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0f172a',
  },
  sectionHint: {
    fontSize: 12,
    color: '#94a3b8',
    fontWeight: '500',
  },
  actionsGrid: {
    gap: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.04)',
    elevation: 2,
  },
  actionIconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  actionTextWrapper: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 2,
  },
  actionDescription: {
    fontSize: 12,
    color: '#64748b',
  },
});
