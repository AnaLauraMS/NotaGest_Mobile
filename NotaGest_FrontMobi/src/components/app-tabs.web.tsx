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
  Image,
  useWindowDimensions,
} from 'react-native';
import { LayoutDashboard, Building2, Receipt, Sparkles } from 'lucide-react-native';

import { Colors, MaxContentWidth, Spacing } from '@/constants/theme';

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
  isMobile,
  ...props
}: TabButtonProps) {
  if (isMobile) {
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

  return (
    <Pressable {...props} style={({ pressed }) => pressed && styles.pressed}>
      <View
        style={[
          styles.tabButtonView,
          isFocused ? styles.tabButtonActive : styles.tabButtonInactive,
        ]}>
        {Icon && (
          <Icon
            size={16}
            color={isFocused ? '#ffffff' : '#64748b'}
            style={{ marginRight: 6 }}
          />
        )}
        <Text
          style={[
            styles.tabButtonText,
            isFocused ? styles.tabTextActive : styles.tabTextInactive,
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

  if (isMobile) {
    return (
      <View
        {...props}
        style={[
          styles.mobileTabListContainer,
          {
            backgroundColor: colors.backgroundElement || '#ffffff',
            borderTopColor: colors.border || '#e2e8f0',
          },
        ]}>
        <View style={styles.mobileTabsRow}>{props.children}</View>
      </View>
    );
  }

  return (
    <View {...props} style={styles.tabListContainer}>
      <View
        style={[
          styles.innerContainer,
          { backgroundColor: colors.backgroundElement, borderColor: colors.border },
        ]}>
        <View style={styles.brandContainer}>
          <Image
            source={require('@/assets/notagest/LogoHorizontal.png')}
            style={styles.logoImage}
            resizeMode="contain"
          />
          <View style={styles.statusBadge}>
            <View style={styles.statusDot} />
            <Text style={styles.statusText}>Online</Text>
          </View>
        </View>

        <View style={styles.tabsWrapper}>{props.children}</View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  mobileTabListContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 64,
    borderTopWidth: 1,
    boxShadow: '0px -2px 10px rgba(0, 0, 0, 0.06)',
    zIndex: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mobileTabsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    width: '100%',
    height: '100%',
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
  tabListContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: Spacing.three,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    zIndex: 100,
  },
  innerContainer: {
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.four,
    borderRadius: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexGrow: 1,
    maxWidth: MaxContentWidth,
    borderWidth: 1,
    boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.08)',
  },
  brandContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  logoImage: {
    width: 110,
    height: 32,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ecfdf5',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    gap: 4,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10b981',
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#047857',
  },
  tabsWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
  },
  pressed: {
    opacity: 0.8,
  },
  tabButtonView: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 16,
  },
  tabButtonActive: {
    backgroundColor: '#2563eb',
  },
  tabButtonInactive: {
    backgroundColor: 'transparent',
  },
  tabButtonText: {
    fontSize: 13,
    fontWeight: '600',
  },
  tabTextActive: {
    color: '#ffffff',
  },
  tabTextInactive: {
    color: '#64748b',
  },
});
