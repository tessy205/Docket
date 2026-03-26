import { SafeAreaView } from "react-native-safe-area-context"
import { TouchableWithoutFeedback , Dimensions, Keyboard} from "react-native"


const FSafeView = ({children, bgColor, style})=>{


    const {width} = Dimensions.get('screen');


    return(
        <TouchableWithoutFeedback onPress={()=>{
            Keyboard.dismiss()

        }}>
            <SafeAreaView style={{paddingHorizontal: width * 0.06, backgroundColor: bgColor ? bgColor : 'white',flex:1}}>
                {children}
            </SafeAreaView>
        </TouchableWithoutFeedback>

    )
}

export default FSafeView;