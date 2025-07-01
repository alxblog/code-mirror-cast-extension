import { useEffect } from 'react';
import OBSWebSocket, { OBSWebSocketError } from 'obs-websocket-js';

interface UseSyncBrowserSourceSizeWithBoundsProps {
  sourceName: string;
  sceneName: string;
  obsUrl?: string;
  password?: string;
}

export const useSyncBrowserSourceSizeWithBounds = ({
  sourceName,
  sceneName,
  obsUrl = 'ws://localhost:4455',
  password = '',
}: UseSyncBrowserSourceSizeWithBoundsProps) => {
  useEffect(() => {
    const obs = new OBSWebSocket();
    let isMounted = true;

    const syncSize = async () => {
      try {
        const { sceneItems } = await obs.call('GetSceneItemList', {
          sceneName,
        });

        const sceneItem = sceneItems.find(item => item.sourceName === sourceName);

        if (!sceneItem || sceneItem.sceneItemId == null) {
          console.warn(`❌ Source "${sourceName}" introuvable ou ID manquant dans la scène "${sceneName}"`);
          return;
        }

        const { sceneItemTransform } = await obs.call('GetSceneItemTransform', {
          sceneName,
          sceneItemId: Number(sceneItem.sceneItemId),
        });

        const { boundsWidth, boundsHeight } = sceneItemTransform;

        if (
          typeof boundsWidth !== 'number' ||
          typeof boundsHeight !== 'number' ||
          boundsWidth <= 0 ||
          boundsHeight <= 0
        ) {
          console.warn(`❌ Bounds invalides (${boundsWidth}x${boundsHeight}) pour "${sourceName}"`);
          return;
        }

        const { inputSettings } = await obs.call('GetInputSettings', {
          inputName: sourceName,
        });

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
      } catch (err: unknown) {
        const error = err as OBSWebSocketError;
        console.error('❌ Erreur lors de la synchronisation des dimensions OBS :', error.message);
      }
    };

    const init = async () => {
      try {
        await obs.connect(obsUrl, password);
        console.log('✅ Connecté à OBS WebSocket');

        // Synchroniser immédiatement
        await syncSize();

        // Abonnement aux changements de scène
        obs.on('CurrentProgramSceneChanged', async data => {
          if (!isMounted) return;
          if (data.sceneName === sceneName) {
            console.log(`🔁 Changement vers la scène "${sceneName}", resynchronisation...`);
            await syncSize();
          }
        });
      } catch (err: unknown) {
        const error = err as OBSWebSocketError;
        console.error('❌ Erreur de connexion OBS :', error.message);
      }
    };

    init();

    return () => {
      isMounted = false;
      obs.disconnect();
      console.log('🔌 Déconnecté de OBS');
    };
  }, [sourceName, sceneName, obsUrl, password]);
};
