# UseCapturedState()
A simple hook that allows a parent element to access a specific slice of state from its children.  
Perfect for quick forms and related components without needing to explicitly pass props down from a parent element!  
[API Documentation can be found here!](https://malee31.github.io/use-captured-state)

# Quick Start Example
The following is a full example of how to use most of the exports provided by use-captured-state. The example shows a very simple form
```js
// Importing all items from use-captured-state for examples
import useCapturedState, {ImmediateCapturedProvider, CapturedProvider, useCapturedProviderValue, useCaptureContextValue, useCapturedValues} from "use-captured-state";

// A form that uses ImmediateCapturedProvider so that it can access captured values
export default function SomeForm() {
    // If capturedProviderValue is not needed in the component with the ImmediateCaptureProvider, remove this line and use <CapturedProvider> instead of <ImmediateCapturedProvider value={capturedProviderValue}>
    const capturedProviderValue = useCapturedProviderValue();
    const values = capturedProviderValue.values; // Access captured values
    console.log(values); // Logs {} the first time then {first: "defaultValue", second: ""}
    
    return (
        <ImmediateCapturedProvider value={capturedProviderValue}>
            <div style={{
                width: "100%",
                display: "flex",
                flexDirection: "column",
                alignItems: "center"
            }}>
                <h1>Basic Form</h1>
                <p>Basic usage of useCapturedState()</p>
                <SomeInput name="first"/>
                <p>Basic usage of useCapturedState() and useCapturedValues()</p>
                <SomeDependentInput name="second" dependsOn="first"/>
                <p>Values: First - ({values.first}), Second - ({values.second})</p>
            </div>
        </ImmediateCapturedProvider>
    );
}

function SomeInput({ name }) {
    const [value, setValue] = useCapturedState(name, "Default Value");
    
    return (
        <input
            type="text"
            value={inputValue}
            placeholder={name}
            onChange={(e) => {setValue(e.target.value)}}
        />
    );
}

function SomeDependentInput({ name, dependsOn }) {
    // Default value of "" is used if no default value is provided
    const [value, setValue] = useCapturedState(name);
    const allValues = useCapturedValues();
    
    return (
        <input
            type="text"
            disabled={typeof allValues[dependsOn] === "string" && allValues[dependsOn.length !== 0]}
            value={inputValue}
            placeholder={name}
            onChange={(e) => {setValue(e.target.value)}}
        />
    );
}
```

# Contribution: Notes About Debugging and Working on this Source Code
After hours of suffering through StackOverflow and documentation, I finally got Webpack to make something that can be imported by another React project.  
Remember to use `npm link ../main-app/node_modules/react` from this directory in order to force this project to use one shared React instance and not crash when using a hook.  
_WARNING: Figuring that out along with tinkering with webpack.config.js has cost me hours_