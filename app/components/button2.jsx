import { TouchableOpacity, Text } from "react-native";



const Button = ({title, style, icon, textStyle, onPress})=>{
    return(
        <TouchableOpacity onPress={onPress} style={{backgroundColor:'#C9A84C', height:65, borderRadius:30, justifyContent:'center', ...style, flexDirection:'row', alignItems:'center', }}>

            {
                icon && icon

            }

            <Text style={{alignSelf:'center', color: '#C9A84C', fontSize:18, fontFamily:'bold', ...textStyle}}>{title}</Text>

        </TouchableOpacity>

    )
}


export default Button;