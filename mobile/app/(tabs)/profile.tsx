import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, Switch, Alert, Modal, Pressable } from 'react-native';
import { LogOut, User, Globe, Moon, Sun, Bell, BellOff, ChevronRight, Check, Monitor } from 'lucide-react-native';
import { useAuth } from '@/context/AuthContext';
import { useAppTheme } from '@/context/ThemeContext';
import { Colors } from '@/constants/theme';
import { scheduleTestNotification, registerForPushNotificationsAsync } from '@/services/notificationService';
import * as Haptics from 'expo-haptics';

export default function ProfileScreen() {
  const { profile, logout } = useAuth();
  const { colorScheme, themeMode, setThemeMode } = useAppTheme();
  const theme = Colors[colorScheme ?? 'dark'];

  const [notificationsEnabled, setNotificationsEnabled] = useState(profile?.notificationsEnabled ?? true);
  const [showThemePicker, setShowThemePicker] = useState(false);

  const handleToggleNotifications = async (value: boolean) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (value) {
      const token = await registerForPushNotificationsAsync();
      if (token !== null) {
        setNotificationsEnabled(true);
        await scheduleTestNotification();
        Alert.alert('✅ Notificações Ativas', 'Você vai receber novidades de filmes e atores favoritos!');
      } else {
        Alert.alert('Permissão Negada', 'Ative as notificações nas configurações do seu celular.');
      }
    } else {
      setNotificationsEnabled(false);
      Alert.alert('🔕 Notificações Desativadas', 'Você não receberá mais alertas do Cine Now.');
    }
  };

  const themeOptions: { label: string; value: 'system' | 'light' | 'dark'; icon: any }[] = [
    { label: 'Sistema', value: 'system', icon: <Monitor size={20} color={theme.tint} /> },
    { label: 'Escuro 🌙', value: 'dark', icon: <Moon size={20} color={theme.tint} /> },
    { label: 'Claro ☀️', value: 'light', icon: <Sun size={20} color={theme.tint} /> },
  ];

  const activeThemeLabel = themeOptions.find(o => o.value === themeMode)?.label || 'Sistema';

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.background }]}
      contentContainerStyle={{ paddingBottom: 100 }}
    >
      {/* Background Glow */}
      <View style={[styles.backgroundGlow, { backgroundColor: theme.tint }]} />

      {/* Avatar Header */}
      <View style={styles.header}>
        <View style={[styles.avatarContainer, { backgroundColor: `${theme.tint}20`, borderColor: `${theme.tint}40` }]}>
          <User size={52} color={theme.tint} />
        </View>
        <Text style={[styles.userName, { color: theme.text }]}>{profile?.name || 'Cine User'}</Text>
        <Text style={[styles.userEmail, { color: theme.icon }]}>{profile?.email || '@thecinenow'}</Text>
        <View style={[styles.planBadge, { backgroundColor: `${theme.tint}22`, borderColor: `${theme.tint}55` }]}>
          <Text style={[styles.planBadgeText, { color: theme.tint }]}>{profile?.plan || 'Free'}</Text>
        </View>
      </View>

      {/* Stats */}
      <View style={styles.statsContainer}>
        <View style={[styles.statBox, { backgroundColor: theme.surface, borderColor: theme.outline }]}>
          <Text style={[styles.statLabel, { color: theme.icon }]}>FILMES SALVOS</Text>
          <Text style={[styles.statValue, { color: theme.tint }]}>{profile?.saved?.length || 0}</Text>
        </View>
        <View style={[styles.statBox, { backgroundColor: theme.surface, borderColor: theme.outline }]}>
          <Text style={[styles.statLabel, { color: theme.icon }]}>ATORES SEGUIDOS</Text>
          <Text style={[styles.statValue, { color: theme.tint }]}>{profile?.followingActors?.length || 0}</Text>
        </View>
      </View>

      {/* Settings */}
      <View style={styles.settingsSection}>
        <Text style={[styles.sectionTitle, { color: theme.tint }]}>PREFERÊNCIAS DO APP</Text>
        <View style={[styles.settingsList, { backgroundColor: theme.surface, borderColor: theme.outline }]}>

          {/* Theme Picker */}
          <TouchableOpacity
            style={[styles.settingItem, { borderBottomWidth: 1, borderBottomColor: theme.outline }]}
            onPress={() => { Haptics.selectionAsync(); setShowThemePicker(true); }}
          >
            <View style={styles.settingItemLeft}>
              <View style={[styles.iconContainer, { backgroundColor: `${theme.tint}15` }]}>
                <Moon size={20} color={theme.tint} />
              </View>
              <Text style={[styles.settingItemTitle, { color: theme.text }]}>Tema do App</Text>
            </View>
            <View style={styles.settingRight}>
              <View style={[styles.badge, { backgroundColor: `${theme.tint}15` }]}>
                <Text style={[styles.badgeText, { color: theme.tint }]}>{activeThemeLabel}</Text>
              </View>
              <ChevronRight size={16} color={theme.icon} />
            </View>
          </TouchableOpacity>

          {/* Notifications Toggle */}
          <View style={styles.settingItem}>
            <View style={styles.settingItemLeft}>
              <View style={[styles.iconContainer, { backgroundColor: `${theme.tint}15` }]}>
                {notificationsEnabled
                  ? <Bell size={20} color={theme.tint} />
                  : <BellOff size={20} color={theme.icon} />
                }
              </View>
              <View>
                <Text style={[styles.settingItemTitle, { color: theme.text }]}>Notificações Push</Text>
                <Text style={[styles.settingSubtitle, { color: theme.icon }]}>
                  {notificationsEnabled ? 'Ativas — recebendo alertas' : 'Desativadas'}
                </Text>
              </View>
            </View>
            <Switch
              value={notificationsEnabled}
              onValueChange={handleToggleNotifications}
              trackColor={{ false: theme.outline, true: `${theme.tint}80` }}
              thumbColor={notificationsEnabled ? theme.tint : theme.icon}
            />
          </View>

          {/* Language */}
          <TouchableOpacity style={styles.settingItem}>
            <View style={styles.settingItemLeft}>
              <View style={[styles.iconContainer, { backgroundColor: `${theme.tint}15` }]}>
                <Globe size={20} color={theme.tint} />
              </View>
              <Text style={[styles.settingItemTitle, { color: theme.text }]}>Idioma</Text>
            </View>
            <View style={styles.settingRight}>
              <View style={[styles.badge, { backgroundColor: `${theme.tint}15` }]}>
                <Text style={[styles.badgeText, { color: theme.tint }]}>PT-BR</Text>
              </View>
              <ChevronRight size={16} color={theme.icon} />
            </View>
          </TouchableOpacity>

        </View>
      </View>

      {/* Logout */}
      <TouchableOpacity
        style={[styles.logoutButton, { backgroundColor: 'rgba(239,68,68,0.08)', borderColor: 'rgba(239,68,68,0.2)' }]}
        onPress={logout}
      >
        <LogOut color="#ef4444" size={20} />
        <Text style={styles.logoutText}>Sair da Conta</Text>
      </TouchableOpacity>

      {/* Theme Picker Modal */}
      <Modal visible={showThemePicker} transparent animationType="slide">
        <Pressable style={styles.modalOverlay} onPress={() => setShowThemePicker(false)}>
          <View style={[styles.modalSheet, { backgroundColor: theme.surface }]}>
            <View style={[styles.modalHandle, { backgroundColor: theme.outline }]} />
            <Text style={[styles.modalTitle, { color: theme.text }]}>Escolher Tema</Text>
            {themeOptions.map((option) => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.themeOption,
                  { borderColor: theme.outline },
                  themeMode === option.value && { backgroundColor: `${theme.tint}18` }
                ]}
                onPress={() => {
                  Haptics.selectionAsync();
                  setThemeMode(option.value);
                  setShowThemePicker(false);
                }}
              >
                <View style={styles.settingItemLeft}>
                  <View style={[styles.iconContainer, { backgroundColor: `${theme.tint}15` }]}>
                    {option.icon}
                  </View>
                  <Text style={[styles.settingItemTitle, { color: theme.text }]}>{option.label}</Text>
                </View>
                {themeMode === option.value && <Check size={18} color={theme.tint} />}
              </TouchableOpacity>
            ))}
          </View>
        </Pressable>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 70, paddingHorizontal: 20 },
  backgroundGlow: {
    position: 'absolute', top: -80, left: '20%',
    width: 280, height: 280, opacity: 0.10, borderRadius: 140,
  },
  header: { alignItems: 'center', marginBottom: 32 },
  avatarContainer: {
    width: 100, height: 100, borderRadius: 50, borderWidth: 2,
    alignItems: 'center', justifyContent: 'center', marginBottom: 16,
  },
  userName: { fontSize: 24, fontWeight: 'bold', marginBottom: 4 },
  userEmail: { fontSize: 14, marginBottom: 12 },
  planBadge: { paddingHorizontal: 16, paddingVertical: 5, borderRadius: 20, borderWidth: 1 },
  planBadgeText: { fontSize: 11, fontWeight: '900', letterSpacing: 1.5, textTransform: 'uppercase' },
  statsContainer: { flexDirection: 'row', gap: 12, marginBottom: 32 },
  statBox: { flex: 1, padding: 20, borderRadius: 16, borderWidth: 0, alignItems: 'center' },
  statLabel: { fontSize: 9, fontWeight: '900', letterSpacing: 2, marginBottom: 10, textTransform: 'uppercase' },
  statValue: { fontSize: 28, fontWeight: '900' },
  settingsSection: { marginBottom: 32 },
  sectionTitle: { fontSize: 11, fontWeight: 'bold', letterSpacing: 2, marginBottom: 12, paddingHorizontal: 4 },
  settingsList: { borderRadius: 16, overflow: 'hidden', borderWidth: 0 },
  settingItem: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16,
  },
  settingItemLeft: { flexDirection: 'row', alignItems: 'center', gap: 14, flex: 1 },
  iconContainer: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  settingItemTitle: { fontSize: 14, fontWeight: '600' },
  settingSubtitle: { fontSize: 11, marginTop: 2 },
  settingRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  badgeText: { fontSize: 11, fontWeight: 'bold' },
  logoutButton: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 10, borderWidth: 1, padding: 18, borderRadius: 16, marginBottom: 20,
  },
  logoutText: { color: '#ef4444', fontWeight: 'bold', fontSize: 16 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  modalSheet: { borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 40 },
  modalHandle: { width: 40, height: 4, borderRadius: 2, alignSelf: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 18, fontWeight: '900', marginBottom: 20, textTransform: 'uppercase', letterSpacing: 1 },
  themeOption: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingVertical: 14, paddingHorizontal: 16, borderRadius: 14, borderWidth: 1, marginBottom: 10,
  },
});
