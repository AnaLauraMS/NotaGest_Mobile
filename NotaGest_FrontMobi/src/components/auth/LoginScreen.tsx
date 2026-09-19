import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  Image,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Mail, Lock, User, Eye, EyeOff, LogIn, UserPlus, AlertCircle, CheckCircle2 } from 'lucide-react-native';

import { useAuth } from '@/core/auth/AuthContext';

export default function LoginScreen() {
  const { login, register } = useAuth();

  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleSubmit = async () => {
    setErrorMessage('');
    setSuccessMessage('');

    if (!email.trim() || !senha) {
      setErrorMessage('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    if (isRegisterMode && !nome.trim()) {
      setErrorMessage('Por favor, informe seu nome completo.');
      return;
    }

    try {
      setIsLoading(true);
      if (isRegisterMode) {
        await register({
          nome: nome.trim(),
          email: email.trim(),
          senha,
        });
        setSuccessMessage('Conta criada com sucesso! Agora você já pode fazer login.');
        setIsRegisterMode(false);
        setSenha('');
      } else {
        await login({
          email: email.trim(),
          senha,
        });
      }
    } catch (err: any) {
      const serverMessage =
        err?.response?.data?.message ||
        err?.message ||
        'Ocorreu um erro ao processar sua solicitação. Verifique suas credenciais.';
      setErrorMessage(serverMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom', 'left', 'right']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoid}>
        <ScrollView contentContainerStyle={styles.scrollContent} bounces={false}>
          <View style={styles.header}>
            <Image
              source={require('@/assets/notagest/LogoNotaGestLogin.png')}
              style={styles.logo}
              resizeMode="contain"
            />
            <Text style={styles.tagline}>Gestão Patrimonial & Documental Inteligente</Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>
              {isRegisterMode ? 'Criar Conta' : 'Acesse sua Conta'}
            </Text>
            <Text style={styles.cardSubtitle}>
              {isRegisterMode
                ? 'Preencha os dados abaixo para começar a gerenciar seus bens'
                : 'Entre com seu e-mail e senha cadastrados no sistema'}
            </Text>

            {errorMessage ? (
              <View style={styles.errorBanner}>
                <AlertCircle size={18} color="#b91c1c" />
                <Text style={styles.errorBannerText}>{errorMessage}</Text>
              </View>
            ) : null}

            {successMessage ? (
              <View style={styles.successBanner}>
                <CheckCircle2 size={18} color="#047857" />
                <Text style={styles.successBannerText}>{successMessage}</Text>
              </View>
            ) : null}

            <View style={styles.form}>
              {isRegisterMode && (
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Nome Completo</Text>
                  <View style={styles.inputWrapper}>
                    <User size={18} color="#64748b" style={styles.inputIcon} />
                    <TextInput
                      style={styles.input}
                      placeholder="Ex: João da Silva"
                      placeholderTextColor="#94a3b8"
                      value={nome}
                      onChangeText={setNome}
                      autoCapitalize="words"
                    />
                  </View>
                </View>
              )}

              <View style={styles.inputGroup}>
                <Text style={styles.label}>E-mail</Text>
                <View style={styles.inputWrapper}>
                  <Mail size={18} color="#64748b" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="seuemail@exemplo.com"
                    placeholderTextColor="#94a3b8"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Senha</Text>
                <View style={styles.inputWrapper}>
                  <Lock size={18} color="#64748b" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="••••••••"
                    placeholderTextColor="#94a3b8"
                    value={senha}
                    onChangeText={setSenha}
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                  />
                  <Pressable
                    onPress={() => setShowPassword(!showPassword)}
                    style={styles.eyeButton}>
                    {showPassword ? (
                      <EyeOff size={18} color="#64748b" />
                    ) : (
                      <Eye size={18} color="#64748b" />
                    )}
                  </Pressable>
                </View>
              </View>

              <Pressable
                style={[styles.submitButton, isLoading && styles.buttonDisabled]}
                onPress={handleSubmit}
                disabled={isLoading}>
                {isLoading ? (
                  <ActivityIndicator color="#ffffff" />
                ) : (
                  <>
                    {isRegisterMode ? (
                      <UserPlus size={18} color="#ffffff" />
                    ) : (
                      <LogIn size={18} color="#ffffff" />
                    )}
                    <Text style={styles.submitButtonText}>
                      {isRegisterMode ? 'Cadastrar' : 'Entrar no Sistema'}
                    </Text>
                  </>
                )}
              </Pressable>
            </View>

            <View style={styles.footer}>
              <Pressable
                onPress={() => {
                  setIsRegisterMode(!isRegisterMode);
                  setErrorMessage('');
                  setSuccessMessage('');
                }}>
                <Text style={styles.switchText}>
                  {isRegisterMode ? (
                    <>
                      Já tem uma conta?{' '}
                      <Text style={styles.switchHighlight}>Fazer Login</Text>
                    </>
                  ) : (
                    <>
                      Ainda não possui conta?{' '}
                      <Text style={styles.switchHighlight}>Cadastre-se</Text>
                    </>
                  )}
                </Text>
              </Pressable>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0c4a6e',
  },
  keyboardAvoid: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 16,
  },
  logo: {
    width: 280,
    height: 280,
    maxWidth: '90%',
    maxHeight: 280,
  },
  tagline: {
    color: '#93c5fd',
    fontSize: 13,
    fontWeight: '500',
    marginTop: 8,
    textAlign: 'center',
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 24,
    maxWidth: 480,
    width: '100%',
    alignSelf: 'center',
    boxShadow: '0px 10px 25px rgba(0, 0, 0, 0.2)',
    elevation: 8,
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0f172a',
    textAlign: 'center',
  },
  cardSubtitle: {
    fontSize: 13,
    color: '#64748b',
    textAlign: 'center',
    marginTop: 6,
    marginBottom: 20,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fef2f2',
    borderColor: '#fecaca',
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    gap: 8,
  },
  errorBannerText: {
    color: '#991b1b',
    fontSize: 13,
    flex: 1,
  },
  successBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ecfdf5',
    borderColor: '#a7f3d0',
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    gap: 8,
  },
  successBannerText: {
    color: '#065f46',
    fontSize: 13,
    flex: 1,
  },
  form: {
    gap: 16,
  },
  inputGroup: {
    gap: 6,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#334155',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 14,
    paddingHorizontal: 12,
  },
  inputIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 15,
    color: '#0f172a',
  },
  eyeButton: {
    padding: 8,
  },
  submitButton: {
    backgroundColor: '#2563eb',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 14,
    gap: 8,
    marginTop: 8,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  submitButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
  },
  footer: {
    marginTop: 24,
    alignItems: 'center',
  },
  switchText: {
    fontSize: 13,
    color: '#64748b',
  },
  switchHighlight: {
    color: '#2563eb',
    fontWeight: '700',
  },
});
