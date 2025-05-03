import React, {useState, useEffect, useRef} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import {Colors, Fonts} from '../constants/GlobalStyles';
import {useAuthorization} from '../components/providers/AuthorizationProvider';

// Types pour nos messages
interface Message {
  id: string;
  text: string;
  sender: 'bot' | 'user';
  timestamp: Date;
  isTyping?: boolean;
}

// Props pour l'écran d'onboarding
interface OnboardingScreenProps {
  onNavigate?: (destination: string) => void; // Accept a string argument for navigation
}

// Composant pour l'écran d'onboarding
const OnboardingScreen = ({onNavigate}: OnboardingScreenProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [userName, setUserName] = useState('');
  const [onboardingStep, setOnboardingStep] = useState(0);
  const [showWalletReview, setShowWalletReview] = useState(false);
  const [initialMessageSent, setInitialMessageSent] = useState(false);
  const [waitingForWalletAddress, setWaitingForWalletAddress] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const {selectedAccount} = useAuthorization();

  // Effet pour l'initialisation de la conversation
  useEffect(() => {
    // Vérifier si le message initial a déjà été envoyé pour éviter les doublons
    if (!initialMessageSent) {
      // Simuler le premier message du bot après un court délai
      const timer = setTimeout(() => {
        addMessage({
          id: Date.now().toString(),
          text: "Hey there! I'm Chill, your personal crypto guide. What's your name?",
          sender: 'bot',
          timestamp: new Date(),
        });
        setInitialMessageSent(true);
      }, 1000);

      // Nettoyer le timer si le composant est démonté avant l'exécution
      return () => clearTimeout(timer);
    }
  }, [initialMessageSent]);

  // Fonction pour ajouter un message à la conversation
  const addMessage = (message: Message) => {
    setMessages(prevMessages => [...prevMessages, message]);
    // Scroll to bottom
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({animated: true});
    }, 100);
  };

  // Simuler la saisie du bot (avec animation de points)
  const simulateBotTyping = () => {
    const typingMessage: Message = {
      id: `typing-${Date.now()}`,
      text: '...',
      sender: 'bot',
      timestamp: new Date(),
      isTyping: true,
    };

    addMessage(typingMessage);

    return typingMessage.id;
  };

  // Gérer l'envoi d'un message par l'utilisateur
  const handleSendMessage = () => {
    if (!inputText.trim()) {
      return;
    }

    // Ajouter le message de l'utilisateur
    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText,
      sender: 'user',
      timestamp: new Date(),
    };

    addMessage(userMessage);
    setInputText('');

    // Si c'est la première réponse, considérer que c'est le nom
    if (onboardingStep === 0) {
      setUserName(inputText);

      // Simuler la saisie du bot
      const typingId = simulateBotTyping();

      // Supprimer l'animation de saisie et ajouter la réponse du bot
      setTimeout(() => {
        setMessages(prev => prev.filter(msg => msg.id !== typingId));

        addMessage({
          id: Date.now().toString(),
          text: `Hi, ${inputText}, nice to meet you! You can ask me anything about your wallet's health, performance, or goals.`,
          sender: 'bot',
          timestamp: new Date(),
        });

        // Envoyer un second message après un court délai
        setTimeout(() => {
          addMessage({
            id: Date.now().toString(),
            text: "Any question in mind? I'm all ears.",
            sender: 'bot',
            timestamp: new Date(),
          });
        }, 1000);
      }, 1500);

      setOnboardingStep(1);
    }
    // Si c'est la requête de performances et que nous n'avons pas encore demandé l'adresse du wallet
    else if (
      onboardingStep === 1 &&
      isPerformanceRequest(inputText) &&
      !waitingForWalletAddress
    ) {
      // Simuler la saisie du bot
      const typingId = simulateBotTyping();

      // Supprimer l'animation de saisie et demander l'adresse du wallet
      setTimeout(() => {
        setMessages(prev => prev.filter(msg => msg.id !== typingId));

        addMessage({
          id: Date.now().toString(),
          text: "I'd be happy to check your wallet's performance from last month. Could you please paste your wallet address so I can look it up?",
          sender: 'bot',
          timestamp: new Date(),
        });

        setWaitingForWalletAddress(true);
      }, 1500);
    }
    // Si nous attendons l'adresse du wallet
    else if (waitingForWalletAddress) {
      // Supposer que l'utilisateur a fourni une adresse de wallet
      // Simuler la saisie du bot
      const typingId = simulateBotTyping();

      // Valider superficiellement l'adresse
      const isValidAddress = validateWalletAddress(inputText);

      if (!isValidAddress) {
        // Si l'adresse semble invalide
        setTimeout(() => {
          setMessages(prev => prev.filter(msg => msg.id !== typingId));

          addMessage({
            id: Date.now().toString(),
            text: "That doesn't look like a valid wallet address. Please check and try again.",
            sender: 'bot',
            timestamp: new Date(),
          });
        }, 1500);
        return;
      }

      // Supprimer l'animation de saisie et montrer qu'on analyse le wallet
      setTimeout(() => {
        setMessages(prev => prev.filter(msg => msg.id !== typingId));

        addMessage({
          id: Date.now().toString(),
          text: `Thanks! Analyzing wallet ${inputText.substring(
            0,
            6,
          )}...${inputText.substring(inputText.length - 4)}...`,
          sender: 'bot',
          timestamp: new Date(),
        });

        // Après un court délai, afficher les "résultats"
        setTimeout(() => {
          addMessage({
            id: Date.now().toString(),
            text: "I've analyzed your wallet's performance from last month. Here's what I found:",
            sender: 'bot',
            timestamp: new Date(),
          });

          // Afficher le composant de wallet review
          setTimeout(() => {
            setShowWalletReview(true);
          }, 800);
        }, 2000);
      }, 1500);

      setWaitingForWalletAddress(false);
      setOnboardingStep(2);
    }
    // Si c'est la seconde réponse (question sur le wallet) et ce n'est pas une demande de performances
    else if (onboardingStep === 1 && !isPerformanceRequest(inputText)) {
      // Pour toutes les autres questions, simplifier la réponse
      // Simuler la saisie du bot
      const typingId = simulateBotTyping();

      // Supprimer l'animation de saisie et ajouter la réponse du bot
      setTimeout(() => {
        setMessages(prev => prev.filter(msg => msg.id !== typingId));

        // Message générique
        addMessage({
          id: Date.now().toString(),
          text: "That's a great question! To give you the most accurate information, I'll need to check your wallet. Could you please paste your wallet address?",
          sender: 'bot',
          timestamp: new Date(),
        });

        setWaitingForWalletAddress(true);
      }, 1500);
    }
  };

  // Fonction pour vérifier si la demande concerne les performances
  const isPerformanceRequest = (text: string): boolean => {
    const performanceKeywords = [
      'performance',
      'perform',
      'month',
      'last month',
      'previous month',
      'how did',
      'how was',
      'how am i doing',
      'portfolio',
      'gains',
      'losses',
      'profit',
    ];

    const lowercaseText = text.toLowerCase();
    return performanceKeywords.some(keyword => lowercaseText.includes(keyword));
  };

  // Fonction simple pour valider superficiellement une adresse de wallet
  const validateWalletAddress = (address: string): boolean => {
    // Vérification très basique - généralement une adresse Solana fait 44 caractères
    // Vous pouvez améliorer cette validation selon vos besoins
    return address.length >= 30 && address.length <= 50;
  };

  // Gérer le clic sur "VIEW STORY"
  const handleViewStory = () => {
    onNavigate?.('wallet_story');
  };

  // Gérer le passage direct au wallet
  const skipToConnect = () => {
    onNavigate?.('main');
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header avec logo */}
      <View style={styles.header}>
        <Image
          source={require('../../assets/img/bechill-head1.png')}
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={styles.logoText}>beChill</Text>

        {/* Bouton skip dans l'en-tête */}
        <TouchableOpacity
          style={styles.headerSkipButton}
          onPress={skipToConnect}>
          <Text style={styles.headerSkipText}>Skip →</Text>
        </TouchableOpacity>
      </View>

      {/* Zone de chat */}
      <KeyboardAvoidingView
        style={styles.chatContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}>
        <ScrollView
          ref={scrollViewRef}
          style={styles.messagesContainer}
          contentContainerStyle={[
            styles.messagesContent,
            styles.messagesContentContainer,
          ]}>
          {messages.map(message => (
            <View
              key={message.id}
              style={[
                styles.messageBubble,
                message.sender === 'user'
                  ? styles.userBubble
                  : styles.botBubble,
              ]}>
              <Text
                style={[
                  styles.messageText,
                  Platform.OS === 'android'
                    ? {color: Colors.textPrimary}
                    : null,
                ]}>
                {message.text}
              </Text>
              <Text style={styles.timestamp}>
                {message.timestamp.toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </Text>
            </View>
          ))}

          {/* Composant de wallet review (affiché uniquement quand nécessaire) */}
          {showWalletReview && (
            <View style={styles.walletReviewContainer}>
              <View style={styles.walletReviewCard}>
                <Text style={styles.walletReviewTitle}>Wallet Review!</Text>
                <View style={styles.performanceStats}>
                  <Text style={styles.performanceStat}>+15.7% Growth</Text>
                  <Text style={styles.performanceStat}>2.3 SOL Earned</Text>
                  <Text style={styles.performanceStat}>4 New NFTs</Text>
                </View>
                <TouchableOpacity
                  style={styles.viewStoryButton}
                  onPress={handleViewStory}>
                  <Text style={styles.viewStoryText}>VIEW STORY</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </ScrollView>

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Message Chill ..."
            placeholderTextColor="#999"
            value={inputText}
            onChangeText={setInputText}
            onSubmitEditing={handleSendMessage}
          />
          <TouchableOpacity
            style={styles.sendButton}
            onPress={handleSendMessage}
            disabled={!inputText.trim()}>
            <Text style={styles.sendButtonText}>➤</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#e6e6fa', // Lavender background like in your images
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    justifyContent: 'space-between', // Espacement entre les éléments
  },
  logo: {
    width: 40,
    height: 40,
  },
  logoText: {
    fontFamily: Fonts.Monument,
    fontSize: 24,
    color: Colors.primary,
    marginLeft: 10,
    flex: 1, // Prend l'espace disponible pour centrer le logo et le texte
  },
  headerSkipButton: {
    backgroundColor: 'rgba(0,0,0,0.05)',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  headerSkipText: {
    color: Colors.primary,
    fontSize: 14,
    fontFamily: Fonts.Monument,
  },
  chatContainer: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
  },
  messagesContainer: {
    flex: 1,
    paddingHorizontal: 15,
  },
  messagesContent: {
    paddingBottom: 20,
  },
  messagesContentContainer: {
    flexGrow: 1,
    justifyContent: 'flex-end',
  },
  messageBubble: {
    borderRadius: 20,
    padding: 15,
    marginVertical: 8,
    maxWidth: '80%',
  },
  botBubble: {
    backgroundColor: 'white',
    alignSelf: 'flex-start',
    borderBottomLeftRadius: 5,
  },
  userBubble: {
    backgroundColor: Colors.secondary, // Yellow color for user messages
    alignSelf: 'flex-end',
    borderBottomRightRadius: 5,
  },
  messageText: {
    fontSize: 16,
    fontFamily: Fonts.DMSerif, // Utiliser vos polices globales
    color: Colors.textPrimary, // Utiliser la couleur de texte de vos styles globaux (#333333)
  },
  timestamp: {
    fontSize: 12,
    fontFamily: Platform.OS === 'android' ? Fonts.DMSerif : undefined,
    color: Colors.textSecondary, // Utiliser la couleur secondaire de vos styles globaux (#666666)
    alignSelf: 'flex-end',
    marginTop: 5,
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 15,
    backgroundColor: 'rgba(255,255,255,0.5)', // Fond légèrement transparent
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
    position: 'relative',
    bottom: 0,
  },
  input: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 25,
    paddingHorizontal: 20,
    paddingVertical: 12,
    fontSize: 16,
    fontFamily: Fonts.DMSerif, // Utiliser votre police globale
    color: Colors.textPrimary, // Définir explicitement la couleur du texte
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  sendButton: {
    backgroundColor: Colors.secondary,
    borderRadius: 25,
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
    elevation: 2, // Ombre pour Android
    shadowColor: '#000', // Ombre pour iOS
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  sendButtonText: {
    color: '#333',
    fontSize: 20,
  },
  walletReviewContainer: {
    alignItems: 'center',
    marginVertical: 15,
  },
  walletReviewCard: {
    backgroundColor: '#5d4ffd', // Gradient-like purple background
    borderRadius: 15,
    padding: 20,
    alignItems: 'center',
    width: '80%',
  },
  walletReviewTitle: {
    color: 'white',
    fontFamily: Fonts.DMSerif,
    fontSize: 40,
    marginBottom: 15,
  },
  performanceStats: {
    width: '100%',
    marginBottom: 15,
  },
  performanceStat: {
    color: 'white',
    fontFamily: Fonts.DMSerif,
    fontSize: 18,
    textAlign: 'center',
    marginVertical: 5,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 10,
    paddingVertical: 8,
  },
  viewStoryButton: {
    backgroundColor: '#7b70ff',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 20,
  },
  viewStoryText: {
    color: Colors.secondary,
    fontFamily: Fonts.Monument,
    fontSize: 14,
  },
});

export default OnboardingScreen;
