import React from 'react';
import {
  Tabs,
  TabList,
  TabTrigger,
  TabSlot,
  TabTriggerSlotProps,
  TabListProps,
} from 'expo-router/ui';
import {
  Pressable,
  useColorScheme,
  View,
  StyleSheet,
  Text,
  useWindowDimensions,
  Platform,
} from 'react-native';
import { LayoutDashboard, Building2, Receipt, Sparkles } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Colors } from '@/constants/theme';

export default function AppTabs() {
  const { width } = useWindowDimensions();
  const isMobile = width < 768;

  return (
    <Tabs>
      <TabSlot style={{ height: '100%' }} />
      <TabList asChild>
        <CustomTabList isMobile={isMobile}>
          <TabTrigger name="index" href="/" asChild>
            <TabButton isMobile={isMobile} icon={LayoutDashboard} label="Dashboard" />
          </TabTrigger>
          <TabTrigger name="properties" href="/properties" asChild>
            <TabButton isMobile={isMobile} icon={Building2} label="Imóveis" />
          </TabTrigger>
          <TabTrigger name="invoices" href="/invoices" asChild>
            <TabButton
              isMobile={isMobile}
              icon={Receipt}
              label={isMobile ? 'Notas' : 'Notas Fiscais'}
            />
          </TabTrigger>
          <TabTrigger name="chat" href="/chat" asChild>
            <TabButton
              isMobile={isMobile}
              icon={Sparkles}
              label={isMobile ? 'Assistente' : 'Assistente IA'}
            />
          </TabTrigger>
        </CustomTabList>
      </TabList>
    </Tabs>
  );
}

interface TabButtonProps extends TabTriggerSlotProps {
  icon?: any;
  label: string;
  isMobile?: boolean;
}

export function TabButton({
  isFocused,
  icon: Icon,
  label,
  isMobile = true,
  ...props
}: TabButtonProps) {
  return (
    <Pressable {...props} style={styles.mobileTabButton}>
      <View style={styles.mobileTabContent}>
        {Icon && (
          <Icon
            size={20}
            color={isFocused ? '#2563eb' : '#64748b'}
            strokeWidth={isFocused ? 2.4 : 1.8}
          />
        )}
        <Text
          style={[
            styles.mobileTabText,
            isFocused ? styles.mobileTextActive : styles.mobileTextInactive,
          ]}>
          {label}
        </Text>
      </View>
    </Pressable>
  );
}

interface CustomTabListProps extends TabListProps {
  isMobile?: boolean;
}

export function CustomTabList({ isMobile, ...props }: CustomTabListProps) {
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'unspecified' ? 'light' : scheme];
  const insets = useSafeAreaInsets();
  const bottomInset = Math.max(insets.bottom, Platform.OS === 'android' ? 16 : 0);

  return (
    <View
      {...props}
      style={[
        styles.mobileTabListContainer,
        {
          backgroundColor: colors.backgroundElement || '#ffffff',
          borderTopColor: colors.border || '#e2e8f0',
          height: 64 + bottomInset,
          paddingBottom: bottomInset,
        },
      ]}>
      <View style={styles.mobileTabsRow}>{props.children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  mobileTabListContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTopWidth: 1,
    boxShadow: '0px -2px 10px rgba(0, 0, 0, 0.06)',
    elevation: 12,
    zIndex: 100,
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  mobileTabsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    width: '100%',
    height: 64,
  },
  mobileTabButton: {
    flex: 1,
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mobileTabContent: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
  },
  mobileTabText: {
    fontSize: 11,
    fontWeight: '600',
  },
  mobileTextActive: {
    color: '#2563eb',
    fontWeight: '700',
  },
  mobileTextInactive: {
    color: '#64748b',
  },
});
