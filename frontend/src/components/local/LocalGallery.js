// components/local/LocalGallery.js
import React, { useState, useRef, useMemo, useCallback } from 'react';
import {
  View,
  StyleSheet,
  Image,
  TouchableOpacity,
  Modal,
  FlatList,
  Dimensions,
  useWindowDimensions
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '../commons';
import { useThemeContext } from '../../context/ThemeContext';
import { breakpoints } from '../../config/theme';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function LocalGallery({ imagens, altoContraste = false }) {
  const { theme: t } = useThemeContext();
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const { width } = useWindowDimensions();
  const flatListRef = useRef(null);

  // Calcular tamanho das imagens baseado na largura da tela
  const imageSize = useMemo(() => {
    if (width >= breakpoints.desktop) return 180;
    if (width >= breakpoints.tablet) return 150;
    return 110;
  }, [width]);

  // Se não houver imagens, mostra placeholder
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

  // Abrir modal com a imagem selecionada
  const openImageModal = useCallback((index) => {
    setSelectedImageIndex(index);
    setModalVisible(true);
  }, []);

  // Fechar modal
  const closeModal = useCallback(() => {
    setModalVisible(false);
  }, []);

  // Navegar para imagem anterior
  const goToPrevious = useCallback(() => {
    if (selectedImageIndex > 0) {
      const newIndex = selectedImageIndex - 1;
      setSelectedImageIndex(newIndex);
      flatListRef.current?.scrollToIndex({
        index: newIndex,
        animated: true,
        viewPosition: 0.5
      });
    }
  }, [selectedImageIndex]);

  // Navegar para próxima imagem
  const goToNext = useCallback(() => {
    if (selectedImageIndex < imagens.length - 1) {
      const newIndex = selectedImageIndex + 1;
      setSelectedImageIndex(newIndex);
      flatListRef.current?.scrollToIndex({
        index: newIndex,
        animated: true,
        viewPosition: 0.5
      });
    }
  }, [selectedImageIndex, imagens.length]);

  // Scroll finalizado no FlatList do modal
  const onScrollEnd = useCallback((event) => {
    const contentOffset = event.nativeEvent.contentOffset;
    const viewSize = event.nativeEvent.layoutMeasurement;
    const newIndex = Math.floor(contentOffset.x / viewSize.width);
    if (newIndex !== selectedImageIndex) {
      setSelectedImageIndex(newIndex);
    }
  }, [selectedImageIndex]);

  // Renderizar cada thumbnail
  const renderThumbnail = useCallback(({ item, index }) => (
    <TouchableOpacity
      style={[
        styles.thumbnailItem,
        { width: imageSize, height: imageSize }
      ]}
      onPress={() => openImageModal(index)}
      activeOpacity={0.85}
    >
      <Image
        source={{ uri: item.url || item.urlCompleta || item.caminhoRelativo || item }}
        style={styles.thumbnailImage}
        resizeMode="cover"
      />
      <View style={styles.thumbnailOverlay}>
        <Ionicons name="expand-outline" size={20} color="#FFF" />
      </View>
    </TouchableOpacity>
  ), [imageSize, openImageModal]);

  // Renderizar imagem em tela cheia no modal
  const renderFullImage = useCallback(({ item }) => (
    <View style={styles.fullImageWrapper}>
      <Image
        source={{ uri: item.url || item.urlCompleta || item.caminhoRelativo || item }}
        style={styles.fullImage}
        resizeMode="contain"
      />
    </View>
  ), []);

  // Key extractor para thumbnails
  const thumbnailKeyExtractor = useCallback((item, index) => `thumbnail_${index}`, []);

  // Key extractor para modal
  const modalKeyExtractor = useCallback((item, index) => `modal_${index}`, []);

  return (
    <View style={styles.container}>
      {/* Grid de miniaturas */}
      <FlatList
        data={imagens}
        keyExtractor={thumbnailKeyExtractor}
        renderItem={renderThumbnail}
        numColumns={3}
        scrollEnabled={false}
        contentContainerStyle={styles.gridContainer}
        columnWrapperStyle={styles.gridRow}
      />

      {/* Modal para visualização em tela cheia */}
      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={closeModal}
      >
        <View style={styles.modalContainer}>
          {/* Botão de fechar */}
          <TouchableOpacity style={styles.closeButton} onPress={closeModal}>
            <Ionicons name="close" size={28} color="#FFF" />
          </TouchableOpacity>

          {/* Botão de navegação anterior */}
          {imagens.length > 1 && selectedImageIndex > 0 && (
            <TouchableOpacity style={styles.navButtonLeft} onPress={goToPrevious}>
              <Ionicons name="chevron-back" size={40} color="#FFF" />
            </TouchableOpacity>
          )}

          {/* Botão de navegação próxima */}
          {imagens.length > 1 && selectedImageIndex < imagens.length - 1 && (
            <TouchableOpacity style={styles.navButtonRight} onPress={goToNext}>
              <Ionicons name="chevron-forward" size={40} color="#FFF" />
            </TouchableOpacity>
          )}

          {/* FlatList horizontal com as imagens em tela cheia */}
          <FlatList
            ref={flatListRef}
            data={imagens}
            keyExtractor={modalKeyExtractor}
            renderItem={renderFullImage}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            initialScrollIndex={selectedImageIndex}
            onMomentumScrollEnd={onScrollEnd}
            getItemLayout={(data, index) => ({
              length: SCREEN_WIDTH,
              offset: SCREEN_WIDTH * index,
              index,
            })}
          />

          {/* Indicador de posição */}
          <View style={styles.counterContainer}>
            <ThemedText style={styles.counterText}>
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
    marginTop: 4,
    marginBottom: 8,
  },
  gridContainer: {
    paddingVertical: 4,
  },
  gridRow: {
    justifyContent: 'flex-start',
    gap: 12,
    marginBottom: 12,
  },
  thumbnailItem: {
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#F0F0F0',
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  thumbnailImage: {
    width: '100%',
    height: '100%',
  },
  thumbnailOverlay: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 20,
    padding: 4,
    margin: 6,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
    gap: 16,
    backgroundColor: '#F9F9F9',
    borderRadius: 12,
  },
  // Modal styles
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
  },
  closeButton: {
    position: 'absolute',
    top: 40,
    right: 20,
    zIndex: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 30,
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navButtonLeft: {
    position: 'absolute',
    left: 16,
    top: '50%',
    transform: [{ translateY: -25 }],
    zIndex: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 30,
    width: 50,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navButtonRight: {
    position: 'absolute',
    right: 16,
    top: '50%',
    transform: [{ translateY: -25 }],
    zIndex: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 30,
    width: 50,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fullImageWrapper: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullImage: {
    width: SCREEN_WIDTH - 40,
    height: SCREEN_HEIGHT - 100,
  },
  counterContainer: {
    position: 'absolute',
    bottom: 40,
    alignSelf: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  counterText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
  },
});