/**
 * @format
 */

import { AppRegistry } from 'react-native';
import App from './App';
import { name as appName } from './app.json';
import BackgroundFetch from 'react-native-background-fetch';
import { createBackupJSON } from './src/services/LocalBackupService';
import { uploadBackup, isOneDriveConnected } from './src/services/OnedriveService';
import NetInfo from '@react-native-community/netinfo';

// Headless task for BackgroundFetch (Android)
const headlessSyncTask = async (event) => {
    const taskId = event.taskId;
    const isTimeout = event.timeout;
    if (isTimeout) {
        console.log('[BackgroundFetch] Headless task timed out: ', taskId);
        BackgroundFetch.finish(taskId);
        return;
    }

    console.log('[BackgroundFetch] Headless task started: ', taskId);

    try {
        const netState = await NetInfo.fetch();
        const connected = await isOneDriveConnected();

        if (netState.isConnected && connected) {
            const data = await createBackupJSON();
            await uploadBackup(data);
            console.log('[BackgroundFetch] Headless sync successful');
        }
    } catch (e) {
        console.log('[BackgroundFetch] Headless sync failed: ', e);
    }

    BackgroundFetch.finish(taskId);
};

AppRegistry.registerComponent(appName, () => App);
BackgroundFetch.registerHeadlessTask(headlessSyncTask);
