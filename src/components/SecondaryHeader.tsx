import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, StatusBar } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useAppTheme } from '../styles/global';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface SecondaryHeaderProps {
    title: string;
    onBack: () => void;
    rightComponent?: React.ReactNode;
}

export default function SecondaryHeader({ title, onBack, rightComponent }: SecondaryHeaderProps) {
    const { colors, isDark } = useAppTheme();
    const insets = useSafeAreaInsets();

    return (
        <View style={[styles.outerContainer, { backgroundColor: colors.surface, paddingTop: Math.max(insets.top, 10) }]}>
            <StatusBar barStyle={isDark ? "light-content" : "dark-content"} backgroundColor={colors.surface} />
            <View style={[styles.container, { borderBottomColor: colors.border }]}>
                <TouchableOpacity onPress={onBack} style={[styles.backBtn, { backgroundColor: colors.background }]} activeOpacity={0.7}>
                    <Ionicons name="arrow-back" size={22} color={colors.textMain} />
                </TouchableOpacity>
                <Text style={[styles.title, { color: colors.textMain }]} numberOfLines={1}>{title}</Text>
                <View style={styles.rightContainer}>
                    {rightComponent}
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    outerContainer: {
        width: '100%',
        zIndex: 100,
    },
    container: {
        height: 56,
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 20,
        borderBottomWidth: 1,
    },
    title: {
        flex: 1,
        fontSize: 18,
        fontWeight: "800",
        letterSpacing: -0.5,
        marginLeft: 16,
    },
    backBtn: {
        padding: 8,
        borderRadius: 10,
    },
    rightContainer: {
        minWidth: 40,
        alignItems: 'flex-end',
    }
});
