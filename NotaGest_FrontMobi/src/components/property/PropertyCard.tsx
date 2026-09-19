import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Building2, Tag, MapPin, Trash2 } from 'lucide-react-native';
import { PropertyResponse } from '@/domain/property/schemas';

interface PropertyCardProps {
  property: PropertyResponse;
  onDelete: (id: string) => void;
}

export function PropertyCard({ property, onDelete }: PropertyCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.cardHeaderLeft}>
          <View style={styles.iconWrapper}>
            <Building2 size={20} color="#2563eb" />
          </View>
          <View>
            <Text style={styles.propertyName}>{property.nome}</Text>
            <View style={styles.typeBadge}>
              <Tag size={12} color="#64748b" />
              <Text style={styles.typeBadgeText}>{property.tipo || 'Residencial'}</Text>
            </View>
          </View>
        </View>

        <Pressable onPress={() => onDelete(property._id)} style={styles.deleteButton}>
          <Trash2 size={16} color="#ef4444" />
        </Pressable>
      </View>

      <View style={styles.cardBody}>
        {property.rua ? (
          <View style={styles.locationRow}>
            <MapPin size={14} color="#64748b" />
            <Text style={styles.locationText}>
              {property.rua}
              {property.numero ? `, ${property.numero}` : ''}
              {property.bairro ? ` - ${property.bairro}` : ''}
            </Text>
          </View>
        ) : null}

        <View style={styles.locationRow}>
          <MapPin size={14} color="#64748b" />
          <Text style={styles.locationText}>
            {property.cidade || 'Cidade não informada'}
            {property.estado ? ` / ${property.estado}` : ''}
            {property.cep ? ` • CEP: ${property.cep}` : ''}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  iconWrapper: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: '#eff6ff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  propertyName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0f172a',
  },
  typeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  typeBadgeText: {
    fontSize: 12,
    color: '#64748b',
  },
  deleteButton: {
    padding: 6,
  },
  cardBody: {
    gap: 6,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    paddingTop: 10,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  locationText: {
    fontSize: 13,
    color: '#64748b',
    flex: 1,
  },
});
