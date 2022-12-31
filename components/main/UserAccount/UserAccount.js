import { Feather, FontAwesome5 } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as Updates from 'expo-updates';
import firebase from "firebase/compat";
import React, { useEffect, useLayoutEffect, useState } from 'react';
import { Image, Text, TextInput, TouchableOpacity } from 'react-native';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { Spinner, Button, View } from 'native-base';
import { container, form, navbar, text, utils } from './../../styles.js';
require('firebase/compat/firestore');

function Edit(props) {
    const [imageChanged, setImageChanged] = useState(false);
    const [hasGalleryPermission, setHasGalleryPermission] = useState(null);
    const [UserData, setUserData] = useState({
        name:"",
        description:"",
        photoURL:""
    })
    const onLogout = async () => {
        firebase.auth().signOut();
        Updates.reloadAsync()
    }

    useEffect(() => {
        getUserDetails();
    }, []);

    useLayoutEffect(() => {
        props.navigation.setOptions({
            headerRight: () => (
                <Feather name="check" size={24}  onPress={() =>Save() } />
            ),
        });
    }, [props.navigation, UserData]);


    const pickImage = async () => {
        if (true) {
            let result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [1, 1],
                quality: 1,
            });

            if (!result.canceled) {
                if(result?.uri){
                    setUserData((UserData)=>({
                        ...UserData,
                        photoURL:result?.uri
                    }))
                    setImageChanged(true);
                }
            }
        }
    };


    const Save = async () => {
        console.log("imageChanged", imageChanged)
        if (imageChanged) {
            const uri = UserData?.photoURL;
            const childPath = `profile/${firebase.auth().currentUser.uid}`;

            const response = await fetch(uri);
            const blob = await response.blob();

            const task = firebase
                .storage()
                .ref()
                .child(childPath)
                .put(blob);

            const taskProgress = snapshot => {
                console.log(`transferred: ${snapshot.bytesTransferred}`)
            }

            const taskCompleted = () => {
                task.snapshot.ref.getDownloadURL().then((snapshot) => {
                    console.log("snapshot", snapshot)
                    firebase.firestore().collection("users")
                        .doc(firebase.auth().currentUser.uid)
                        .update({
                            name:UserData?.name,
                            description:UserData?.description,
                            photoURL: snapshot,
                        }).then(() => {
                            setImageChanged(false);
                            setImageChanged(false);
                            props.navigation.goBack();
                        })
                })
            }

            const taskError = snapshot => {
                console.log(snapshot)
            }

            task.on("state_changed", taskProgress, taskError, taskCompleted);
        } else {
            saveData({
                name:UserData?.name,
                description:UserData?.description,
            })
        }
        getUserDetails();
    }

    const saveData = (data) => {
        console.log("data", data, UserData)
        firebase.firestore().collection("users")
            .doc(firebase.auth().currentUser.uid)
            .update({
                name:UserData?.name,
                description:UserData?.description
            }).then(() => {
                props.navigation.goBack()
            })
    }

    const getUserDetails = () =>{
        firebase?.firestore().collection('users').doc(firebase?.auth().currentUser?.uid).get().then(docSnap=>{
            setUserData({
                ...docSnap.data(),
                name:docSnap.data()?.name,
                description:docSnap.data()?.description,
            })
         })
    }

    if(!UserData?.uid){
        return (
            <View style={{flex:1,display:"flex",alignItems:'center',justifyContent:'center'}}>
                <Spinner size={40}/>
            </View>
        )
    }
    // console.log("UserData", UserData)
    return (
        <View style={container.form}>
            <TouchableOpacity style={[utils.centerHorizontal, utils.marginBottom]} onPress={() => pickImage()} >
                {UserData?.photoURL == '' ?
                    (
                        <FontAwesome5
                            style={[utils.profileImageBig, utils.marginBottomSmall]}
                            name="user-circle" size={120} color="black" />
                    )
                    :
                    (
                        <Image
                            style={[utils.profileImageBig, utils.marginBottomSmall]}
                            source={{uri:UserData?.photoURL}}
                        />
                    )
                }
                <Text style={text.changePhoto}>Change Profile Photo</Text>
            </TouchableOpacity>
            <View mt={16}>
            <TextInput
                value={UserData?.name}
                style={form.textInput}
                placeholder="Name"
                onChangeText={(name) => setUserData((UserData)=>({...UserData, name:name}))}
            />
            <TextInput
                value={UserData?.description}
                style={[form.textInput]}
                placeholderTextColor={"#e8e8e8"}
                placeholder="Description"
                onChangeText={(description) =>setUserData((UserData)=>({...UserData, description:description})) }
            />
            <Button mb={3}
                title="Logout"
                onPress={() =>Save() } >Save</Button>
                 <Button
                 variation={"outline"}
                title="Logout"
                onPress={() => onLogout()} >Logout</Button>
            </View>
        </View>

    )
}

const mapStateToProps = (store) => ({
    currentUser: store.userState.currentUser,
})
export default connect(mapStateToProps)(Edit);