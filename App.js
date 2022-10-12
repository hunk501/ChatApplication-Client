import React, { useEffect, useState } from "react";
import { SafeAreaView, View, Text, Button, Platform, StyleSheet } from "react-native";
import { FileSystem, Dirs } from "react-native-file-access";
import RNFetchBlob from 'rn-fetch-blob';

const App = () => {

  const [isConnected, setConnected] = useState(false);

  useEffect(() => {
    console.log('Use Effect');
    console.log(Platform.OS);
    console.log(Dirs.DocumentDir);
    setConnected(false);
  }, []);

  /**
   * Send data to server
   */
  const handleReceiveData = () => {
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

  /**
   * Handle Send data to server
   */
  const handleSendData = () => {
    console.log('Button pressed');

    const wss = new WebSocket('ws://192.168.1.6:8989');
    wss.binaryType = "blob";
    wss.onopen = () => {
      console.log('Connected');
      setConnected(true);
    };
    wss.onmessage = async (evt) => {
      if(evt.data instanceof Blob) {
        console.log('Incoming Msg Blob');
        //console.log(evt.data.toString());
        const fileR = new FileReader();
        fileR.readAsDataURL(evt.data);
        fileR.onload = async () => {
          console.log('Reading stream');

          const data = fileR.result.split('base64,')[1];
          //console.log(fileR.result.split('base64,')[0]);
          //console.log(data.substring(1, 20));
          const filename = `${Dirs.DocumentDir}/sample_file-copy.png`;
          await FileSystem.appendFile(filename, data, 'base64')
            .then(() => console.log(`save ${filename}`))
            .catch(() => console.log('MyError: ', e));
        };
        fileR.onloadend = () => {
          console.log('Done');
        }
      } else {
        console.log('Incoming String');
        console.log(evt.data.toString());
      }
    };
    wss.onerror = (e) => {
      console.log('MyError: ', e);
    }
    wss.onclose = () => {
      setConnected(false);
      console.log('Disconnected');
    };

    setTimeout( async () => {
      const fileUrl = `${Dirs.DocumentDir}/sample_file.png`;
      
      RNFetchBlob.fs.readStream(fileUrl, 'base64')
        .then((stream) => {
          stream.open();
          stream.onData((chunk) => {
            setTimeout(() => {
              wss.send(chunk);
            }, 2000);
          });
          stream.onEnd(() => console.log("End Reading"));
          stream.onError((e) => console.log("RNFetchBlob: ", e));
        })
        .catch((e) => console.log('Catch: ', e));

    }, 2000);
  };

  return(
    <SafeAreaView>
      <View>
        <Text>Chat Client</Text>
        <Text>Status: { isConnected ? 'Connected':'Disconnected' }</Text>
        <Button title="Receive Data to Server" onPress={() => handleReceiveData() } style={ styles.btnConnect }/>
        <Text>Status: { isConnected ? 'Connected':'Disconnected' }</Text>
        <Button title="Send Data to Server" onPress={ () => handleSendData() }/>
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