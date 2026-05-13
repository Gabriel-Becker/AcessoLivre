import React, { useState, useMemo } from 'react';
import { View, StyleSheet, FlatList, Image, TouchableOpacity, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '../commons';
import { getTheme } from '../../config/theme';
import { useThemeContext } from '../../context/ThemeContext';

export default function LocalGallery({ imagens = [], imagemPrincipal, altoContraste }) {
  const { isHighContrast } = useThemeContext();
  const t = getTheme(altoContraste ?? isHighContrast);
  const [modalVisible, setModalVisible] = useState(false);
  const [imagemSelecionada, setImagemSelecionada] = useState(null);

  // Processa imagens para exibição
  const imagensParaExibir = useMemo(() => {
    const lista = [];
    
    // Adiciona imagem principal primeiro
    if (imagemPrincipal) {
      lista.push({ uri: imagemPrincipal, isPrincipal: true });
    }
    
    // Adiciona imagens da galeria
    if (imagens && Array.isArray(imagens)) {
      imagens.forEach(img => {
        if (img?.imagemBase64) {
          lista.push({ uri: img.imagemBase64 });
        } else if (img?.url) {
          lista.push({ uri: img.url });
        } else if (typeof img === 'string') {
          lista.push({ uri: img });
        }
      });
    }
    
    return lista;
  }, [imagemPrincipal, imagens]);

  const abrirGaleria = (imagem) => {
    setImagemSelecionada(imagem);
    setModalVisible(true);
  };

  const renderImageItem = ({ item, index }) => (
    <TouchableOpacity 
      style={styles.imageWrapper} 
      onPress={() => abrirGaleria(item)}
      activeOpacity={0.9}
    >
      <Image 
        source={{ uri: item.uri }} 
        style={styles.thumbnail}
        resizeMode="cover"
      />
      {index === 0 && imagensParaExibir.length > 1 && (
        <View style={styles.badge}>
          <ThemedText variant="caption" color="textOnPrimary">
            +{imagensParaExibir.length - 1}
          </ThemedText>
        </View>
      )}
    </TouchableOpacity>
  );

  if (imagensParaExibir.length === 0) {
    return (
      <View style={[styles.placeholderContainer, { backgroundColor: t.colors.backgroundTertiary }]}>
        <Ionicons name="image-outline" size={48} color={t.colors.textTertiary} />
        <ThemedText color="textTertiary">Nenhuma imagem disponível</ThemedText>
      </View>
    );
  }

  return (
    <>
      <View style={styles.container}>
        <FlatList
          data={imagensParaExibir}
          horizontal
          showsHorizontalScrollIndicator={false}
          renderItem={renderImageItem}
          keyExtractor={(_, index) => `gallery_${index}`}
          contentContainerStyle={styles.flatListContent}
        />
      </View>

      {/* Modal para visualização em tela cheia */}
      <Modal
        visible={modalVisible}
        transparent={false}
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={[styles.modalContainer, { backgroundColor: '#000' }]}>
          <TouchableOpacity 
            style={styles.closeButton} 
            onPress={() => setModalVisible(false)}
          >
            <Ionicons name="close" size={28} color="#FFF" />
          </TouchableOpacity>
          
          {imagemSelecionada && (
            <Image 
              source={{ uri: imagemSelecionada.uri }} 
              style={styles.fullImage}
              resizeMode="contain"
            />
          )}
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 16,
  },
  flatListContent: {
    paddingHorizontal: 16,
    gap: 12,
  },
  imageWrapper: {
    position: 'relative',
    marginRight: 12,
  },
  thumbnail: {
    width: 120,
    height: 120,
    borderRadius: 12,
  },
  badge: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.7)',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  placeholderContainer: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 16,
    marginHorizontal: 16,
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
    padding: 8,
  },
  fullImage: {
    width: '100%',
    height: '100%',
  },
});