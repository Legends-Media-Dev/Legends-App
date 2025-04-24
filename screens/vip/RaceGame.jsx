import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
  Alert,
} from "react-native";

const { width, height } = Dimensions.get("window");
const lanePositions = [width * 0.25, width * 0.75]; // Left and right lanes

const RaceGame = ({ navigation }) => {
  const [playerLane, setPlayerLane] = useState(0);
  const [obstacleLane, setObstacleLane] = useState(Math.round(Math.random()));
  const playerY = useRef(new Animated.Value(height - 150)).current;
  const obstacleY = useRef(new Animated.Value(0)).current;
  const [gameOver, setGameOver] = useState(false);

  useEffect(() => {
    startObstacleAnimation();
  }, []);

  const startObstacleAnimation = () => {
    Animated.timing(obstacleY, {
      toValue: height,
      duration: 2500,
      useNativeDriver: true,
    }).start(() => {
      checkCollision();
      if (!gameOver) {
        // Reset and rerun
        setObstacleLane(Math.round(Math.random()));
        obstacleY.setValue(0);
        startObstacleAnimation();
      }
    });
  };

  const checkCollision = () => {
    if (playerLane === obstacleLane) {
      setGameOver(true);
      Alert.alert("💥 You Lost!", "You hit an obstacle. Try again!", [
        {
          text: "Retry",
          onPress: () => restartGame(),
        },
      ]);
    }
  };

  const restartGame = () => {
    setGameOver(false);
    setPlayerLane(0);
    setObstacleLane(Math.round(Math.random()));
    obstacleY.setValue(0);
    startObstacleAnimation();
  };

  const handleMove = (direction) => {
    if (direction === "left" && playerLane === 1) {
      setPlayerLane(0);
    } else if (direction === "right" && playerLane === 0) {
      setPlayerLane(1);
    }
  };

  const handleWin = () => {
    setGameOver(true);
    Alert.alert("🏁 You Won!", "Here’s your VIP discount!", [
      {
        text: "Claim",
        onPress: () => navigation.goBack(), // Or navigate to a reward screen
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🏎️ Beat Dustin in the Race!</Text>

      <View style={styles.raceTrack}>
        {/* Obstacle */}
        <Animated.View
          style={[
            styles.obstacle,
            {
              transform: [
                { translateY: obstacleY },
                {
                  translateX: new Animated.Value(
                    lanePositions[obstacleLane] - 25
                  ),
                },
              ],
            },
          ]}
        />

        {/* Player */}
        <Animated.View
          style={[
            styles.player,
            {
              left: lanePositions[playerLane] - 25,
              bottom: 100,
            },
          ]}
        />
      </View>

      <View style={styles.controls}>
        <TouchableOpacity
          style={styles.controlButton}
          onPress={() => handleMove("left")}
        >
          <Text style={styles.controlText}>⬅️</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.controlButton}
          onPress={() => handleMove("right")}
        >
          <Text style={styles.controlText}>➡️</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.winButton} onPress={handleWin}>
        <Text style={styles.winText}>Fake Win (Test)</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FAFAFA",
    paddingTop: 50,
    alignItems: "center",
  },
  title: {
    fontSize: 20,
    fontFamily: "Futura-Bold",
    marginBottom: 20,
    color: "#000",
  },
  raceTrack: {
    flex: 1,
    width: "100%",
    backgroundColor: "#EFEFEF",
    position: "relative",
    justifyContent: "flex-end",
  },
  player: {
    position: "absolute",
    width: 50,
    height: 50,
    backgroundColor: "#000",
    borderRadius: 10,
  },
  obstacle: {
    position: "absolute",
    width: 50,
    height: 50,
    backgroundColor: "#C8102F",
    borderRadius: 10,
    top: 0,
  },
  controls: {
    flexDirection: "row",
    marginBottom: 30,
  },
  controlButton: {
    backgroundColor: "#000",
    padding: 20,
    marginHorizontal: 20,
    borderRadius: 10,
  },
  controlText: {
    fontSize: 20,
    color: "#fff",
  },
  winButton: {
    marginBottom: 30,
    paddingVertical: 12,
    paddingHorizontal: 30,
    backgroundColor: "#C8102F",
    borderRadius: 100,
  },
  winText: {
    color: "#fff",
    fontFamily: "Futura-Bold",
    fontSize: 14,
  },
});

export default RaceGame;
