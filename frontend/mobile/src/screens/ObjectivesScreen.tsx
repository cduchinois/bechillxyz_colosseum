import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
} from 'react-native';
import Header from '../components/Header';
import {Colors, Fonts} from '../constants/GlobalStyles';

// Données fictives pour les objectifs
const mockObjectives = [
  {
    id: '1',
    title: 'DCA 100 $SOL',
    description: 'through weekly investments',
    progress: 65,
    color: '#8A2BE2', // Violet
  },
  {
    id: '2',
    title: 'DCA 100 $SOL',
    description: 'through weekly investments',
    progress: 65,
    color: '#FFFF00', // Jaune
  },
  {
    id: '3',
    title: 'DCA 100 $SOL',
    description: 'through weekly investments',
    progress: 65,
    color: '#4CAF50', // Vert
  },
];

// Composant pour la barre de progression
interface ProgressBarProps {
  progress: number;
  color: string;
}

const ProgressBar: React.FC<ProgressBarProps> = ({progress, color}) => (
  <View style={styles.progressBarContainer}>
    <View
      style={[
        styles.progressBar,
        {width: `${progress}%`, backgroundColor: color},
      ]}
    />
  </View>
);

// Interface pour le type d'objectif
interface Objective {
  id: string;
  title: string;
  description: string;
  progress: number;
  color: string;
}

// Composant pour un objectif individuel
const ObjectiveItem: React.FC<{objective: Objective}> = ({objective}) => (
  <View style={styles.objectiveCard}>
    <Text style={styles.objectiveTitle}>{objective.title}</Text>
    <Text style={styles.objectiveDescription}>{objective.description}</Text>

    <ProgressBar progress={objective.progress} color={objective.color} />

    <View style={styles.progressTextContainer}>
      <Text style={styles.progressLabel}>Progress</Text>
      <Text style={styles.progressValue}>{objective.progress}%</Text>
    </View>
  </View>
);

// Composant pour ajouter un nouvel objectif
const AddObjectiveButton = () => (
  <View style={styles.addObjectiveContainer}>
    <TouchableOpacity style={styles.addButton}>
      <Text style={styles.addButtonText}>+</Text>
    </TouchableOpacity>
    <Text style={styles.addObjectiveText}>Add new objective</Text>
  </View>
);

// Écran principal des objectifs
interface ObjectivesScreenProps {
  activeScreen: string;
  setActiveScreen: (screen: string) => void;
}

const ObjectivesScreen: React.FC<ObjectivesScreenProps> = _props => {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Header />
        <Text style={styles.screenTitle}>Objectives</Text>

        {mockObjectives.map(objective => (
          <ObjectiveItem key={objective.id} objective={objective} />
        ))}

        <AddObjectiveButton />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f0ff', // Couleur de fond légèrement violette
  },
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  screenTitle: {
    fontSize: 28,
    fontWeight: '600',
    color: Colors.primary,
    fontFamily: Fonts.DMSerif,
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  objectiveCard: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    marginHorizontal: 15,
    marginVertical: 10,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  objectiveTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  objectiveDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 15,
  },
  progressBarContainer: {
    height: 10,
    backgroundColor: '#E0E0FF',
    borderRadius: 5,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 5,
  },
  progressTextContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  progressLabel: {
    fontSize: 14,
    color: '#666',
  },
  progressValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  addObjectiveContainer: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 40,
  },
  addButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#8A2BE2',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  addButtonText: {
    color: 'white',
    fontSize: 30,
    lineHeight: 34,
  },
  addObjectiveText: {
    fontSize: 16,
    color: '#8A2BE2',
  },
});

export default ObjectivesScreen;
