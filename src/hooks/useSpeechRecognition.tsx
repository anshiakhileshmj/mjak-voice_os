/* Obfuscated: useSpeechRecognition.tsx */
import { useState, useRef, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';

interface SpeechRecognitionHook {
  isRecording: boolean;
  isSupported: boolean;
  currentTranscript: string;
  startRecording: () => void;
  stopRecording: () => void;
  onResult: (callback: (transcript: string) => void) => void;
}

export const useSpeechRecognition = (): SpeechRecognitionHook => {
  const [isRecording, setIsRecording] = useState(false);
  const [isSupported, setIsSupported] = useState(true);
  const [currentTranscript, setCurrentTranscript] = useState('');
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const resultCallbackRef = useRef<((transcript: string) => void) | null>(null);
  const retryCountRef = useRef(0);
  const maxRetries = 3;
  const { toast } = useToast();


  const requestMicrophonePermission = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach(track => track.stop());
      return true;
    } catch (error) {
      console["error"]('Microphone permission denied:', error);
      return false;
    }
  }, []);

  const webSpeechAvailable = useCallback(() => {
    const hasWebkit = 'webkitSpeechRecognition' in window;
    const hasNative = 'SpeechRecognition' in window;
    return hasWebkit || hasNative;
  }, []);

  const checkSpeechSupport = useCallback(() => {
    // Only support when Web Speech API is available
    return webSpeechAvailable();
  }, [webSpeechAvailable]);

  const initializeSpeechRecognition = useCallback(() => {
    // Only initialize Web Speech when actually available
    if (!webSpeechAvailable()) {
      setIsSupported(false);
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognitionRef.current = new SpeechRecognition();
    
    if (recognitionRef.current) {
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';
      
      // Remove maxAlternatives as it's not available on all implementations

      recognitionRef.current.addEventListener('start', () => {
        console["log"]('Speech recognition started');
        setIsRecording(true);
        retryCountRef.current = 0;
      });

      recognitionRef.current.addEventListener('result', (event: any) => {
        let finalTranscript = '';
        let interimTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
          } else {
            interimTranscript += transcript;
          }
        }

        setCurrentTranscript(interimTranscript);

        if (finalTranscript && resultCallbackRef.current) {
          resultCallbackRef.current(finalTranscript.trim());
          setCurrentTranscript('');
        }
      });

      recognitionRef.current.addEventListener('error', (event: any) => {
        console["error"]('Speech recognition error:', event.error, event);
        
        let errorMessage = 'Speech recognition error occurred.';
        let shouldRetry = false;
        
        switch (event.error) {
          case 'network':
            errorMessage = 'Network error. Please check your internet connection.';
            shouldRetry = true;
            break;
          case 'not-allowed':
            errorMessage = 'Microphone access denied. Please allow microphone permissions in your browser settings.';
            break;
          case 'no-speech':
            errorMessage = 'No speech detected. Please try speaking again.';
            shouldRetry = true;
            break;
          case 'aborted':
            errorMessage = 'Speech recognition was stopped.';
            break;
          case 'audio-capture':
            errorMessage = 'Audio capture failed. Please check your microphone connection.';
            break;
          case 'service-not-allowed':
            errorMessage = 'Speech recognition service not allowed. This may be due to browser or system restrictions.';
            break;
          default:
            errorMessage = `Speech recognition error: ${event.error}`;
            shouldRetry = retryCountRef.current < maxRetries;
        }

        // Auto-retry for certain errors
        if (shouldRetry && (event.error === 'network' || event.error === 'no-speech')) {
          retryCountRef.current++;
          setTimeout(() => {
            if (recognitionRef.current && isRecording) {
              try {
                console["log"](`Retrying speech recognition (attempt ${retryCountRef.current})`);
                recognitionRef.current.start();
              } catch (error) {
                console["error"]('Retry failed:', error);
                setIsRecording(false);
              }
            }
          }, 1000);
          return;
        }

        toast({
          title: "Speech Recognition Error",
          description: errorMessage,
          variant: "destructive"
        });
        
        setIsRecording(false);
        setCurrentTranscript('');
      });

      recognitionRef.current.addEventListener('end', () => {
        console["log"]('Speech recognition ended');
        
        // Auto-restart if we're supposed to be recording (unless it was an error)
        if (isRecording && retryCountRef.current < maxRetries) {
          setTimeout(() => {
            if (recognitionRef.current && isRecording) {
              try {
                console["log"]('Auto-restarting speech recognition');
                recognitionRef.current.start();
              } catch (error) {
                console["error"]('Auto-restart failed:', error);
                setIsRecording(false);
              }
            }
          }, 500);
        } else {
          setIsRecording(false);
          setCurrentTranscript('');
        }
      });
    }
  }, [toast, webSpeechAvailable, isRecording]);

  // Removed custom fallback STT; Web Speech API only

  useEffect(() => {
    const supported = checkSpeechSupport();
    setIsSupported(supported);

    if (webSpeechAvailable()) {
      initializeSpeechRecognition();
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (error) {
          console["error"]('Error stopping recognition on cleanup:', error);
        }
      }
    };
  }, [toast, initializeSpeechRecognition]);

  const startRecording = useCallback(async () => {
    // Request microphone permission first
    const hasPermission = await requestMicrophonePermission();
    if (!hasPermission) {
      toast({
        title: "Microphone Permission Required",
        description: "Please allow microphone access to use voice recognition.",
        variant: "destructive"
      });
      return;
    }

    // Use Web Speech API only
    if (!webSpeechAvailable()) {
      toast({ title: 'Speech Not Supported', description: 'This browser does not support Web Speech API.', variant: 'destructive' });
      return;
    }

    if (!recognitionRef.current) {
      toast({ title: "Cannot Start Recording", description: "Speech recognition not initialized.", variant: "destructive" });
      return;
    }
    
    try {
      retryCountRef.current = 0;
      recognitionRef.current.start();
      toast({ title: "Recording Started", description: "Speak naturally. I'm listening and will respond in real-time." });
    } catch (error) {
      console["error"]('Error starting recognition:', error);
      setIsRecording(false);
    }
  }, [isSupported, toast, requestMicrophonePermission, webSpeechAvailable]);

  const stopRecording = useCallback(() => {
    if (!recognitionRef.current) return;
    try {
      recognitionRef.current.stop();
      setIsRecording(false);
      setCurrentTranscript('');
    } catch (error) {
      console["error"]('Error stopping recognition:', error);
    }
  }, []);

  const onResult = useCallback((callback: (transcript: string) => void) => {
    resultCallbackRef.current = callback;
  }, []);

  return {
    isRecording,
    isSupported,
    currentTranscript,
    startRecording,
    stopRecording,
    onResult,
  };
};