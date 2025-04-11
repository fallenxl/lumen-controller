// hooks/useWebSocket.ts
import { useEffect, useRef } from "react";

export const useWebSocket = (url: string, onMessage: (data: any) => void) => {
    const socketRef = useRef<WebSocket | null>(null);
    const retryIntervalRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        const connectWebSocket = () => {
            if (socketRef.current) return;
            socketRef.current = new WebSocket(url);

            socketRef.current.onopen = () => {
                if (retryIntervalRef.current) clearTimeout(retryIntervalRef.current);
            };

            socketRef.current.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);
                    onMessage(data);
                } catch (error) {
                    console.error("Error parsing message:", error);
                }
            };

            socketRef.current.onclose = () => {
                socketRef.current = null;
                retryIntervalRef.current = setTimeout(connectWebSocket, 2000);
            };
        };

        connectWebSocket();

        return () => {

            if (retryIntervalRef.current) clearTimeout(retryIntervalRef.current);
        };
    }, [url, onMessage]);

    const sendMessage = (message: any) => {
        if (!socketRef.current || socketRef.current.readyState !== WebSocket.OPEN) {
            console.warn("WebSocket no está listo");
            return false;
        }
        try {
            socketRef.current.send(JSON.stringify(message));
            return true;
        } catch (error) {
            console.error("Error al enviar mensaje:", error);
            return false;
        }
    };

    return { sendMessage, socketRef};
};
