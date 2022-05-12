import { createContext, useContext, useEffect, useState } from "react";

const FormCaptureContext = createContext({
	updateKey: () => {},
	values: {}
});

export function useCapturedProviderValue() {
	const [capturedValues, setCapturedValues] = useState({});

	/** @type {function} */
	const updateKey = (key, value) => {
		setCapturedValues(oldState => {
			const newValue = { ...oldState };
			newValue[key] = value;
			return newValue;
		});
	};

	return {
		updateKey: updateKey,
		values: capturedValues
	};
}

export function ImmediateCapturedProvider({ value, children }) {
	return (
		<FormCaptureContext.Provider value={value}>
			{children}
		</FormCaptureContext.Provider>
	);
}

export function CapturedProvider({ children }) {
	const capturedProviderValue = useCapturedProviderValue();

	return (
		<FormCaptureContext.Provider value={capturedProviderValue}>
			{children}
		</FormCaptureContext.Provider>
	);
}

export function useCapturedValues() {
	return useContext(FormCaptureContext).values;
}

export default function useCapturedState(name, defaultValue = "") {
	const capturedProviderValue = useContext(FormCaptureContext);
	const { values, updateKey } = capturedProviderValue;
	const defined = (name in values);

	useEffect(() => {
		updateKey(name, defaultValue);
	}, []);

	return [defined ? values[name] : defaultValue, val => updateKey(name, val)];
}