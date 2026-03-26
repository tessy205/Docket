import { View, Text, Image, StyleSheet } from "react-native"
import Ionicons from '@expo/vector-icons/Ionicons';
import AntDesign from '@expo/vector-icons/AntDesign';
import { postStyles } from "./styles"

const Post = ({title, body, image})=>{
    return(
        <View style={postStyles.contain}>
            <Text style={postStyles.heading} >{title}</Text>

            <Text style={postStyles.head}>{body}</Text>
            <Image style={{height:150, width:150, alignSelf:'center'}} source={image}/>
            {/* <Ionicons name="checkmark-circle" size={32} color="green" />
            <AntDesign name="like" size={24} color="black" /> */}

        </View>
    )
}


export default Post

