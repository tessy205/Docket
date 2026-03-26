import { SafeAreaView } from "react-native-safe-area-context";  
import { Dimensions } from "react-native";  


const DocSafeView =({children, bgColor}) =>{

    const{width} = Dimensions.get('screen');


    return(
            <SafeAreaView style={{flex: 1, backgroundColor: bgColor}}>
                {children}
            </SafeAreaView>
    )
}

export default DocSafeView;