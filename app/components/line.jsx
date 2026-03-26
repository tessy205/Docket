import { View, ScrollView } from "react-native"



const Line = ({style, style1, style2, style3})=>{
return(

    <ScrollView horizontal contentContainerStyle={{marginBottom:50, gap:10}} style={{...style}}>
         <View style={{backgroundColor:'#99C6FF',  width:150, height:3,  ...style1}}>
        </View>

         <View style={{backgroundColor:'#99C6FF', width:150, height:3, ...style2}}>
        </View>

         <View style={{backgroundColor:'#99C6FF', width:150, height:3, ...style3}}>
        </View>
    </ScrollView>
)


}

export default Line;