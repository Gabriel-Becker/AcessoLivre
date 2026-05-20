import React, { useState } from 'react';
import { View, StyleSheet, Image, TouchableOpacity, Modal, FlatList, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '../commons';
import { useThemeContext } from '../../context/ThemeContext';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function LocalGallery({ imagens, imagemPrincipal, altoContraste = false }) {
  const { theme: t } = useThemeContext();
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  if (!imagens || imagens.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="camera-outline" size={48} color={t.colors.textTertiary} />
        <ThemedText color="textSecondary" align="center">
          Nenhuma foto disponível
        </ThemedText>
      </View>
    );
  }

  const openImageModal = (index) => {
    setSelectedImageIndex(index);
    setModalVisible(true);
  };

  const renderImageItem = ({ item, index }) => (
    <TouchableOpacity
      style={styles.imageItem}
      onPress={() => openImageModal(index)}
      activeOpacity={0.9}
    >
      <Image
        source={{ uri: item.url }}
        style={styles.thumbnail}
        resizeMode="cover"
      />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Grid de miniaturas */}
      <FlatList
        data={imagens}
        keyExtractor={(item, index) => `img_${index}`}
        renderItem={renderImageItem}
        numColumns={3}
        scrollEnabled={false}
        contentContainerStyle={styles.gridContainer}
      />

      {/* Modal para visualização em tela cheia */}
      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={[styles.modalContainer, { backgroundColor: 'rgba(0,0,0,0.95)' }]}>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => setModalVisible(false)}
          >
            <Ionicons name="close" size={28} color="#FFF" />
          </TouchableOpacity>

          <FlatList
            data={imagens}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            initialScrollIndex={selectedImageIndex}
            getItemLayout={(data, index) => ({
              length: SCREEN_WIDTH,
              offset: SCREEN_WIDTH * index,
              index,
            })}
            renderItem={({ item }) => (
              <View style={styles.fullImageContainer}>
                <Image
                  source={{ uri: item.url }}
                  style={styles.fullImage}
                  resizeMode="contain"
                />
              </View>
            )}
            keyExtractor={(item, index) => `full_${index}`}
          />

          <View style={styles.counterContainer}>
            <ThemedText style={{ color: '#FFF' }}>
              {selectedImageIndex + 1} / {imagens.length}
            </ThemedText>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
  },
  gridContainer: {
    gap: 8,
  },
  imageItem: {
    flex: 1,
    margin: 4,
    aspectRatio: 1,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#F0F0F0',
  },
  thumbnail: {
    width: '100%',
    height: '100%',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
    gap: 16,
    backgroundColor: '#F9F9F9',
    borderRadius: 12,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButton: {
    position: 'absolute',
    top: 40,
    right: 20,
    zIndex: 10,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 20,
    padding: 8,
  },
  fullImageContainer: {
    width: SCREEN_WIDTH,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullImage: {
    width: SCREEN_WIDTH - 40,
    height: '80%',
  },
  counterContainer: {
    position: 'absolute',
    bottom: 40,
    alignSelf: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
});