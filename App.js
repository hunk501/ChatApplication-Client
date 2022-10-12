import React, { useEffect, useState } from "react";
import { SafeAreaView, View, Text, Button, Platform, StyleSheet } from "react-native";
import { FileSystem, Dirs } from "react-native-file-access";

const App = () => {

  const [isConnected, setConnected] = useState(false);

  useEffect(() => {
    console.log('Use Effect');
    console.log(Platform.OS);
    console.log(Dirs.DocumentDir);
  }, []);

  const handleBtnPress = () => {
    console.log('Button press');

    const fileUrl = `${Dirs.DocumentDir}/sample_file.png`;
    const wss = new WebSocket("ws://192.168.1.6:8989");
    wss.binaryType = "blob";
    wss.onmessage = (evt) => {
      //console.log('Message: ', evt.data.toString());
      if(evt.data instanceof Blob) {
        
        const fr = new FileReader();
        fr.readAsDataURL(evt.data);
        fr.onload = async () => {

          const data = fr.result.split('base64,')[1];

          await FileSystem.appendFile(fileUrl, data, 'base64')
            .then(() => {
              console.log(`Saved file: ${fileUrl}`);
            })
            .catch((e) => {
              console.log('[FileSystem-Error]: ', e);
            });
        };
        fr.onloadend = () => {
          console.log('File reader end');
        };

      } else {
        console.log("Type is not Blob");
      }
    };
    wss.onopen = () => {
      console.log('Connected');
      setConnected(true);
      /**
       * Send message
       */
      wss.send('Hello from react native android');
    };
    wss.onerror = (e) => {
      console.log('ErrorXD: ', e.message);
    };
    wss.onclose = () => {
      console.log('Connection is closed');
      setConnected(false);
    }

  };

  return(
    <SafeAreaView>
      <View>
        <Text>Chat Client</Text>
        <Text>Status: { isConnected ? 'Connected':'Disconnected' }</Text>
        <Button title="Connect to Server" onPress={() => handleBtnPress() } style={ styles.btnConnect }/>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  btnConnect: {
    padding: 10,
    marginTop: 40,
    fontSize: 14
  }
});

export default App;