import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Receipt, Building, Calendar, CheckCircle2, Trash2 } from 'lucide-react-native';
import { InvoiceResponse } from '@/domain/invoice/schemas';
import { formatToBrlDate } from '@/core/utils/dateUtils';
import { formatBrlCurrency } from '@/core/utils/currencyUtils';

interface InvoiceCardProps {
  invoice: InvoiceResponse;
  onDelete: (id: string, title: string) => void;
}

export function InvoiceCard({ invoice, onDelete }: InvoiceCardProps) {
  const getPropertyName = (property: InvoiceResponse['property']) => {
    if (!property) return 'Imóvel não associado';
    if (typeof property === 'object' && 'nome' in property) {
      return property.nome;
    }
    return String(property);
  };

  return (
    <View style={styles.card}>
      <View style={styles.cardTop}>
        <View style={styles.cardIconWrapper}>
          <Receipt size={20} color="#2563eb" />
        </View>
        <View style={styles.cardHeaderInfo}>
          <Text style={styles.invoiceTitle}>{invoice.title}</Text>
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryText}>{invoice.category || 'Construção'}</Text>
            {invoice.subcategory ? (
              <Text style={styles.subcategoryText}>• {invoice.subcategory}</Text>
            ) : null}
          </View>
        </View>
        <View style={styles.cardTopRight}>
          <Text style={styles.invoiceValue}>{formatBrlCurrency(invoice.value)}</Text>
          <Pressable
            hitSlop={8}
            style={styles.deleteIconButton}
            onPress={() => onDelete(invoice._id, invoice.title)}>
            <Trash2 size={15} color="#ef4444" />
          </Pressable>
        </View>
      </View>

      {invoice.observation ? (
        <Text style={styles.observationText} numberOfLines={2}>
          {invoice.observation}
        </Text>
      ) : null}

      <View style={styles.cardDetails}>
        <View style={styles.detailItem}>
          <Building size={14} color="#64748b" />
          <Text style={styles.detailText} numberOfLines={1}>
            {getPropertyName(invoice.property)}
          </Text>
        </View>
        <View style={styles.detailItem}>
          <Calendar size={14} color="#64748b" />
          <Text style={styles.detailText}>{formatToBrlDate(invoice.purchaseDate)}</Text>
        </View>
        <View style={styles.statusVerified}>
          <CheckCircle2 size={13} color="#16a34a" />
          <Text style={styles.statusText}>Validado</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  cardIconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#eff6ff',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  cardHeaderInfo: {
    flex: 1,
  },
  invoiceTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0f172a',
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#f1f5f9',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    marginTop: 4,
  },
  categoryText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#475569',
  },
  subcategoryText: {
    fontSize: 11,
    color: '#64748b',
  },
  cardTopRight: {
    alignItems: 'flex-end',
    gap: 6,
  },
  invoiceValue: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0f172a',
  },
  deleteIconButton: {
    padding: 4,
  },
  observationText: {
    fontSize: 12,
    color: '#64748b',
    marginBottom: 10,
    backgroundColor: '#f8fafc',
    padding: 8,
    borderRadius: 8,
  },
  cardDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    paddingTop: 10,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    maxWidth: '40%',
  },
  detailText: {
    fontSize: 12,
    color: '#64748b',
  },
  statusVerified: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#f0fdf4',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#16a34a',
  },
});
