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
  ActivityIndicator,
} from 'react-native';

// Firebase imports
import { db, auth } from './firebaseConfig';
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  query,
  orderBy,
  where,
  Timestamp,
} from 'firebase/firestore';
import { onAuthStateChanged, signOut } from 'firebase/auth';

// Auth Screen
import AuthScreen from './AuthScreen';

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

// Firestore 컬렉션 이름
const COLLECTION_NAME = 'diaries';

export default function App() {
  // 인증 상태
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  // 일기 상태
  const [selectedEmotion, setSelectedEmotion] = useState(null);
  const [memo, setMemo] = useState('');
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // 인증 상태 감지
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthLoading(false);
    });

    return unsubscribe;
  }, []);

  // 사용자가 로그인하면 해당 사용자의 일기만 불러오기
  useEffect(() => {
    if (user) {
      loadEntries();
    } else {
      setEntries([]);
    }
  }, [user]);

  // Firestore에서 현재 사용자의 기록만 불러오기
  const loadEntries = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const diariesRef = collection(db, COLLECTION_NAME);
      // 현재 로그인한 사용자의 일기만 가져오기
      const q = query(
        diariesRef,
        where('userId', '==', user.uid),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);

      const loadedEntries = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        loadedEntries.push({
          id: doc.id,
          emotion: data.emotion,
          memo: data.memo,
          date: data.createdAt?.toDate?.()?.toISOString() || data.date,
        });
      });

      setEntries(loadedEntries);
    } catch (error) {
      console.error('Firestore 데이터 로드 실패:', error);
      // 인덱스 에러 처리
      if (error.code === 'failed-precondition') {
        Alert.alert(
          'Firestore 인덱스 필요',
          'Firebase Console에서 복합 인덱스를 생성해주세요.\n\n콘솔 > Firestore > 인덱스 > 복합 인덱스 추가\n- 컬렉션: diaries\n- 필드: userId (오름차순), createdAt (내림차순)'
        );
      } else {
        Alert.alert('오류', '데이터를 불러오는데 실패했습니다.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Firestore에 새 기록 저장 (사용자 ID 포함)
  const handleSave = async () => {
    if (!selectedEmotion) {
      Alert.alert('알림', '오늘의 기분을 선택해주세요!');
      return;
    }

    if (!user) {
      Alert.alert('오류', '로그인이 필요합니다.');
      return;
    }

    try {
      setSaving(true);

      const newEntry = {
        userId: user.uid, // 사용자 ID 추가
        userEmail: user.email, // 사용자 이메일 (선택적)
        emotion: {
          emoji: selectedEmotion.emoji,
          label: selectedEmotion.label,
        },
        memo: memo.trim(),
        createdAt: Timestamp.now(),
        date: new Date().toISOString(),
      };

      // Firestore 'diaries' 컬렉션에 저장
      const docRef = await addDoc(collection(db, COLLECTION_NAME), newEntry);

      // 로컬 상태 업데이트
      const entryWithId = {
        id: docRef.id,
        emotion: newEntry.emotion,
        memo: newEntry.memo,
        date: newEntry.date,
      };
      setEntries([entryWithId, ...entries]);

      // 입력 초기화
      setSelectedEmotion(null);
      setMemo('');

      Alert.alert('저장 완료', '오늘의 감정이 저장되었습니다!');
    } catch (error) {
      console.error('Firestore 저장 실패:', error);
      Alert.alert('저장 실패', '다시 시도해주세요.');
    } finally {
      setSaving(false);
    }
  };

  // Firestore에서 기록 삭제
  const handleDelete = (id) => {
    Alert.alert(
      '삭제 확인',
      '이 기록을 삭제하시겠습니까?',
      [
        { text: '취소', style: 'cancel' },
        {
          text: '삭제',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteDoc(doc(db, COLLECTION_NAME, id));
              setEntries(entries.filter((entry) => entry.id !== id));
            } catch (error) {
              console.error('삭제 실패:', error);
              Alert.alert('삭제 실패', '다시 시도해주세요.');
            }
          },
        },
      ]
    );
  };

  // 로그아웃
  const handleLogout = () => {
    Alert.alert(
      '로그아웃',
      '정말 로그아웃 하시겠습니까?',
      [
        { text: '취소', style: 'cancel' },
        {
          text: '로그아웃',
          style: 'destructive',
          onPress: async () => {
            try {
              await signOut(auth);
            } catch (error) {
              console.error('로그아웃 실패:', error);
            }
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

  // 인증 로딩 중
  if (authLoading) {
    return (
      <View style={styles.loadingContainer}>
        <StatusBar style="light" />
        <ActivityIndicator size="large" color="#6366f1" />
        <Text style={styles.loadingText}>로딩 중...</Text>
      </View>
    );
  }

  // 로그인하지 않은 경우 로그인 화면 표시
  if (!user) {
    return (
      <>
        <StatusBar style="light" />
        <AuthScreen />
      </>
    );
  }

  // 로그인한 경우 일기 화면 표시
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
          <View style={styles.headerTop}>
            <View>
              <Text style={styles.title}>Emotion Diary</Text>
              <Text style={styles.subtitle}>오늘의 감정을 기록하세요</Text>
            </View>
            <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
              <Text style={styles.logoutText}>로그아웃</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.userInfo}>
            <Text style={styles.userEmail}>👤 {user.email}</Text>
          </View>
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
        <TouchableOpacity
          style={[styles.saveButton, saving && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <Text style={styles.saveButtonText}>기록 저장하기</Text>
          )}
        </TouchableOpacity>

        {/* 기록 리스트 */}
        <View style={styles.listSection}>
          <View style={styles.listHeader}>
            <Text style={styles.sectionTitle}>
              내 기록 {entries.length > 0 && `(${entries.length})`}
            </Text>
            <TouchableOpacity onPress={loadEntries} style={styles.refreshButton}>
              <Text style={styles.refreshText}>새로고침</Text>
            </TouchableOpacity>
          </View>

          {loading ? (
            <View style={styles.loadingState}>
              <ActivityIndicator size="large" color="#6366f1" />
              <Text style={styles.loadingStateText}>불러오는 중...</Text>
            </View>
          ) : entries.length === 0 ? (
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
  loadingContainer: {
    flex: 1,
    backgroundColor: '#0a0a0a',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#a0a0a0',
  },
  scrollContent: {
    padding: 24,
    paddingTop: 60,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 32,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
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
  logoutButton: {
    backgroundColor: '#1a1a1a',
    borderWidth: 1,
    borderColor: '#ef4444',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  logoutText: {
    fontSize: 12,
    color: '#ef4444',
    fontWeight: '500',
  },
  userInfo: {
    marginTop: 16,
    backgroundColor: '#1a1a1a',
    borderRadius: 8,
    padding: 12,
  },
  userEmail: {
    fontSize: 14,
    color: '#6366f1',
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
  saveButtonDisabled: {
    backgroundColor: '#4a4a6a',
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
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  refreshButton: {
    padding: 8,
  },
  refreshText: {
    fontSize: 14,
    color: '#6366f1',
  },
  loadingState: {
    alignItems: 'center',
    padding: 40,
  },
  loadingStateText: {
    marginTop: 16,
    fontSize: 14,
    color: '#a0a0a0',
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
