import { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const EMOTIONS = [
  { emoji: '😊', label: '행복' },
  { emoji: '😢', label: '슬픔' },
  { emoji: '😠', label: '화남' },
  { emoji: '😰', label: '불안' },
  { emoji: '😴', label: '피곤' },
  { emoji: '🥰', label: '사랑' },
  { emoji: '😎', label: '자신감' },
  { emoji: '🤔', label: '고민' },
];

const STORAGE_KEY = '@emotion_diary_entries';

export default function App() {
  const [selectedEmotion, setSelectedEmotion] = useState(null);
  const [memo, setMemo] = useState('');
  const [entries, setEntries] = useState([]);

  // 앱 시작 시 저장된 데이터 불러오기
  useEffect(() => {
    loadEntries();
  }, []);

  const loadEntries = async () => {
    try {
      const saved = await AsyncStorage.getItem(STORAGE_KEY);
      if (saved) {
        setEntries(JSON.parse(saved));
      }
    } catch (error) {
      console.error('데이터 로드 실패:', error);
    }
  };

  const saveEntries = async (newEntries) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newEntries));
    } catch (error) {
      console.error('데이터 저장 실패:', error);
    }
  };

  const handleSave = () => {
    if (!selectedEmotion) {
      Alert.alert('알림', '오늘의 기분을 선택해주세요!');
      return;
    }

    const newEntry = {
      id: Date.now().toString(),
      emotion: selectedEmotion,
      memo: memo.trim(),
      date: new Date().toISOString(),
    };

    const newEntries = [newEntry, ...entries];
    setEntries(newEntries);
    saveEntries(newEntries);

    // 입력 초기화
    setSelectedEmotion(null);
    setMemo('');

    Alert.alert('저장 완료', '오늘의 감정이 기록되었습니다!');
  };

  const handleDelete = (id) => {
    Alert.alert(
      '삭제 확인',
      '이 기록을 삭제하시겠습니까?',
      [
        { text: '취소', style: 'cancel' },
        {
          text: '삭제',
          style: 'destructive',
          onPress: () => {
            const newEntries = entries.filter((entry) => entry.id !== id);
            setEntries(newEntries);
            saveEntries(newEntries);
          },
        },
      ]
    );
  };

  const formatDate = (isoString) => {
    const date = new Date(isoString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}.${month}.${day} ${hours}:${minutes}`;
  };

  const getRelativeDate = (isoString) => {
    const date = new Date(isoString);
    const now = new Date();
    const diffTime = now - date;
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return '오늘';
    if (diffDays === 1) return '어제';
    if (diffDays < 7) return `${diffDays}일 전`;
    return formatDate(isoString).split(' ')[0];
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <StatusBar style="light" />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* 헤더 */}
        <View style={styles.header}>
          <Text style={styles.title}>Emotion Diary</Text>
          <Text style={styles.subtitle}>오늘의 감정을 기록하세요</Text>
        </View>

        {/* 감정 선택 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>오늘의 기분</Text>
          <View style={styles.emotionGrid}>
            {EMOTIONS.map((emotion) => (
              <TouchableOpacity
                key={emotion.emoji}
                style={[
                  styles.emotionButton,
                  selectedEmotion?.emoji === emotion.emoji && styles.emotionButtonActive,
                ]}
                onPress={() => setSelectedEmotion(emotion)}
              >
                <Text style={styles.emotionEmoji}>{emotion.emoji}</Text>
                <Text
                  style={[
                    styles.emotionLabel,
                    selectedEmotion?.emoji === emotion.emoji && styles.emotionLabelActive,
                  ]}
                >
                  {emotion.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* 메모 입력 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>메모</Text>
          <TextInput
            style={styles.memoInput}
            value={memo}
            onChangeText={setMemo}
            placeholder="오늘 있었던 일을 적어보세요..."
            placeholderTextColor="#4a4a4a"
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>

        {/* 저장 버튼 */}
        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveButtonText}>기록 저장하기</Text>
        </TouchableOpacity>

        {/* 기록 리스트 */}
        <View style={styles.listSection}>
          <Text style={styles.sectionTitle}>
            지난 기록 {entries.length > 0 && `(${entries.length})`}
          </Text>

          {entries.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyEmoji}>📝</Text>
              <Text style={styles.emptyText}>아직 기록이 없습니다</Text>
              <Text style={styles.emptySubtext}>첫 번째 감정을 기록해보세요!</Text>
            </View>
          ) : (
            entries.map((entry) => (
              <TouchableOpacity
                key={entry.id}
                style={styles.entryCard}
                onLongPress={() => handleDelete(entry.id)}
              >
                <View style={styles.entryHeader}>
                  <View style={styles.entryEmojiWrapper}>
                    <Text style={styles.entryEmoji}>{entry.emotion.emoji}</Text>
                  </View>
                  <View style={styles.entryInfo}>
                    <Text style={styles.entryEmotion}>{entry.emotion.label}</Text>
                    <Text style={styles.entryDate}>
                      {getRelativeDate(entry.date)} · {formatDate(entry.date).split(' ')[1]}
                    </Text>
                  </View>
                </View>
                {entry.memo ? (
                  <Text style={styles.entryMemo}>{entry.memo}</Text>
                ) : null}
                <Text style={styles.deleteHint}>길게 누르면 삭제</Text>
              </TouchableOpacity>
            ))
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  scrollContent: {
    padding: 24,
    paddingTop: 60,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 32,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#a0a0a0',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 16,
  },
  emotionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  emotionButton: {
    width: '22%',
    aspectRatio: 1,
    backgroundColor: '#1a1a1a',
    borderWidth: 2,
    borderColor: '#2a2a2a',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 8,
  },
  emotionButtonActive: {
    borderColor: '#6366f1',
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
  },
  emotionEmoji: {
    fontSize: 28,
    marginBottom: 4,
  },
  emotionLabel: {
    fontSize: 11,
    color: '#a0a0a0',
  },
  emotionLabelActive: {
    color: '#6366f1',
    fontWeight: '600',
  },
  memoInput: {
    backgroundColor: '#1a1a1a',
    borderWidth: 1,
    borderColor: '#2a2a2a',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#ffffff',
    minHeight: 120,
  },
  saveButton: {
    backgroundColor: '#6366f1',
    borderRadius: 12,
    padding: 18,
    alignItems: 'center',
    marginBottom: 40,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  listSection: {
    borderTopWidth: 1,
    borderTopColor: '#2a2a2a',
    paddingTop: 24,
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
  },
  emptyEmoji: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 16,
    color: '#ffffff',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#4a4a4a',
  },
  entryCard: {
    backgroundColor: '#1a1a1a',
    borderWidth: 1,
    borderColor: '#2a2a2a',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  entryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  entryEmojiWrapper: {
    width: 48,
    height: 48,
    backgroundColor: '#0a0a0a',
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  entryEmoji: {
    fontSize: 24,
  },
  entryInfo: {
    flex: 1,
  },
  entryEmotion: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 4,
  },
  entryDate: {
    fontSize: 13,
    color: '#6366f1',
  },
  entryMemo: {
    fontSize: 14,
    color: '#a0a0a0',
    lineHeight: 20,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#2a2a2a',
  },
  deleteHint: {
    fontSize: 11,
    color: '#3a3a3a',
    textAlign: 'right',
    marginTop: 8,
  },
});
