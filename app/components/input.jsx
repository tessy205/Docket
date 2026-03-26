import { View, TextInput , StyleSheet, Text} from "react-native";


const Input = ({placeholder, label, type})=>{

    return(
        <View style={styles.container}>

            <Text style={{marginBottom:10}}>{label}</Text>

            <TextInput keyboardType={type} style={{paddingLeft:20, height:50, backgroundColor:'white', borderRadius:12}} placeholderTextColor={'black'} placeholder={placeholder} />

        </View>
    )

}


const styles = StyleSheet.create({

    container:{
        justifyContent:'center'

    }

})


export default Input;

