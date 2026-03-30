
import React, { useEffect, useRef } from 'react';
import { getMyChatMessages } from '../api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export default function MessageNotifier() {
  const { user } = useAuth();
  const { addToast } = useToast();
  const lastMsgId = useRef(null);
  const isFirstLoad = useRef(true);

  useEffect(() => {
    if (!user) return;

    const checkNewMessages = async () => {
      try {
        const res = await getMyChatMessages();
        const messages = res.data;
        
        if (messages && messages.length > 0) {
          const latest = messages[0];
          
          if (!isFirstLoad.current && lastMsgId.current !== null && latest.id > lastMsgId.current) {
            // Check if there are multiple new messages
            const newMsgs = messages.filter(m => m.id > lastMsgId.current && m.sender_id !== user.id);
            
            if (newMsgs.length > 0) {
              const m = newMsgs[0];
              const route = m.ride ? ` [${m.ride.origin} → ${m.ride.destination}]` : '';
              addToast(`💬${route} ${m.sender.name}: ${m.content.substring(0, 40)}${m.content.length > 40 ? '...' : ''}`, 'info');
              
              // Play a subtle sound if possible, or just the toast
              console.log("New message notification triggered");
            }
          }
          
          lastMsgId.current = latest.id;
        }
        isFirstLoad.current = false;
      } catch (err) {
        console.error("Notification poller error:", err);
      }
    };

    // Initial check
    checkNewMessages();

    // Poll every 5 seconds
    const interval = setInterval(checkNewMessages, 5000);
    return () => clearInterval(interval);
  }, [user, addToast]);

  return null; // Invisible component
}
