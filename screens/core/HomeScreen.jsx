import React, { Component } from "react";
import { Animated, StatusBar, StyleSheet, View, TouchableOpacity } from "react-native";
import { TabView, SceneMap } from 'react-native-tab-view';
import NewsScreen from "../homeTabViews/NewsScreen";
import ForYouScreen from "../homeTabViews/ForYouScreen";

class HomeScreen extends Component {
  constructor(props) {
    super(props);

    this.state = {
      index: 0,
      routes: [
        { key: "news", title: "NEWS" },
        { key: "forYou", title: "FOR YOU" },
      ],
    };
  }

  _handleIndexChange = (index) => {
    this.setState({ index });
  };

  _renderTabBar = (props) => {
    const inputRange = props.navigationState.routes.map((x, i) => i);
  
    return (
      <View style={styles.tabBarContainer}>
        <View style={styles.tabBarLine}/>
        <View style={styles.tabBar}>
          {props.navigationState.routes.map((route, i) => {
            const opacity = props.position.interpolate({
              inputRange,
              outputRange: inputRange.map((inputIndex) =>
                inputIndex === i ? 1 : 0.5
              ),
            });
  
            return (
              <TouchableOpacity
                key={route.key}
                style={styles.tabItem}
                onPress={() => this.setState({ index: i })}
              >
                <Animated.Text style={[styles.tabText, { opacity }]}>
                  {route.title}
                </Animated.Text>
                {this.state.index === i && <View style={styles.activeTabLine} />}
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    );
  };  

  _renderScene = SceneMap({
    news: NewsScreen,
    forYou: ForYouScreen,
  });

  render() {
    return (
      <TabView
        navigationState={this.state}
        renderScene={this._renderScene}
        renderTabBar={this._renderTabBar}
        onIndexChange={this._handleIndexChange}
      />
    );
  }
}



const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  tabItem: {
    flex: 1,
    alignItems: "center",
    padding: 16,
  },
  tabText: {
    fontSize: 15,
    fontFamily: "Futura-Medium",
  },
  tabBarContainer: {
    backgroundColor: "#fff",
  },
  tabBarLine: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: "#e0e0e0", // light grey line
    zIndex: 0,
  },
  tabBar: {
    flexDirection: "row",
    paddingTop: StatusBar.currentHeight,
    position: "relative",
    zIndex: 1, // ensures active red line appears above the grey one
  },
  activeTabLine: {
    position: "absolute",
    bottom: 0,
    right: "10%",
    left: "10%",
    height: 2,
    backgroundColor: "red",
    borderRadius: 1,
  },
});

export default HomeScreen;