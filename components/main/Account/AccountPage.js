import { View, Text,ActivityIndicator ,StyleSheet,Image} from 'react-native'
import Feather from 'react-native-vector-icons/Feather'
import {Button} from 'react-native-paper'
import firebase from "firebase/compat";
import React, { useEffect, useLayoutEffect, useState, useRef } from 'react';
import { container, form, navbar, text, utils } from './../../styles.js';


export default function AccountScreen(props) {
    const { uid } = props?.route?.params
     const [profile,setProfile] = useState({})
     useLayoutEffect(()=>{
        props.navigation.setOptions({
            title:profile.username
        })
    },[profile])
     useEffect(()=>{
        firebase?.firestore().collection('users').doc(uid).get().then(docSnap=>{
        setProfile(docSnap.data())
     })
     },[]);
     console.log("profile",profile)
     if(profile?.uid === undefined){
        return  <ActivityIndicator size="large" color="#00ff00" />
    }
    return (
        <View style={styles.container}>
                <View style={[utils.centerHorizontal, utils.marginBottom]}  >
                    <Image style={styles.img} source={{uri:profile.photoURL}} />
                </View>
                <Text style={styles.text}>Name - {profile.fullname}</Text>
                <View style={{display:"flex", alignItem:"center", flexDirection:"row", justifyContent:"center"}}  >
                    <Feather name="mail" size={25} color="black" />
                    <Text style={[styles.text,{marginLeft:10}]}>{profile.email}</Text>
                </View>
            {firebase?.auth().currentUser.uid === uid && <Button
                    style={styles.btn}
                    mode="contained"
                    onPress={()=>{
                        firestore().collection('users')
                        .doc(uid)
                        .update({
                        status:new Date()
                        }).then(()=>{
                            firebase?.auth().signOut()
                        })
                    }}
                >Logout</Button>}
        </View>
    )
}


const styles = StyleSheet.create({
    container:{
        flex:1,
        padding: 20,
    },
    img:{
        width:200,
        height:200,
        borderRadius:100,
        borderWidth:3,
        borderColor:"lightgrey",
        marginBottom:30
    },
    text:{
        fontSize:18,
        marginBottom:30,
        color:"black",
        textAlign:"center"
    },
    btn:{
        borderWidth:3
    }
})