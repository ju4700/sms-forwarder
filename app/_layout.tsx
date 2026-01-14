import { useEffect, useState } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import {
  View,
  Modal,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import DrawerContent from '@/components/DrawerContent';

// Drawer context for global state
import React, { createContext, useContext } from 'react';

interface DrawerContextType {
  isOpen: boolean;
  openDrawer: () => void;
  closeDrawer: () => void;
}

export const DrawerContext = createContext<DrawerContextType>({
  isOpen: false,
  openDrawer: () => {},
  closeDrawer: () => {},
});

export const useDrawer = () => useContext(DrawerContext);

export default function RootLayout() {
  useFrameworkReady();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const openDrawer = () => setDrawerOpen(true);
  const closeDrawer = () => setDrawerOpen(false);

  return (
    <DrawerContext.Provider
      value={{ isOpen: drawerOpen, openDrawer, closeDrawer }}
    >
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="privacy-policy"
          options={{
            headerShown: false,
            presentation: 'modal',
          }}
        />
        <Stack.Screen
          name="terms"
          options={{
            headerShown: false,
            presentation: 'modal',
          }}
        />
        <Stack.Screen
          name="how-it-works"
          options={{
            headerShown: false,
            presentation: 'modal',
          }}
        />
        <Stack.Screen
          name="security-info"
          options={{
            headerShown: false,
            presentation: 'modal',
          }}
        />
        <Stack.Screen name="+not-found" />
      </Stack>

      {/* Custom Drawer Modal */}
      <Modal
        visible={drawerOpen}
        animationType="slide"
        transparent={true}
        onRequestClose={closeDrawer}
      >
        <View style={styles.modalContainer}>
          <TouchableOpacity
            style={styles.backdrop}
            activeOpacity={1}
            onPress={closeDrawer}
          />
          <View style={styles.drawerContainer}>
            <DrawerContent onClose={closeDrawer} />
          </View>
        </View>
      </Modal>

      <StatusBar style="auto" />
    </DrawerContext.Provider>
  );
}

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    flexDirection: 'row',
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  drawerContainer: {
    width: width * 0.85,
    maxWidth: 320,
    backgroundColor: '#ffffff',
    height: '100%',
  },
});
