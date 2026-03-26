import { TouchableOpacity, Text } from "react-native";



const Button = ({text, style, icon, textColor, onPress})=>{
    return(
        <TouchableOpacity onPress={onPress} style={{backgroundColor:'#C9A84C', height:65, borderRadius:30, justifyContent:'center', ...style, flexDirection:'row', alignItems:'center', }}>

            {
                icon && icon

            }
            <Text style={{alignSelf:'center', color: textColor ? textColor :'black', fontSize:18, fontFamily:'bold'}}>{text}</Text>

        </TouchableOpacity>

    )
}


export default Button;