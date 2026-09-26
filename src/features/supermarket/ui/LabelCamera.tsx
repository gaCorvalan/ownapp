import Ionicons from '@expo/vector-icons/Ionicons';
import { typography } from '@/constants/brand';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useEffect, useRef, useState } from 'react';
import { AppState, Linking, StyleSheet, Text, View } from 'react-native';
import { ActionButton, colors, common } from './primitives';

export function LabelCamera({ onRecognize }: { onRecognize: (photoUri: string) => void }) {
  const [permission, requestPermission] = useCameraPermissions();
  const camera = useRef<CameraView>(null);
  const [isForeground, setIsForeground] = useState(AppState.currentState === 'active');
  const [isReady, setIsReady] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const [mountError, setMountError] = useState<string | null>(null);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', state => {
      setIsForeground(state === 'active');
      if (state !== 'active') setIsReady(false);
    });
    return () => subscription.remove();
  }, []);

  async function capture() {
    if (!camera.current || !isReady || isCapturing) return;
    setIsCapturing(true);
    try {
      const photo = await camera.current.takePictureAsync({ quality: 0.8 });
      setIsReady(false);
      onRecognize(photo.uri);
    } catch {
      setMountError('No pudimos capturar la etiqueta. Probá de nuevo o ingresá el precio manualmente.');
    } finally {
      setIsCapturing(false);
    }
  }

  if (!permission) {
    return <View style={styles.notice} accessibilityLiveRegion="polite">
      <Text style={common.body}>Preparando el acceso a la cámara…</Text>
    </View>;
  }

  if (!permission.granted) {
    const permanentlyDenied = !permission.canAskAgain;
    return <View style={styles.notice} accessibilityLiveRegion="polite">
      <Ionicons name="camera-outline" size={24} color={colors.ink} />
      <Text accessibilityRole="header" style={styles.sectionTitle}>Capturá una etiqueta</Text>
      <Text style={common.body}>{permanentlyDenied
        ? 'La cámara está desactivada para esta app. Podés habilitarla desde la configuración del teléfono o seguir con las otras opciones.'
        : 'Permití el uso de la cámara para encuadrar una etiqueta. La foto no se interpreta ni agrega productos todavía.'}</Text>
      <ActionButton label={permanentlyDenied ? 'Abrir configuración' : 'Permitir cámara'} icon="camera-outline" onPress={() => {
        if (permanentlyDenied) void Linking.openSettings();
        else void requestPermission();
      }} />
    </View>;
  }

  if (!isForeground) {
    return <View style={styles.notice} accessibilityLiveRegion="polite">
      <Text style={common.body}>La cámara se pausó mientras la app está en segundo plano.</Text>
    </View>;
  }

  if (mountError) {
    return <View style={styles.notice} accessibilityLiveRegion="polite">
      <Ionicons name="alert-circle-outline" size={24} color={colors.danger} />
      <Text style={common.body}>{mountError}</Text>
      <ActionButton label="Reintentar cámara" variant="secondary" onPress={() => {
        setMountError(null);
        setIsReady(false);
      }} />
    </View>;
  }

  return <View style={styles.capture}>
    <View style={styles.preview}>
      <CameraView ref={camera} style={StyleSheet.absoluteFill} facing="back" onCameraReady={() => setIsReady(true)}
        onMountError={event => setMountError(event.message)} />
      <View pointerEvents="none" style={styles.frame}>
        <View style={[styles.corner, styles.topLeft]} /><View style={[styles.corner, styles.topRight]} />
        <View style={[styles.corner, styles.bottomLeft]} /><View style={[styles.corner, styles.bottomRight]} />
      </View>
      <View pointerEvents="none" style={styles.frameLabel}><Text style={styles.frameText}>Ubicá la etiqueta dentro del marco</Text></View>
    </View>
    <Text style={common.body}>Buscá buena luz y acercate lo suficiente para que el precio se vea nítido.</Text>
    <ActionButton label={isCapturing ? 'Capturando…' : 'Capturar etiqueta'} icon="camera" disabled={!isReady || isCapturing} onPress={capture} />
  </View>;
}

const styles = StyleSheet.create({
  capture: { gap: 12 },
  sectionTitle: { ...typography.product, color: colors.ink },
  preview: { height: 280, overflow: 'hidden', borderRadius: 18, backgroundColor: colors.ink, position: 'relative' },
  frame: { position: 'absolute', top: 22, right: 22, bottom: 22, left: 22 },
  corner: { position: 'absolute', width: 28, height: 28, borderColor: colors.onInk, borderWidth: 3 },
  topLeft: { top: 0, left: 0, borderRightWidth: 0, borderBottomWidth: 0, borderTopLeftRadius: 8 },
  topRight: { top: 0, right: 0, borderLeftWidth: 0, borderBottomWidth: 0, borderTopRightRadius: 8 },
  bottomLeft: { bottom: 0, left: 0, borderRightWidth: 0, borderTopWidth: 0, borderBottomLeftRadius: 8 },
  bottomRight: { bottom: 0, right: 0, borderLeftWidth: 0, borderTopWidth: 0, borderBottomRightRadius: 8 },
  frameLabel: { position: 'absolute', bottom: 12, left: 12, right: 12, alignItems: 'center' },
  frameText: { ...typography.caption, backgroundColor: colors.cameraScrim, color: colors.onInk, paddingHorizontal: 12, paddingVertical: 7, borderRadius: 14, overflow: 'hidden' },
  notice: { alignItems: 'flex-start', backgroundColor: colors.surfaceTonal, borderRadius: 14, gap: 10, padding: 14 },
});
