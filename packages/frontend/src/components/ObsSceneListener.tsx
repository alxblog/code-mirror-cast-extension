import { useEffect } from 'react';
import OBSWebSocket, {
  OBSWebSocketError,
} from 'obs-websocket-js';

interface UseSyncBrowserSourceSizeWithBoundsProps {
  sourceName: string;
  sceneName: string;
  obsUrl?: string;
  password?: string;
}

const useSyncBrowserSourceSizeWithBounds = ({
  sourceName,
  sceneName,
  obsUrl = 'ws://localhost:4455',
  password = '',
}: UseSyncBrowserSourceSizeWithBoundsProps): void => {
  useEffect(() => {
    const obs = new OBSWebSocket();

    const syncSize = async () => {
      try {
        await obs.connect(obsUrl, password);
        console.log('✅ Connecté à OBS WebSocket');

        // Récupère la liste des items de scène
        const { sceneItems } = await obs.call('GetSceneItemList', {
          sceneName,
        });

        const sceneItem = sceneItems.find(
          item => item.sourceName === sourceName
        );

        if (!sceneItem) {
          console.warn(`❌ Source "${sourceName}" introuvable dans la scène "${sceneName}"`);
          return;
        }

        // Récupère les bounds
        if (sceneItem.sceneItemId == null) {
          console.warn(`❌ sceneItemId is null for source "${sourceName}" in scene "${sceneName}"`);
          return;
        }

        const { sceneItemTransform } = await obs.call('GetSceneItemTransform', {
          sceneName,
          sceneItemId: sceneItem.sceneItemId as number,
        });

        const { boundsWidth, boundsHeight } = sceneItemTransform;

        if (!boundsWidth || !boundsHeight) {
          console.warn(`❌ Bounds non définis pour "${sourceName}"`);
          return;
        }

        // Récupère les settings de l'input
        const { inputSettings } = await obs.call('GetInputSettings', {
          inputName: sourceName,
        });

        // Applique la nouvelle taille
        const newSettings = {
          ...inputSettings,
          width: boundsWidth,
          height: boundsHeight,
        };

        await obs.call('SetInputSettings', {
          inputName: sourceName,
          inputSettings: newSettings,
          overlay: true,
        });

        console.log(`✅ Dimensions mises à jour pour "${sourceName}" : ${boundsWidth}x${boundsHeight}`);
      } catch (error) {
        const err = error as OBSWebSocketError;
        console.error('❌ Erreur OBS WebSocket :', err.message);
      } finally {
        obs.disconnect();
        console.log('🔌 Déconnecté de OBS');
      }
    };

    syncSize();

    return () => {
      obs.disconnect();
    };
  }, [sourceName, sceneName, obsUrl, password]);
};

export default useSyncBrowserSourceSizeWithBounds;
