import { WebSocketServer } from 'ws';
import logger from '../utils/logger.js';

export const initVoiceWebSocket = (server, getAIClient, API_KEY, getSeason, retrieveContext, AGRI_EXPERT_V1) => {
  const wss = new WebSocketServer({
    server,
    path: '/ws/live',
    maxPayload: 20 * 1024 * 1024 // 20MB
  });

  wss.on('connection', async (clientWs, req) => {
    const clientId = Math.random().toString(36).substr(2, 9);
    const clientIp = (req.headers['x-forwarded-for'] || req.socket.remoteAddress || '').split(',')[0].trim();
    logger.info(`🔗 WS Connected: ${clientId} from ${clientIp}`);

    if (!API_KEY) {
      clientWs.send(JSON.stringify({
        type: 'error',
        error: 'Config Error',
        message: 'API_KEY missing on server'
      }));
      clientWs.close(1008, 'Missing API Key');
      return;
    }

    let ai = getAIClient();
    let session = null;
    let isAlive = true;

    // Heartbeat to detect dead connections
    const heartbeat = setInterval(() => {
      if (!isAlive) {
        logger.warn(`💀 WS ${clientId}: No heartbeat, terminating.`);
        clearInterval(heartbeat);
        clientWs.terminate();
        return;
      }
      isAlive = false;
      clientWs.ping();
    }, 30000);

    clientWs.on('pong', () => { isAlive = true; });

    clientWs.on('message', async (data) => {
      try {
        const parsed = JSON.parse(data.toString());

        // --- SETUP ---
        if (parsed.type === 'setup') {
          if (session) {
            try { session.close(); } catch (e) { /* ignore */ }
            session = null;
          }

          const config = parsed.config || {};
          const user = config.user;
          logger.info(`⚙️ WS ${clientId}: Setting up session with voice: ${config.voiceName || 'Puck'}`);

          let systemInstructionText = config.systemInstruction || 'You are a helpful assistant.';
          if (user && typeof user === 'object') {
            try {
              const userCrops = user.crops || (user.crop ? [user.crop] : []);
              const ragResults = await retrieveContext('पिकांची माहिती', {
                crops: userCrops,
                state: user.state || 'maharashtra',
                district: user.district || 'Yavatmal'
              }, API_KEY);

              const season = getSeason();
              systemInstructionText = AGRI_EXPERT_V1
                .replace(/{user_language}/g, user.language || 'mr')
                .replace(/{user_district}/g, user.district || 'Yavatmal')
                .replace(/{user_state}/g, user.state || 'maharashtra')
                .replace(/{user_crops}/g, userCrops.join(', ') || 'कापूस, सोयाबीन')
                .replace(/{user_name}/g, user.name || 'शेतकरी मित्र')
                .replace(/{user_land_size}/g, user.landSize || 'N/A')
                .replace(/{current_season}/g, season)
                .replace(/{weather_summary}/g, 'अंशत: ढगाळ हवामान, मध्यम पावसाची शक्यता')
                .replace(/{rag_context}/g, ragResults.contextText || 'माहिती उपलब्ध नाही.');
            } catch (ragErr) {
              logger.warn(`⚠️ WS ${clientId}: WebSocket RAG fetch failed: ${ragErr.message}`);
            }
          }

          try {
            session = await ai.live.connect({
              model: 'gemini-2.5-flash',
              config: {
                responseModalities: ['AUDIO'],
                speechConfig: {
                  voiceConfig: {
                    prebuiltVoiceConfig: {
                      voiceName: config.voiceName || 'Puck'
                    }
                  }
                },
                systemInstruction: {
                  parts: [{
                    text: systemInstructionText
                  }]
                },
                ...(config.enableInputTranscription && { inputAudioTranscription: {} }),
                ...(config.enableOutputTranscription && { outputAudioTranscription: {} })
              },
              callbacks: {
                onopen: () => {
                  logger.info(`✅ WS ${clientId}: Gemini session opened`);
                  if (clientWs.readyState === clientWs.OPEN) {
                    clientWs.send(JSON.stringify({ type: 'setup_complete' }));
                  }
                },
                onmessage: (msg) => {
                  if (clientWs.readyState === clientWs.OPEN) {
                    clientWs.send(JSON.stringify(msg));
                  }
                },
                onclose: (evt) => {
                  logger.info(`🔒 WS ${clientId}: Gemini session closed with code ${evt?.code}`);
                  if (clientWs.readyState === clientWs.OPEN) {
                    clientWs.close(1000, 'Gemini session closed');
                  }
                },
                onerror: (err) => {
                  logger.error(`❌ WS ${clientId}: Gemini error:`, err);
                  if (clientWs.readyState === clientWs.OPEN) {
                    clientWs.send(JSON.stringify({
                      type: 'error',
                      error: 'AI Error',
                      message: err?.message || 'Unknown Gemini error'
                    }));
                  }
                }
              }
            });
          } catch (setupErr) {
            logger.error(`❌ WS ${clientId}: Session setup failed: ${setupErr.message}`);
            if (clientWs.readyState === clientWs.OPEN) {
              clientWs.send(JSON.stringify({
                type: 'error',
                error: 'Setup Failed',
                message: setupErr.message
              }));
            }
          }
          return;
        }

        // --- REALTIME INPUT ---
        if (parsed.realtimeInput) {
          if (!session) {
            logger.warn(`⚠️ WS ${clientId}: Received audio before setup complete`);
            if (clientWs.readyState === clientWs.OPEN) {
              clientWs.send(JSON.stringify({
                type: 'error',
                error: 'Not Ready',
                message: 'Session not initialized. Send setup first.'
              }));
            }
            return;
          }
          session.sendRealtimeInput(parsed.realtimeInput);
        }

      } catch (e) {
        logger.error(`❌ WS ${clientId}: Message parse error: ${e.message}`);
        if (clientWs.readyState === clientWs.OPEN) {
          clientWs.send(JSON.stringify({
            type: 'error',
            error: 'Parse Error',
            message: 'Invalid message format. Expected JSON.'
          }));
        }
      }
    });

    clientWs.on('close', (code, reason) => {
      clearInterval(heartbeat);
      if (session) {
        try { session.close(); } catch (e) { /* ignore */ }
        session = null;
      }
      logger.info(`🔌 WS ${clientId}: Disconnected (code: ${code}, reason: ${reason?.toString() || 'none'})`);
    });

    clientWs.on('error', (err) => {
      logger.error(`❌ WS ${clientId}: Socket error: ${err.message}`);
      clearInterval(heartbeat);
      if (session) {
        try { session.close(); } catch (e) { /* ignore */ }
        session = null;
      }
    });
  });

  return wss;
};

export default initVoiceWebSocket;
