import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  Pressable,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Send, Bot, User, Sparkles } from 'lucide-react-native';

import { httpClient } from '@/core/http/client';
import { ApiEndpoint } from '@/core/constants/enums';

interface Message {
  id: string;
  sender: 'user' | 'bot';
  text: string;
}

export default function ChatScreen() {
  const insets = useSafeAreaInsets();
  const bottomInset = Math.max(insets.bottom, Platform.OS === 'android' ? 16 : 0);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      sender: 'bot',
      text: 'Olá! Sou o assistente de patrimônio inteligente do NotaGest. Você pode me perguntar qualquer coisa sobre suas despesas, notas fiscais ou imóveis cadastrados.',
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isSending, setIsSending] = useState(false);

  const handleSendMessage = async () => {
    if (!inputText.trim() || isSending) return;

    const userMessageText = inputText.trim();
    const userMessage: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text: userMessageText,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText('');
    setIsSending(true);

    try {
      const response = await httpClient.post(ApiEndpoint.AiQuery, {
        query: userMessageText,
      });

      const botText = response.data?.answer || 'Não consegui processar a resposta no momento.';
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'bot',
        text: botText,
      };
      setMessages((prev) => [...prev, botMessage]);
    } catch {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'bot',
        text: 'Não foi possível consultar a IA agora. Verifique se o servidor backend está online com a chave do Gemini configurada.',
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <View style={styles.botAvatar}>
          <Sparkles size={20} color="#ffffff" />
        </View>
        <View>
          <Text style={styles.headerTitle}>Assistente IA NotaGest</Text>
          <Text style={styles.headerSubtitle}>Modo Gestor de Patrimônio (RAG)</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={[styles.messagesContainer, { paddingBottom: 150 + bottomInset }]}>
        {messages.map((item) => (
          <View
            key={item.id}
            style={[
              styles.messageBubble,
              item.sender === 'user' ? styles.userBubble : styles.botBubble,
            ]}>
            <View style={styles.bubbleHeader}>
              {item.sender === 'bot' ? (
                <Bot size={16} color="#7c3aed" />
              ) : (
                <User size={16} color="#ffffff" />
              )}
              <Text
                style={[
                  styles.senderLabel,
                  item.sender === 'user' ? styles.userSenderLabel : styles.botSenderLabel,
                ]}>
                {item.sender === 'user' ? 'Você' : 'NotaGest IA'}
              </Text>
            </View>
            <Text
              style={[
                styles.messageText,
                item.sender === 'user' ? styles.userMessageText : styles.botMessageText,
              ]}>
              {item.text}
            </Text>
          </View>
        ))}

        {isSending && (
          <View style={[styles.messageBubble, styles.botBubble, styles.loadingBubble]}>
            <ActivityIndicator size="small" color="#7c3aed" />
            <Text style={styles.loadingText}>Consultando notas fiscais...</Text>
          </View>
        )}
      </ScrollView>

      <View style={[styles.inputContainer, { bottom: 76 + bottomInset }]}>
        <TextInput
          style={styles.input}
          placeholder="Ex: Quanto gastei com reforma em 2026?"
          value={inputText}
          onChangeText={setInputText}
          onSubmitEditing={handleSendMessage}
        />
        <Pressable
          style={[styles.sendButton, !inputText.trim() && styles.sendButtonDisabled]}
          onPress={handleSendMessage}
          disabled={!inputText.trim() || isSending}>
          <Send size={18} color="#ffffff" />
        </Pressable>
      </View>
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
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    backgroundColor: '#ffffff',
    gap: 12,
  },
  botAvatar: {
    width: 40,
    height: 40,
    borderRadius: 14,
    backgroundColor: '#7c3aed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0f172a',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#64748b',
  },
  messagesContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingBottom: 150,
    gap: 12,
  },
  messageBubble: {
    maxWidth: '85%',
    borderRadius: 20,
    padding: 16,
  },
  userBubble: {
    alignSelf: 'flex-end',
    backgroundColor: '#2563eb',
    borderBottomRightRadius: 4,
  },
  botBubble: {
    alignSelf: 'flex-start',
    backgroundColor: '#ffffff',
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  bubbleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  senderLabel: {
    fontSize: 11,
    fontWeight: '700',
  },
  userSenderLabel: {
    color: '#bfdbfe',
  },
  botSenderLabel: {
    color: '#7c3aed',
  },
  messageText: {
    fontSize: 14,
    lineHeight: 20,
  },
  userMessageText: {
    color: '#ffffff',
  },
  botMessageText: {
    color: '#1e293b',
  },
  loadingBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  loadingText: {
    fontSize: 13,
    color: '#64748b',
    fontStyle: 'italic',
  },
  inputContainer: {
    position: 'absolute',
    bottom: 76,
    left: 20,
    right: 20,
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 6,
    paddingLeft: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.08)',
    elevation: 8,
  },
  input: {
    flex: 1,
    fontSize: 14,
    paddingVertical: 8,
  },
  sendButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#2563eb',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#94a3b8',
  },
});
