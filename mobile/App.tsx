import React from 'react';
import { WebView } from 'react-native-webview';
import { SafeAreaView, StyleSheet, StatusBar } from 'react-native';

export default function App() {
    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" />
            <WebView
                // CAMBIA ESTA URL POR LA DE TU WEB PUBLICADA (ej: tu-app.railway.app)
                // Mientras pruebas en casa, usa tu IP: http://172.26.1.142:5000
                source={{ uri: 'http://172.26.1.142:5000' }}
                style={styles.web}
                javaScriptEnabled={true}
                domStorageEnabled={true}
                startInLoadingState={true}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#000' },
    web: { flex: 1 }
});
