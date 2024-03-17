import React from 'react';
import {StatusBar, useColorScheme, View} from 'react-native';
import {Colors} from 'react-native/Libraries/NewAppScreen';
import LiquidGaugeProgress from './LiquidGaugeProgress';

function App(): React.JSX.Element {
  const isDarkMode = useColorScheme() === 'dark';

  const backgroundStyle = {
    backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
  };

  return (
    <View style={[backgroundStyle, {flex: 1}]}>
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor={backgroundStyle.backgroundColor}
      />
      <View style={{alignItems: 'center', top: 280}}>
        <LiquidGaugeProgress size={140} value={50} />
      </View>
    </View>
  );
}

export default App;
