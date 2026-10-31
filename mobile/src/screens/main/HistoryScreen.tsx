import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { conversationApi, Conversation, ChatMessage } from '../../api/conversationApi';
import { useSettings } from '../../context/SettingsContext';
import { COLORS, RADIUS, SPACING } from '../../constants/theme';
import { getLanguageByCode } from '../../constants/languages';

export const HistoryScreen: React.FC = () => {
  const { theme } = useSettings();
  const isDark = theme === 'dark';

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeConvMessages, setActiveConvMessages] = useState<ChatMessage[] | null>(null);
  const [selectedConvTitle, setSelectedConvTitle] = useState<string>('');

  const loadConversations = useCallback(async () => {
    try {
      const res = await conversationApi.getConversations();
      if (res.data) {
        setConversations(res.data);
      }
    } catch (err: any) {
      console.warn('[Load History Warning]:', err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  const onRefresh = () => {
    setRefreshing(true);
    loadConversations();
  };

  const handleDelete = (id: string, title: string) => {
    Alert.alert(
      'Delete Conversation',
      `Are you sure you want to delete "${title}"? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await conversationApi.deleteConversation(id);
              setConversations((prev) => prev.filter((c) => c.id !== id));
              if (activeConvMessages) {
                setActiveConvMessages(null);
              }
            } catch (err: any) {
              Alert.alert('Error', err.message || 'Could not delete conversation.');
            }
          },
        },
      ]
    );
  };

  const handleOpenConversation = async (conv: Conversation) => {
    try {
      setSelectedConvTitle(conv.title);
      const res = await conversationApi.getConversationById(conv.id);
      setActiveConvMessages(res.messages || []);
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Could not load conversation thread.');
    }
  };

  const filteredConversations = conversations.filter((c) => {
    const q = search.toLowerCase();
    return (
      c.title?.toLowerCase().includes(q) ||
      c.language?.toLowerCase().includes(q)
    );
  });

  // Modal / Thread viewer when viewing a specific conversation
  if (activeConvMessages) {
    return (
      <SafeAreaView
        style={[
          styles.container,
          { backgroundColor: isDark ? COLORS.dark.background : COLORS.light.background },
        ]}
      >
        <View style={styles.threadHeader}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => setActiveConvMessages(null)}
          >
            <Ionicons
              name="arrow-back"
              size={22}
              color={isDark ? COLORS.dark.text : COLORS.light.text}
            />
          </TouchableOpacity>
          <Text
            style={[styles.threadTitle, { color: isDark ? COLORS.dark.text : COLORS.light.text }]}
            numberOfLines={1}
          >
            {selectedConvTitle}
          </Text>
        </View>

        <FlatList
          data={activeConvMessages}
          keyExtractor={(item) => item.id || Math.random().toString()}
          contentContainerStyle={styles.threadList}
          renderItem={({ item }) => {
            const isUser = item.sender === 'user';
            return (
              <View
                style={[
                  styles.messageBubble,
                  isUser
                    ? [styles.userBubble, { backgroundColor: COLORS.primary }]
                    : [styles.assistantBubble, { backgroundColor: isDark ? COLORS.dark.card : COLORS.light.card }],
                ]}
              >
                <Text
                  style={[
                    styles.messageText,
                    { color: isUser ? '#FFFFFF' : isDark ? COLORS.dark.text : COLORS.light.text },
                  ]}
                >
                  {item.text}
                </Text>
                {item.is_clarification && (
                  <View style={styles.clarificationBadge}>
                    <Text style={styles.clarificationText}>Clarification Prompt</Text>
                  </View>
                )}
              </View>
            );
          }}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={[
        styles.container,
        { backgroundColor: isDark ? COLORS.dark.background : COLORS.light.background },
      ]}
    >
      <View style={styles.mainContent}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.title, { color: isDark ? COLORS.dark.text : COLORS.light.text }]}>
            Conversation History
          </Text>
          <Text
            style={[
              styles.subtitle,
              { color: isDark ? COLORS.dark.textSecondary : COLORS.light.textSecondary },
            ]}
          >
            Persistent multilingual records stored in Supabase
          </Text>
        </View>

        {/* Search Bar */}
        <View
          style={[
            styles.searchBar,
            {
              backgroundColor: isDark ? COLORS.dark.inputBg : COLORS.light.inputBg,
              borderColor: isDark ? COLORS.dark.border : COLORS.light.border,
            },
          ]}
        >
          <Ionicons
            name="search"
            size={18}
            color={isDark ? COLORS.dark.textMuted : COLORS.light.textMuted}
          />
          <TextInput
            style={[styles.searchInput, { color: isDark ? COLORS.dark.text : COLORS.light.text }]}
            placeholder="Search conversations by title or topic..."
            placeholderTextColor={isDark ? COLORS.dark.textMuted : COLORS.light.textMuted}
            value={search}
            onChangeText={setSearch}
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch('')}>
              <Ionicons name="close-circle" size={16} color={COLORS.dark.textMuted} />
            </TouchableOpacity>
          )}
        </View>

        {/* Conversation List */}
        {loading ? (
          <View style={styles.centered}>
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text style={{ marginTop: 8, color: isDark ? COLORS.dark.textSecondary : COLORS.light.textSecondary }}>
              Loading history...
            </Text>
          </View>
        ) : filteredConversations.length === 0 ? (
          <View style={styles.centered}>
            <Ionicons name="chatbubble-ellipses-outline" size={48} color={COLORS.dark.textMuted} />
            <Text style={[styles.emptyTitle, { color: isDark ? COLORS.dark.text : COLORS.light.text }]}>
              No Conversations Found
            </Text>
            <Text
              style={[
                styles.emptySubtitle,
                { color: isDark ? COLORS.dark.textSecondary : COLORS.light.textSecondary },
              ]}
            >
              Start translating or chatting on the home screen to build your persistent memory.
            </Text>
          </View>
        ) : (
          <FlatList
            data={filteredConversations}
            keyExtractor={(item) => item.id}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
            renderItem={({ item }) => {
              const lang = getLanguageByCode(item.language || 'en');
              return (
                <TouchableOpacity
                  style={[
                    styles.convCard,
                    {
                      backgroundColor: isDark ? COLORS.dark.card : COLORS.light.card,
                      borderColor: isDark ? COLORS.dark.border : COLORS.light.border,
                    },
                  ]}
                  onPress={() => handleOpenConversation(item)}
                  activeOpacity={0.8}
                >
                  <View style={styles.convLeft}>
                    <Text style={{ fontSize: 20 }}>{lang.flag}</Text>
                    <View style={styles.convTextWrap}>
                      <Text
                        style={[
                          styles.convTitle,
                          { color: isDark ? COLORS.dark.text : COLORS.light.text },
                        ]}
                        numberOfLines={1}
                      >
                        {item.title}
                      </Text>
                      <Text
                        style={[
                          styles.convDate,
                          { color: isDark ? COLORS.dark.textMuted : COLORS.light.textMuted },
                        ]}
                      >
                        {item.created_at ? new Date(item.created_at).toLocaleDateString() : 'Recent'} • {lang.name}
                      </Text>
                    </View>
                  </View>

                  <TouchableOpacity
                    style={styles.deleteBtn}
                    onPress={() => handleDelete(item.id, item.title)}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  >
                    <Ionicons name="trash-outline" size={18} color={COLORS.danger} />
                  </TouchableOpacity>
                </TouchableOpacity>
              );
            }}
          />
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  mainContent: {
    flex: 1,
    padding: SPACING.md,
    gap: SPACING.sm,
  },
  header: {
    marginBottom: SPACING.xs,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
  },
  subtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    height: 44,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    gap: 8,
    marginBottom: SPACING.xs,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.xl,
    gap: 8,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginTop: 8,
  },
  emptySubtitle: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
  },
  convCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SPACING.md,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    marginBottom: SPACING.sm,
  },
  convLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  convTextWrap: {
    flex: 1,
  },
  convTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  convDate: {
    fontSize: 11,
    marginTop: 2,
  },
  deleteBtn: {
    padding: 6,
  },
  threadHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: '#33415533',
    gap: 12,
  },
  backBtn: {
    padding: 4,
  },
  threadTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '700',
  },
  threadList: {
    padding: SPACING.md,
    gap: SPACING.sm,
  },
  messageBubble: {
    maxWidth: '82%',
    padding: SPACING.sm + 4,
    borderRadius: RADIUS.lg,
    gap: 4,
  },
  userBubble: {
    alignSelf: 'flex-end',
    borderBottomRightRadius: 4,
  },
  assistantBubble: {
    alignSelf: 'flex-start',
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 14,
    lineHeight: 20,
  },
  clarificationBadge: {
    backgroundColor: '#F59E0B25',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: RADIUS.sm,
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  clarificationText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#F59E0B',
  },
});
