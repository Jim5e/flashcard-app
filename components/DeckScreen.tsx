import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Pressable,
  Dimensions,
} from "react-native";
import { useSharedValue } from 'react-native-reanimated';
import DeckHeader from "@/components/DeckHeader";
import DeckButtons from "./DeckButtons";
import { TopicProps } from "@/types/topic-data";
import { shuffleArray } from "@/utils/shuffleArray";
import FlipCard from "./FlipCard";
import ProgressBar from "./ProgressBar";
import * as ScreenOrientation from 'expo-screen-orientation';
const { height } = Dimensions.get('window');


export default function DeckScreen({ topic }: TopicProps) {
  const isFlipped = useSharedValue(false);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [shuffledDeck, setShuffledDeck] = useState(topic.flashcards);
  const [isAutoPlaying, setIsAutoPlaying] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const handleShow = () => {
    isFlipped.value = !isFlipped.value;
  };


  const handleShuffle = () => {
    const shuffled = shuffleArray(topic.flashcards);
    setShuffledDeck(shuffled);
    setCurrentCardIndex(0);
    isFlipped.value = false;
  };

  const handleNextCard = () => {
    if (currentCardIndex < shuffledDeck.length - 1) {
      setCurrentCardIndex(currentCardIndex + 1);
      isFlipped.value = false;
    }
  };

  const handlePrevCard = () => {
    if (currentCardIndex > 0) {
      setCurrentCardIndex(currentCardIndex - 1);
      isFlipped.value = false;
    }
  };

  const handleAutoPlay = () => {
    setIsAutoPlaying((prev) => !prev);
  };



  useEffect(() => {
    let autoPlayInterval: any;
    if (isAutoPlaying && currentCardIndex <= shuffledDeck.length - 1) {
      let cardCycleTime = 0;
      autoPlayInterval = setInterval(() => {
        if (cardCycleTime === 0) {
          // Show the question first
          isFlipped.value = false;
        }

        if (cardCycleTime === 1500) {
          // Show the answer after 1.5 seconds
          isFlipped.value = true;
        }

        if (cardCycleTime === 3000) {
          setCurrentCardIndex((prevIndex) =>
            prevIndex + 1 === shuffledDeck.length ? 0 : prevIndex + 1
          );
          isFlipped.value = false;
          cardCycleTime = 0;
          return;
        }

        cardCycleTime += 100;
      }, 200);
    } else {
      clearInterval(autoPlayInterval);
      setIsAutoPlaying(false);
    }

    return () => {
      clearInterval(autoPlayInterval);
    };
  }, [isAutoPlaying, currentCardIndex, shuffledDeck.length]);

  const FrontContent = () => {
    return (
      <Pressable onPress={handleShow} onLongPress={handleToggleFullscreen}>
        <View style={styles.card}>
          <Text style={styles.question}>
            {shuffledDeck[currentCardIndex].question}
          </Text>
        </View>
      </Pressable>

    )
  }

  const BackContent = () => {
    return (
      <Pressable onPress={handleShow} onLongPress={handleToggleFullscreen}>
        <View style={styles.card}>
          <Text style={styles.question}>
            {shuffledDeck[currentCardIndex].answer}
          </Text>
        </View>
      </Pressable>
    )
  }

  async function handleToggleFullscreen() {
    await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);
    console.log('is it fullscreen? ', isFullscreen);
    setIsFullscreen(!isFullscreen);
  }

  return (
    <View style={styles.container}>

      {!isFullscreen &&(
        <DeckHeader topic={topic} isFullscreen={isFullscreen} onToggleFullscreen={handleToggleFullscreen}/>
        
      )}
      

      {!isFullscreen && (
        <Text style={styles.progress}>
        {currentCardIndex + 1} of {shuffledDeck.length} cards
        </Text>
      )}

      <TouchableOpacity onPress={handleShow}>
        <FlipCard 
          isFlipped={isFlipped} 
          cardStyle={[styles.flipCard, isFullscreen && { height: 10, width: 200}]}
          direction='y'
          duration={500}
          FrontContent={FrontContent}
          BackContent={BackContent}
        />
      </TouchableOpacity>

      {!isFullscreen && (
        <ProgressBar
        totalCards={shuffledDeck.length}
        currentCardIndex={currentCardIndex}/>
      )}

      {!isFullscreen && (
        <DeckButtons
          topic={topic}
          currentCardIndex={currentCardIndex}
          handleShuffle={handleShuffle}
          handleShow={handleShow}
          handleAutoPlay={handleAutoPlay}
          handlePrevCard={handlePrevCard}
          handleNextCard={handleNextCard}
          isAutoPlaying={isAutoPlaying}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#fff",
  },
  progress: {
    fontSize: 16,
    color: "#718096",
    textAlign: "center",
    marginVertical: 20,
  },
  card: {
    backgroundColor: "#F7FAFC",
    borderRadius: 10,
    padding: 20,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
    height: 400,
  },
  question: {
    fontSize: 18,
    textAlign: "center",
    fontWeight: "400",
    lineHeight: 30,
  },
  flipCard: {
    width: '100%',
    height: 400
  },
  fullscreenIcon: {
    position: 'absolute',
    top: 10,
    right: 10,
  },
});
